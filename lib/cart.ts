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
    availableCopies: number;
    title: string;
    slug: string;
    colorPrice: number;
    photoPrice: number;
    hasColorSale: boolean;
    colorSaleAmount: number;
    coverUrl: string;
  };
}

interface CartResult {
  success: boolean;
  data?: any;
  error?: string;
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
          availableCopies: books.availableCopies,
        },
      })
      .from(carts)
      .innerJoin(books, eq(carts.bookId, books.id))
      .where(eq(carts.userId, clerkId));

    return cartItems;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function addToCart(clerkId: string, bookId: number, version: 'color' | 'photo', quantity: number = 1): Promise<CartResult> {
  try {
    // Check if user exists and is active
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) {
      return { success: false, error: 'User not found' };
    }

    // Check book availability
    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId));
    
    if (!book) {
      return { success: false, error: 'Sách không tồn tại' };
    }
    
    if (book.availableCopies < quantity) {
      return { success: false, error: 'Số lượng vượt quá số sách có sẵn' };
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(carts)
      .where(and(
        eq(carts.userId, clerkId),
        eq(carts.bookId, bookId), 
        eq(carts.version, version)
      ))
      .limit(1);

    if (existingItem[0]) {
      // Update existing item
      const newQuantity = existingItem[0].quantity + quantity;
      
      // Check if new quantity exceeds availability - adjust if needed
      const finalQuantity = Math.min(newQuantity, book.availableCopies);

      const updatedItem = await db
        .update(carts)
        .set({ 
          quantity: finalQuantity, 
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
          availableCopies: books.availableCopies,
        })
        .from(books)
        .where(eq(books.id, bookId));

      return { 
        success: true, 
        data: { ...updatedItem[0], book: bookData } 
      };
    }

    // Create new cart item
    const [newItem] = await db
      .insert(carts)
      .values({
        userId: clerkId,
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
        availableCopies: books.availableCopies,
      })
      .from(books)
      .where(eq(books.id, bookId));

    return { 
      success: true, 
      data: { ...newItem, book: bookData } 
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: 'Không thể thêm sách vào giỏ hàng' };
  }
}

export async function updateCartItem(cartId: number, quantity: number): Promise<CartResult> {
  try {
    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }
    
    // Get cart item and check book availability
    const [cartItem] = await db
      .select({ bookId: carts.bookId })
      .from(carts)
      .where(eq(carts.id, cartId));
    
    if (!cartItem) {
      return { success: false, error: 'Cart item not found' };
    }
    
    const [book] = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, cartItem.bookId));
    
    if (!book) {
      return { success: false, error: 'Sách không tồn tại' };
    }
    
    // Nếu quantity vượt quá available copies, giới hạn về available copies
    const finalQuantity = Math.min(quantity, book.availableCopies);
    
    await db
      .update(carts)
      .set({ 
        quantity: finalQuantity, 
        updatedAt: new Date() 
      })
      .where(eq(carts.id, cartId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, error: 'Không thể cập nhật số lượng' };
  }
}

export async function removeCartItem(cartId: number): Promise<CartResult> {
  try {
    await db
      .delete(carts)
      .where(eq(carts.id, cartId));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return { success: false, error: 'Không thể xóa sách khỏi giỏ hàng' };
  }
}

export async function clearCart(clerkId: string): Promise<CartResult> {
  try {
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    if (!user[0]) {
      return { success: false, error: 'User not found' };
    }

    await db
      .delete(carts)
      .where(eq(carts.userId, clerkId));
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: 'Không thể xóa giỏ hàng' };
  }
}