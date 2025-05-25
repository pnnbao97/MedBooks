'use server';
import { auth } from '@clerk/nextjs/server';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/lib/cart';

export async function fetchCartAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return await getCart(userId);
}

export async function addToCartAction(bookId: number, version: 'color' | 'photo', quantity: number = 1) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return await addToCart(userId, bookId, version, quantity);
}

export async function updateCartItemAction(cartId: number, quantity: number) {
  return await updateCartItem(cartId, quantity);
}

export async function removeCartItemAction(cartId: number) {
  return await removeCartItem(cartId);
}

export async function clearCartAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return await clearCart(userId);
}