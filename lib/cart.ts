import { db } from '@/database/drizzle';
import { carts, books, users } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

export interface CartItem {
  id: number;
  bookId: number;
  userId: string;
  quantity: number;
  version: 'color' | 'photo';
  book: {
    title: string;
    slug: string;
    colorPrice: number;
    photoPrice: number;
    hasColorSale: boolean;
    colorSaleAmount: number;
    coverUrl: string;
  };
}

export async function getCart(clerkId: string): Promise<CartItem[] | null> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) return null;

    const cartItems = await db
      .select({
        id: carts.id,
        bookId: carts.bookId,
        userId: carts.userId,
        quantity: carts.quantity,
        version: carts.version,
        book: {
          title: books.title,
          slug: books.slug,
          colorPrice: books.colorPrice,
          photoPrice: books.photoPrice,
          hasColorSale: books.hasColorSale,
          colorSaleAmount: books.colorSaleAmount,
          coverUrl: books.coverUrl,
        },
      })
      .from(carts)
      .innerJoin(books, eq(carts.bookId, books.id))
      .where(eq(carts.userId, user[0].id));

    return cartItems;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function addToCart(clerkId: string, bookId: number, version: 'color' | 'photo', quantity: number = 1): Promise<CartItem | null> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId));
    if (book.availableCopies < quantity) {
      throw new Error('Số lượng vượt quá số sách có sẵn');
    }

    const existingItem = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, user[0].id), eq(carts.bookId, bookId), eq(carts.version, version)))
      .limit(1);

    if (existingItem[0]) {
      const updatedItem = await db
        .update(carts)
        .set({ quantity: existingItem[0].quantity + quantity, updatedAt: new Date() })
        .where(eq(carts.id, existingItem[0].id))
        .returning();

      const [book] = await db
        .select({
          title: books.title,
          slug: books.slug,
          colorPrice: books.colorPrice,
          photoPrice: books.photoPrice,
          hasColorSale: books.hasColorSale,
          colorSaleAmount: books.colorSaleAmount,
          coverUrl: books.coverUrl,
        })
        .from(books)
        .where(eq(books.id, bookId));

      return { ...updatedItem[0], book };
    }

    const [newItem] = await db
      .insert(carts)
      .values({
        userId: user[0].id,
        bookId,
        version,
        quantity,
        createdAt: new Date(),
      })
      .returning();

    const [bookData] = await db
      .select({
        title: books.title,
        slug: books.slug,
        colorPrice: books.colorPrice,
        photoPrice: books.photoPrice,
        hasColorSale: books.hasColorSale,
        colorSaleAmount: books.colorSaleAmount,
        coverUrl: books.coverUrl,
      })
      .from(books)
      .where(eq(books.id, bookId));

    return { ...newItem, book: bookData };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function updateCartItem(cartId: number, quantity: number): Promise<void> {
  try {
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    const [cartItem] = await db
      .select({ bookId: carts.bookId })
      .from(carts)
      .where(eq(carts.id, cartId));
    if (!cartItem) throw new Error('Cart item not found');
    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, cartItem.bookId));
    if (book.availableCopies < quantity) {
      throw new Error('Số lượng vượt quá số sách có sẵn');
    }
    await db
      .update(carts)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(carts.id, cartId));
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

export async function removeCartItem(cartId: number): Promise<void> {
  try {
    await db
      .delete(carts)
      .where(eq(carts.id, cartId));
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

export async function clearCart(clerkId: string): Promise<void> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    await db
      .delete(carts)
      .where(eq(carts.userId, user[0].id));
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}