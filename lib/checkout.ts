// lib/checkout.ts - API functions for checkout
'use server';
import { db } from '@/database/drizzle'; // Your database connection
import { 
  carts, 
  books, 
  orders, 
  orderItems, 
  coupons, 
  shippingAddresses,
  users 
} from '@/database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

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
  saveAddress?: boolean;
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
  items: CartItemWithBook[];
}

export interface ShippingAddress {
  id: number;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward?: string;
  isDefault: boolean;
  createdAt: Date;
}

// Get user's cart items with book details
export async function getUserCartItems(clerkId: string): Promise<CartItemWithBook[]> {
  try {
    // Check if user exists
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
        }
      })
      .from(carts)
      .innerJoin(books, eq(carts.bookId, books.id))
      .where(eq(carts.userId, clerkId)); // Direct reference to clerkId

    return cartItems;
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
          gte(coupons.validTo, new Date())
        )
      )
      .limit(1);

    if (!coupon.length) {
      return { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
    }

    const couponData = coupon[0];

    // Check usage limit
    if (couponData.usageLimit && (couponData.usedCount ?? 0) >= couponData.usageLimit) {
      return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // Check minimum order amount
    if (couponData.minOrderAmount && orderAmount < couponData.minOrderAmount) {
      return { 
        valid: false, 
        error: `Đơn hàng tối thiểu ${formatVND(couponData.minOrderAmount)} để sử dụng mã này` 
      };
    }

    // Calculate discount
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
      description: couponData.description || `Giảm ${formatVND(discountAmount)}`
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá' };
  }
}

// Calculate item price with discounts
export async function calculateItemPrice(item: CartItemWithBook): number {
  const basePrice = item.version === 'color' 
    ? (item.book.hasColorSale 
        ? item.book.colorPrice - item.book.colorSaleAmount 
        : item.book.colorPrice)
    : item.book.photoPrice;
  
  return basePrice * item.quantity; // Remove * 1000 if prices are already in VND
}

// Calculate order summary
export async function calculateOrderSummary(
  items: CartItemWithBook[], 
  couponDiscount: number = 0
): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  return {
    subtotal,
    shippingFee,
    couponDiscount,
    total,
    items
  };
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${timestamp.slice(-8)}${random}`;
}

// Save shipping address (if requested)
export async function saveShippingAddress(clerkId: string, addressData: CheckoutData['customerInfo']) {
  try {
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    // Check if this should be the default address (first address)
    const existingAddresses = await db
      .select({ id: shippingAddresses.id })
      .from(shippingAddresses)
      .where(eq(shippingAddresses.userId, clerkId)) // Direct reference to clerkId
      .limit(1);

    const isFirstAddress = existingAddresses.length === 0;

    const [newAddress] = await db
      .insert(shippingAddresses)
      .values({
        userId: clerkId, // Direct reference to clerkId
        fullName: addressData.fullName,
        phone: addressData.phone,
        email: addressData.email,
        address: addressData.address,
        city: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        isDefault: isFirstAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newAddress;
  } catch (error) {
    console.error('Error saving shipping address:', error);
    throw new Error('Failed to save shipping address');
  }
}

// Create order
export async function createOrder(
  clerkId: string, 
  checkoutData: CheckoutData,
  orderSummary: OrderSummary,
  couponData?: any
) {
  try {
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Save shipping address if requested
      let savedAddressId = null;
      if (checkoutData.saveAddress) {
        try {
          const savedAddress = await saveShippingAddress(clerkId, checkoutData.customerInfo);
          savedAddressId = savedAddress.id;
        } catch (error) {
          console.warn('Failed to save address, continuing with order:', error);
        }
      }

      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          userId: clerkId, // Direct reference to clerkId
          shippingAddressId: savedAddressId,
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

      // Create order items
      const orderItemsData = orderSummary.items.map(item => ({
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        version: item.version,
        unitPrice: calculateItemPrice(item) / item.quantity,
        totalPrice: calculateItemPrice(item),
        createdAt: new Date(),
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // Update coupon usage count
      if (couponData) {
        await tx
          .update(coupons)
          .set({ usedCount: (couponData.usedCount || 0) + 1 })
          .where(eq(coupons.id, couponData.id));
      }

      // Clear user's cart
      await tx.delete(carts).where(eq(carts.userId, clerkId)); // Direct reference to clerkId

      // Update book stock
      for (const item of orderSummary.items) {
        await tx
          .update(books)
          .set({ 
            availableCopies: Math.max(0, item.book.availableCopies - item.quantity)
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

// Get user's shipping addresses
export async function getUserShippingAddresses(clerkId: string) {
  try {
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    const addresses = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.userId, clerkId)) // Direct reference to clerkId
      .orderBy(shippingAddresses.isDefault, shippingAddresses.createdAt);

    return addresses;
  } catch (error) {
    console.error('Error fetching shipping addresses:', error);
    throw new Error('Failed to fetch shipping addresses');
  }
}

// Utility function to format VND
export async function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}