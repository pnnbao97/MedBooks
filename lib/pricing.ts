// lib/pricing.ts
import type { CartItemWithBook, OrderSummary } from '@/lib/checkout';

export const calculateItemPrice = (item: CartItemWithBook): number => {
  const basePrice = item.version === 'color'
    ? item.book.hasColorSale
      ? (item.book.colorPrice - item.book.colorSaleAmount) * 1000
      : item.book.colorPrice * 1000
    : item.book.photoPrice * 1000;

  return basePrice * item.quantity;
};

export function calculateOrderSummary(items: CartItemWithBook[], couponDiscount: number = 0): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  return {
    subtotal,
    shippingFee,
    couponDiscount,
    total,
    items,
  };
}