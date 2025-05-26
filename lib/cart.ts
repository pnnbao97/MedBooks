// lib/cart.ts
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
    // Check if user exists and is active
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
      .where(eq(carts.userId, clerkId)); // Direct reference to clerkId

    return cartItems;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function addToCart(clerkId: string, bookId: number, version: 'color' | 'photo', quantity: number = 1): Promise<CartItem | null> {
  try {
    // Check if user exists and is active
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    // Check book availability
    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId));
    
    if (!book) throw new Error('Sách không tồn tại');
    
    if (book.availableCopies < quantity) {
      throw new Error('Số lượng vượt quá số sách có sẵn');
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(carts)
      .where(and(
        eq(carts.userId, clerkId), // Direct reference to clerkId
        eq(carts.bookId, bookId), 
        eq(carts.version, version)
      ))
      .limit(1);

    if (existingItem[0]) {
      // Update existing item
      const newQuantity = existingItem[0].quantity + quantity;
      
      // Check if new quantity exceeds availability
      if (book.availableCopies < newQuantity) {
        throw new Error('Số lượng vượt quá số sách có sẵn');
      }

      const updatedItem = await db
        .update(carts)
        .set({ 
          quantity: newQuantity, 
          updatedAt: new Date() 
        })
        .where(eq(carts.id, existingItem[0].id))
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

      return { ...updatedItem[0], book: bookData };
    }

    // Create new cart item
    const [newItem] = await db
      .insert(carts)
      .values({
        userId: clerkId, // Direct reference to clerkId
        bookId,
        version,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
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
    
    // Get cart item and check book availability
    const [cartItem] = await db
      .select({ bookId: carts.bookId })
      .from(carts)
      .where(eq(carts.id, cartId));
    
    if (!cartItem) throw new Error('Cart item not found');
    
    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, cartItem.bookId));
    
    if (!book) throw new Error('Sách không tồn tại');
    
    if (book.availableCopies < quantity) {
      throw new Error('Số lượng vượt quá số sách có sẵn');
    }
    
    await db
      .update(carts)
      .set({ 
        quantity, 
        updatedAt: new Date() 
      })
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
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) throw new Error('User not found');

    await db
      .delete(carts)
      .where(eq(carts.userId, clerkId)); // Direct reference to clerkId
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}