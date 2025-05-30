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
  paymentMethod: 'COD' | 'BANKING';
  couponCode?: string;
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

// Create order with server-side validation
export async function createOrder(
  clerkId: string,
  checkoutData: CheckoutData,
  orderSummary: OrderSummary,
  couponData?: any,
) {
  try {
    // Server-side validation
    if (!checkoutData.customerInfo.fullName?.trim()) {
      throw new Error('Thiếu thông tin họ tên');
    }
    if (!checkoutData.customerInfo.email?.trim() || !/\S+@\S+\.\S+/.test(checkoutData.customerInfo.email)) {
      throw new Error('Email không hợp lệ');
    }
    if (!checkoutData.customerInfo.phone?.trim() || !/^[0-9]{10,11}$/.test(checkoutData.customerInfo.phone.replace(/\D/g, ''))) {
      throw new Error('Số điện thoại không hợp lệ');
    }
    if (!checkoutData.customerInfo.address?.trim()) {
      throw new Error('Thiếu thông tin địa chỉ');
    }
    if (!checkoutData.customerInfo.district?.trim()) {
      throw new Error('Thiếu thông tin quận/huyện');
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: clerkId,
          shippingFullName: checkoutData.customerInfo.fullName,
          shippingPhone: checkoutData.customerInfo.phone,
          shippingEmail: checkoutData.customerInfo.email,
          shippingAddress: checkoutData.customerInfo.address,
          shippingCity: checkoutData.customerInfo.city,
          shippingDistrict: checkoutData.customerInfo.district,
          shippingWard: checkoutData.customerInfo.ward,
          subtotal: orderSummary.subtotal,
          shippingFee: orderSummary.shippingFee,
          couponDiscount: orderSummary.couponDiscount,
          totalAmount: orderSummary.total,
          couponId: couponData?.id,
          couponCode: couponData?.code,
          paymentMethod: checkoutData.paymentMethod,
          notes: checkoutData.customerInfo.notes,
          createdAt: new Date(),
        })
        .returning();

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

      if (couponData) {
        await tx
          .update(coupons)
          .set({ usedCount: (couponData.usedCount || 0) + 1 })
          .where(eq(coupons.id, couponData.id));
      }

      await tx.delete(carts).where(eq(carts.userId, clerkId));

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
    throw new Error('Failed to create order');
  }
}