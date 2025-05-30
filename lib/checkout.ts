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
import { eq, and, gte, lte } from 'drizzle-orm';
import { calculateItemPrice } from '@/lib/pricing';
import { formatVND } from '@/lib/utils/currency';

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

// Updated interface to match the validation schema
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
  paymentMethod: 'COD' | 'BANKING' | 'ZALOPAY' | 'MOMO' | 'VNPAY'; // Added all payment methods
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
  items: CartItemWithBook[];
}

// Get user's cart items with book details
export async function getUserCartItems(clerkId: string): Promise<CartItemWithBook[]> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

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
    console.error('Error fetching cart items:', error);
    throw new Error('Failed to fetch cart items');
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
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá' };
  }
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${timestamp.slice(-8)}${random}`;
}

// Comprehensive server-side validation function
function validateCheckoutData(checkoutData: CheckoutData): string | null {
  // Full name validation
  if (!checkoutData.customerInfo.fullName?.trim()) {
    return 'Vui lòng nhập họ và tên';
  }
  if (checkoutData.customerInfo.fullName.trim().length < 2) {
    return 'Họ và tên phải có ít nhất 2 ký tự';
  }
  if (checkoutData.customerInfo.fullName.trim().length > 100) {
    return 'Họ và tên không được quá 100 ký tự';
  }

  // Email validation
  if (!checkoutData.customerInfo.email?.trim()) {
    return 'Vui lòng nhập email';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(checkoutData.customerInfo.email.trim())) {
    return 'Email không hợp lệ';
  }

  // Phone validation
  if (!checkoutData.customerInfo.phone?.trim()) {
    return 'Vui lòng nhập số điện thoại';
  }
  const phoneClean = checkoutData.customerInfo.phone.replace(/\D/g, '');
  if (!/^[0-9]{10,11}$/.test(phoneClean)) {
    return 'Số điện thoại phải có 10-11 chữ số';
  }

  // Address validation
  if (!checkoutData.customerInfo.address?.trim()) {
    return 'Vui lòng nhập địa chỉ';
  }
  if (checkoutData.customerInfo.address.trim().length < 5) {
    return 'Địa chỉ phải có ít nhất 5 ký tự';
  }
  if (checkoutData.customerInfo.address.trim().length > 200) {
    return 'Địa chỉ không được quá 200 ký tự';
  }

  // City validation
  if (!checkoutData.customerInfo.city?.trim()) {
    return 'Vui lòng nhập tỉnh/thành phố';
  }

  // District validation
  if (!checkoutData.customerInfo.district?.trim()) {
    return 'Vui lòng nhập quận/huyện';
  }

  // Notes validation (optional)
  if (checkoutData.customerInfo.notes && checkoutData.customerInfo.notes.length > 500) {
    return 'Ghi chú không được quá 500 ký tự';
  }

  // Payment method validation
  const validPaymentMethods = ['COD', 'BANKING', 'ZALOPAY', 'MOMO', 'VNPAY'];
  if (!validPaymentMethods.includes(checkoutData.paymentMethod)) {
    return 'Vui lòng chọn phương thức thanh toán hợp lệ';
  }

  return null; // No validation errors
}

// Create order with comprehensive server-side validation
export async function createOrder(
  clerkId: string,
  checkoutData: CheckoutData,
  orderSummary: OrderSummary,
  couponData?: any,
) {
  try {
    // Server-side validation using the comprehensive validation function
    const validationError = validateCheckoutData(checkoutData);
    if (validationError) {
      throw new Error(validationError);
    }

    // Additional business logic validations
    if (orderSummary.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    if (orderSummary.total <= 0) {
      throw new Error('Tổng đơn hàng không hợp lệ');
    }

    // Check if order requires premium payment method (orders >= 1M VND)
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

    // Check stock availability for all items
    for (const item of orderSummary.items) {
      const currentBook = await db
        .select({ availableCopies: books.availableCopies })
        .from(books)
        .where(eq(books.id, item.bookId))
        .limit(1);

      if (!currentBook[0] || currentBook[0].availableCopies < item.quantity) {
        throw new Error(`Sách "${item.book.title}" không đủ số lượng trong kho`);
      }
    }

    const result = await db.transaction(async (tx) => {
      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: clerkId,
          shippingFullName: checkoutData.customerInfo.fullName.trim(),
          shippingPhone: checkoutData.customerInfo.phone.replace(/\D/g, ''),
          shippingEmail: checkoutData.customerInfo.email.trim().toLowerCase(),
          shippingAddress: checkoutData.customerInfo.address.trim(),
          shippingCity: checkoutData.customerInfo.city.trim(),
          shippingDistrict: checkoutData.customerInfo.district.trim(),
          shippingWard: checkoutData.customerInfo.ward?.trim() || null,
          subtotal: orderSummary.subtotal,
          shippingFee: orderSummary.shippingFee,
          couponDiscount: orderSummary.couponDiscount,
          totalAmount: orderSummary.total,
          couponId: couponData?.id || null,
          couponCode: couponData?.code || null,
          paymentMethod: checkoutData.paymentMethod,
          notes: checkoutData.customerInfo.notes?.trim() || null,
          createdAt: new Date(),
        })
        .returning();

      // Create order items
      const orderItemsData = orderSummary.items.map((item) => ({
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        version: item.version,
        unitPrice: calculateItemPrice(item) / item.quantity,
        totalPrice: calculateItemPrice(item),
        createdAt: new Date(),
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // Update coupon usage count if applicable
      if (couponData?.id) {
        await tx
          .update(coupons)
          .set({ usedCount: (couponData.usedCount || 0) + 1 })
          .where(eq(coupons.id, couponData.id));
      }

      // Clear user's cart
      await tx.delete(carts).where(eq(carts.userId, clerkId));

      // Update book inventory
      for (const item of orderSummary.items) {
        await tx
          .update(books)
          .set({
            availableCopies: Math.max(0, item.book.availableCopies - item.quantity),
          })
          .where(eq(books.id, item.bookId));
      }

      return order;
    });

    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Re-throw with original message if it's a validation error, otherwise use generic message
    if (error instanceof Error && (
      error.message.includes('Vui lòng') || 
      error.message.includes('không hợp lệ') ||
      error.message.includes('không được') ||
      error.message.includes('phải có') ||
      error.message.includes('yêu cầu') ||
      error.message.includes('không đủ') ||
      error.message.includes('trống') ||
      error.message.includes('không tồn tại')
    )) {
      throw error;
    }
    
    throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
  }
}