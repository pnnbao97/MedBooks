'use server';
import { db } from '@/database/drizzle';
import { 
  carts, 
  books, 
  orders, 
  orderItems, 
  coupons, 
  users 
} from '@/database/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { calculateItemPrice } from '@/lib/pricing';
import { formatVND } from '@/lib/utils/currency';
import axios from 'axios';
import crypto from 'crypto';
import { checkoutSchema } from '@/lib/validations';
import { z } from 'zod';

export interface CartItemWithBook {
  id: number;
  bookId: number;
  quantity: number;
  version: 'color' | 'photo';
  book: {
    id: number;
    title: string;
    slug: string;
    colorPrice: number;
    photoPrice: number;
    hasColorSale: boolean;
    colorSaleAmount: number;
    coverUrl: string;
    availableCopies: number;
  };
}

export interface CheckoutData {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward?: string;
    notes?: string;
  };
  paymentMethod: 'COD' | 'BANKING' | 'ZALOPAY' | 'MOMO' | 'VNPAY';
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
  items: CartItemWithBook[];
}

// ZaloPay configuration
const ZALOPAY_CONFIG = {
  app_id: process.env.ZALOPAY_APP_ID || '',
  key1: process.env.ZALOPAY_KEY1 || '',
  key2: process.env.ZALOPAY_KEY2 || '',
  endpoint: 'https://sb-open.zalopay.vn/v2/create',
};

// MoMo configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || '',
  accessKey: process.env.MOMO_ACCESS_KEY || '',
  secretKey: process.env.MOMO_SECRET_KEY || '',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
};

// VNPay configuration
const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE || '',
  hashSecret: process.env.VNPAY_HASH_KEY || '',
  url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/checkout/callback/vnpay',
};

// Get user's cart items with book details
export async function getUserCartItems(clerkId: string): Promise<CartItemWithBook[]> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('Người dùng không tồn tại');

    const cartItems = await db
      .select({
        id: carts.id,
        bookId: carts.bookId,
        quantity: carts.quantity,
        version: carts.version,
        book: {
          id: books.id,
          title: books.title,
          slug: books.slug,
          colorPrice: books.colorPrice,
          photoPrice: books.photoPrice,
          hasColorSale: books.hasColorSale,
          colorSaleAmount: books.colorSaleAmount,
          coverUrl: books.coverUrl,
          availableCopies: books.availableCopies,
        },
      })
      .from(carts)
      .innerJoin(books, eq(carts.bookId, books.id))
      .where(eq(carts.userId, clerkId));

    return cartItems.map((item) => ({
      ...item,
      book: {
        ...item.book,
        coverUrl: item.book.coverUrl ?? '',
      },
    }));
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    throw new Error('Không thể lấy giỏ hàng');
  }
}

// Validate coupon
export async function validateCoupon(code: string, orderAmount: number) {
  try {
    const coupon = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, code.toUpperCase()),
          eq(coupons.isActive, true),
          lte(coupons.validFrom, new Date()),
          gte(coupons.validTo, new Date()),
        ),
      )
      .limit(1);

    if (!coupon.length) {
      return { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
    }

    const couponData = coupon[0];

    if (couponData.usageLimit && (couponData.usedCount ?? 0) >= couponData.usageLimit) {
      return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    if (couponData.minOrderAmount && orderAmount < couponData.minOrderAmount) {
      return {
        valid: false,
        error: `Đơn hàng tối thiểu ${formatVND(couponData.minOrderAmount)} để sử dụng mã này`,
      };
    }

    let discountAmount = 0;
    if (couponData.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((orderAmount * parseFloat(couponData.discountValue.toString())) / 100);
      if (couponData.maxDiscountAmount && discountAmount > couponData.maxDiscountAmount) {
        discountAmount = couponData.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(parseFloat(couponData.discountValue.toString()), orderAmount);
    }

    return {
      valid: true,
      coupon: couponData,
      discountAmount,
      description: couponData.description || `Giảm ${formatVND(discountAmount)}`,
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra mã giảm giá:', error);
    return { valid: false, error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá' };
  }
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${timestamp.slice(-8)}${random}`;
}

// Validate checkout data
function validateCheckoutData(checkoutData: CheckoutData): string | null {
  try {
    checkoutSchema.parse(checkoutData);
    return null; // Valid
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return first error
      return error.errors[0]?.message || 'Dữ liệu không hợp lệ';
    }
    return 'Có lỗi xảy ra khi kiểm tra dữ liệu';
  }
}

// Create ZaloPay payment
async function createZaloPayPayment(order: any, checkoutData: CheckoutData, orderSummary: OrderSummary) {
  const transId = generateOrderNumber();
  const embedData = {
    redirecturl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/callback/zalopay`,
  };
  const items = orderSummary.items.map(item => ({
    itemid: item.bookId.toString(),
    itemname: item.book.title,
    itemprice: calculateItemPrice(item),
    itemquantity: item.quantity,
  }));

  const orderData = {
    app_id: ZALOPAY_CONFIG.app_id,
    app_user: checkoutData.customerInfo.email,
    app_time: Date.now(),
    amount: orderSummary.total,
    app_trans_id: `${new Date().toISOString().slice(0, 10).replace(/-/, '')}_${transId}`,
    embed_data: JSON.stringify(embedData),
    items: JSON.stringify(items),
    bank_code: '',
    description: `Thanh toán đơn hàng ${order.orderNumber}`,
    mac: '',
  };

  const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.items}`;
  orderData.mac = crypto.createHmac('sha256', ZALOPAY_CONFIG.key1).update(data).digest('hex');

  try {
    const response = await axios.post(ZALOPAY_CONFIG.endpoint, orderData);
    return { paymentUrl: response.data.order_url, transId: orderData.app_trans_id };
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán ZaloPay:', error);
    throw new Error('Không thể tạo thanh toán ZaloPay');
  }
}

// Create MoMo payment
async function createMoMoPayment(order: any, checkoutData: CheckoutData, orderSummary: OrderSummary) {
  const requestId = generateOrderNumber();
  const orderId = `MM${order.orderNumber}`;
  const orderInfo = `Thanh toán đơn hàng ${order.orderNumber}`;
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/callback/momo`;
  const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/momo`;
  const requestType = 'captureWallet';

  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${orderSummary.total}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');

  const data = {
    partnerCode: MOMO_CONFIG.partnerCode,
    partnerName: 'VMedBook',
    storeId: 'VMedBook',
    requestId,
    amount: orderSummary.total,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData: '',
    signature,
  };

  try {
    const response = await axios.post(MOMO_CONFIG.endpoint, data);
    return { paymentUrl: response.data.payUrl, transId: orderId };
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán MoMo:', error);
    throw new Error('Không thể tạo thanh toán MoMo');
  }
}

// Create VNPay payment
async function createVNPayPayment(order: any, checkoutData: CheckoutData, orderSummary: OrderSummary) {
  const createDate = new Date();
  const orderId = order.orderNumber;

  // Format dates as YYYYMMDDHHMMSS
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  // Tạo object params theo thứ tự alphabet như trong URL mẫu
  const paramsObj = {
    vnp_Amount: (orderSummary.total * 100).toString(),
    vnp_Command: 'pay',
    vnp_CreateDate: formatDate(createDate),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Thanh toan don hang :${orderId}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: 'https://vmedbook.com/checkout/callback/vnpay',
    vnp_TmnCode: VNPAY_CONFIG.tmnCode,
    vnp_TxnRef: orderId.toString(),
    vnp_Version: '2.1.0'
  };

  // Sort parameters alphabetically và tạo signData
  const sortedKeys = Object.keys(paramsObj).sort();
  const signData = sortedKeys
    .map(key => `${key}=${paramsObj[key as keyof typeof paramsObj]}`)
    .join('&');

  const secureHash = crypto
    .createHmac('sha512', VNPAY_CONFIG.hashSecret)
    .update(signData)
    .digest('hex');

  // Tạo URLSearchParams và thêm các tham số theo thứ tự
  const params = new URLSearchParams();
  sortedKeys.forEach(key => {
    params.append(key, paramsObj[key as keyof typeof paramsObj]);
  });
  params.append('vnp_SecureHash', secureHash);

  const paymentUrl = `${VNPAY_CONFIG.url}?${params.toString()}`;
  return { paymentUrl, transId: orderId };
}

// Atomic stock check and reserve
async function reserveBookStock(items: CartItemWithBook[]): Promise<{ success: boolean; error?: string }> {
  for (const item of items) {
    // Use atomic update with condition
    const result = await db
      .update(books)
      .set({
        availableCopies: sql`${books.availableCopies} - ${item.quantity}`,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(books.id, item.bookId),
          gte(books.availableCopies, item.quantity) // Only update if sufficient stock
        )
      )
      .returning({ id: books.id, newStock: books.availableCopies });

    if (result.length === 0) {
      // Rollback previously reserved books
      await rollbackBookReservation(items.slice(0, items.indexOf(item)));
      return { 
        success: false, 
        error: `Sách "${item.book.title}" không đủ số lượng trong kho` 
      };
    }
  }
  return { success: true };
}

// Rollback book reservation
async function rollbackBookReservation(items: CartItemWithBook[]) {
  for (const item of items) {
    try {
      await db
        .update(books)
        .set({
          availableCopies: sql`${books.availableCopies} + ${item.quantity}`,
          updatedAt: new Date()
        })
        .where(eq(books.id, item.bookId));
    } catch (error) {
      console.error(`Failed to rollback stock for book ${item.bookId}:`, error);
      // Log for admin manual fix
    }
  }
}

// Create order with improved error handling and atomic operations
export async function createOrder(
  clerkId: string,
  checkoutData: CheckoutData,
  orderSummary: OrderSummary,
  couponData?: any,
) {
  try {
    // Validation
    const validationError = validateCheckoutData(checkoutData);
    if (validationError) {
      throw new Error(validationError);
    }

    // Business logic validations
    if (orderSummary.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    if (orderSummary.total <= 0) {
      throw new Error('Tổng đơn hàng không hợp lệ');
    }

    if (orderSummary.total >= 1000000 && checkoutData.paymentMethod === 'COD') {
      throw new Error('Đơn hàng trên 1,000,000₫ yêu cầu thanh toán trước');
    }

    // Verify user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('Người dùng không tồn tại');

    // Step 1: Reserve stock atomically
    const stockReservation = await reserveBookStock(orderSummary.items);
    if (!stockReservation.success) {
      throw new Error(stockReservation.error);
    }

    let order;
    let shouldRollbackStock = true;

    try {
      // Step 2: Create order
      [order] = await db
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: clerkId,
          shippingAddressId: null,
          shippingFullName: checkoutData.customerInfo.fullName.trim(),
          shippingPhone: checkoutData.customerInfo.phone.replace(/\D/g, ''),
          shippingEmail: checkoutData.customerInfo.email.trim().toLowerCase(),
          shippingAddress: checkoutData.customerInfo.address.trim(),
          shippingCity: checkoutData.customerInfo.city.trim(),
          shippingDistrict: checkoutData.customerInfo.district.trim(),
          shippingWard: checkoutData.customerInfo.ward?.trim() || null,
          subtotal: Math.floor(orderSummary.subtotal),
          shippingFee: Math.floor(orderSummary.shippingFee),
          couponDiscount: Math.floor(orderSummary.couponDiscount),
          totalAmount: Math.floor(orderSummary.total),
          couponId: couponData?.id || null,
          couponCode: couponData?.code || null,
          paymentMethod: checkoutData.paymentMethod,
          paymentStatus: 'PENDING',
          paymentTransactionId: null,
          transactionId: null,
          status: 'PENDING',
          notes: checkoutData.customerInfo.notes?.trim() || null,
          createdAt: new Date(),
          updatedAt: null,
          shippedAt: null,
          deliveredAt: null,
        })
        .returning();

      // Step 3: Create order items
      const orderItemsData = orderSummary.items.map((item) => ({
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        version: item.version,
        unitPrice: Math.floor(calculateItemPrice(item) / item.quantity),
        totalPrice: Math.floor(calculateItemPrice(item)),
        createdAt: new Date(),
      }));
      await db.insert(orderItems).values(orderItemsData);

      // Step 4: Update coupon usage (if applicable)
      if (couponData?.id) {
        await db
          .update(coupons)
          .set({ 
            usedCount: sql`${coupons.usedCount} + 1`,
           
          })
          .where(eq(coupons.id, couponData.id));
      }

      // Step 5: Handle payment initialization
      let paymentResult;
      if (checkoutData.paymentMethod !== 'COD') {
        if (checkoutData.paymentMethod === 'ZALOPAY') {
          paymentResult = await createZaloPayPayment(order, checkoutData, orderSummary);
        } else if (checkoutData.paymentMethod === 'MOMO') {
          paymentResult = await createMoMoPayment(order, checkoutData, orderSummary);
        } else if (checkoutData.paymentMethod === 'VNPAY') {
          paymentResult = await createVNPayPayment(order, checkoutData, orderSummary);
        }

        // Update order with payment info
        if (paymentResult) {
          await db
            .update(orders)
            .set({
              transactionId: paymentResult.transId,
              paymentTransactionId: paymentResult.transId,
              updatedAt: new Date()
            })
            .where(eq(orders.id, order.id));
        }
      }

      // Step 6: Clear user's cart (only when everything succeeds)
      await db.delete(carts).where(eq(carts.userId, clerkId));

      // Success - no need to rollback stock
      shouldRollbackStock = false;

      return { 
        order, 
        paymentUrl: paymentResult?.paymentUrl 
      };

    } catch (error) {
      console.error('Error in order creation process:', error);
      
      // Cleanup order if created
      if (order?.id) {
        try {
          await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
          await db.delete(orders).where(eq(orders.id, order.id));
          
          // Rollback coupon if updated
          if (couponData?.id) {
            await db
              .update(coupons)
              .set({ 
                usedCount: sql`GREATEST(0, ${coupons.usedCount} - 1)`,
                
              })
              .where(eq(coupons.id, couponData.id));
          }
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }
      
      throw error;
    } finally {
      // Rollback stock reservation if needed
      if (shouldRollbackStock) {
        await rollbackBookReservation(orderSummary.items);
      }
    }

  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    
    // User-friendly error messages
    if (error.message.includes('Vui lòng') || 
        error.message.includes('không hợp lệ') ||
        error.message.includes('không được') ||
        error.message.includes('phải có') ||
        error.message.includes('yêu cầu') ||
        error.message.includes('không đủ') ||
        error.message.includes('trống') ||
        error.message.includes('không tồn tại')) {
      throw error;
    }
    
    throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
  }
}

// Check order consistency (can run periodically)
export async function validateOrderConsistency(orderId: number) {
  const order = await db
    .select()
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.id, orderId));

  if (!order.length) return { valid: false, error: 'Order not found' };

  const calculatedTotal = order.reduce((sum, item) => {
    return sum + (item.order_items?.totalPrice || 0);
  }, 0);

  const actualTotal = order[0].orders.subtotal + order[0].orders.shippingFee - order[0].orders.couponDiscount;

  return {
    valid: Math.abs(calculatedTotal - actualTotal) < 1, // Allow 1 VND difference for rounding
    calculatedTotal,
    actualTotal,
    difference: Math.abs(calculatedTotal - actualTotal)
  };
}

// Handle ZaloPay callback
export async function handleZaloPayCallback(data: any, mac: string) {
  const dataStr = JSON.stringify(data);
  const verifyMac = crypto.createHmac('sha256', ZALOPAY_CONFIG.key2).update(dataStr).digest('hex');
  if (verifyMac !== mac) {
    throw new Error('Chữ ký ZaloPay không hợp lệ');
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.transactionId, data.app_trans_id))
    .limit(1);

  if (!order[0]) {
    throw new Error('Đơn hàng không tồn tại');
  }

  if (data.status === 1) {
    await db
      .update(orders)
      .set({ paymentStatus: 'PAID', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    return { success: true, orderId: order[0].orderNumber };
  } else {
    await db
      .update(orders)
      .set({ paymentStatus: 'FAILED', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    throw new Error('Thanh toán ZaloPay thất bại');
  }
}

// Handle MoMo callback
export async function handleMoMoCallback(data: any) {
  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
  const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');

  if (signature !== data.signature) {
    throw new Error('Chữ ký MoMo không hợp lệ');
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.transactionId, data.orderId))
    .limit(1);

  if (!order[0]) {
    throw new Error('Đơn hàng không tồn tại');
  }

  if (data.resultCode === 0) {
    await db
      .update(orders)
      .set({ paymentStatus: 'PAID', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    return { success: true, orderId: order[0].orderNumber };
  } else {
    await db
      .update(orders)
      .set({ paymentStatus: 'FAILED', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    throw new Error('Thanh toán MoMo thất bại');
  }
}

// Handle VNPay callback
export async function handleVNPayCallback(params: any) {
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = new URLSearchParams(
    Object.entries(params)
      .sort()
      .map(([k, v]) => [k, v?.toString() ?? ''])
  );
  const signData = sortedParams.toString();
  const checkSum = crypto.createHmac('sha512', VNPAY_CONFIG.hashSecret).update(signData).digest('hex');

  if (checkSum !== secureHash) {
    throw new Error('Chữ ký VNPay không hợp lệ');
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.transactionId, params.vnp_TxnRef))
    .limit(1);

  if (!order[0]) {
    throw new Error('Đơn hàng không tồn tại');
  }

  if (params.vnp_ResponseCode === '00') {
    await db
      .update(orders)
      .set({ paymentStatus: 'PAID', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    return { success: true, orderId: order[0].orderNumber };
  } else {
    await db
      .update(orders)
      .set({ paymentStatus: 'FAILED', updatedAt: new Date() })
      .where(eq(orders.id, order[0].id));
    throw new Error('Thanh toán VNPay thất bại');
  }
}