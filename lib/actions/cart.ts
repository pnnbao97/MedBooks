// lib/actions/cart.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/database/drizzle';
import { carts, books, users } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

// Shared types
export interface CartItemWithBook {
  id: number;
  bookId: number;
  userId: string;
  quantity: number;
  version: 'color' | 'photo';
  createdAt: Date;
  updatedAt: Date;
  book: {
    id: number;
    title: string;
    slug: string;
    colorPrice: number;
    photoPrice: number;
    hasColorSale: boolean;
    colorSaleAmount: number;
    coverUrl: string | null;
    availableCopies: number;
  };
}

export interface ActionResult<T = any> {
  success?: string;
  data?: T;
  error?: string;
}

// Helper function để validate user
async function validateUser(clerkId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.clerkId, clerkId), eq(users.isActive, true)))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

// Helper function để get book data
async function getBookData(bookId: number) {
  try {
    const [book] = await db
      .select({
        id: books.id,
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
      .where(eq(books.id, bookId))
      .limit(1);

    return book;
  } catch (error) {
    console.error('Error getting book data:', error);
    return null;
  }
}

// Core database function để fetch cart
async function getCartFromDB(clerkId: string): Promise<CartItemWithBook[]> {
  try {
    const user = await validateUser(clerkId);
    if (!user) return [];

    const cartItems = await db
      .select({
        id: carts.id,
        bookId: carts.bookId,
        userId: carts.userId,
        quantity: carts.quantity,
        version: carts.version,
        createdAt: carts.createdAt,
        updatedAt: carts.updatedAt,
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

    return cartItems as CartItemWithBook[];
  } catch (error) {
    console.error('Error fetching cart from DB:', error);
    return [];
  }
}

// Server Actions
export async function fetchCartAction(): Promise<ActionResult<CartItemWithBook[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xem giỏ hàng' };
    }
    
    const cart = await getCartFromDB(userId);
    return { data: cart };
  } catch (error) {
    console.error('Error in fetchCartAction:', error);
    return { error: 'Không thể tải giỏ hàng', data: [] };
  }
}

export async function addToCartAction(
  bookId: number, 
  version: 'color' | 'photo', 
  quantity: number = 1
): Promise<ActionResult<CartItemWithBook>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để thêm sách vào giỏ hàng' };
    }
    
    // Validate input
    if (!bookId || bookId <= 0) {
      return { error: 'ID sách không hợp lệ' };
    }
    
    if (!['color', 'photo'].includes(version)) {
      return { error: 'Phiên bản sách không hợp lệ' };
    }
    
    if (quantity <= 0) {
      return { error: 'Số lượng phải lớn hơn 0' };
    }

    // Validate user
    const user = await validateUser(userId);
    if (!user) {
      return { error: 'Người dùng không tồn tại' };
    }

    // Check book availability
    const bookData = await getBookData(bookId);
    if (!bookData) {
      return { error: 'Sách không tồn tại' };
    }
    
    if (bookData.availableCopies < quantity) {
      return { error: 'Số lượng vượt quá số sách có sẵn' };
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(carts)
      .where(and(
        eq(carts.userId, userId),
        eq(carts.bookId, bookId), 
        eq(carts.version, version)
      ))
      .limit(1);

    if (existingItem[0]) {
      // Update existing item
      const newQuantity = existingItem[0].quantity + quantity;
      const finalQuantity = Math.min(newQuantity, bookData.availableCopies);

      if (finalQuantity > bookData.availableCopies) {
        return { error: 'Số lượng vượt quá số sách có sẵn' };
      }

      const [updatedItem] = await db
        .update(carts)
        .set({ 
          quantity: finalQuantity, 
          updatedAt: new Date() 
        })
        .where(eq(carts.id, existingItem[0].id))
        .returning();

      return { 
        success: 'Đã cập nhật số lượng sách trong giỏ hàng',
        data: { ...updatedItem, book: bookData } as CartItemWithBook
      };
    }

    // Create new cart item
    const [newItem] = await db
      .insert(carts)
      .values({
        userId,
        bookId,
        version,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { 
      success: 'Đã thêm sách vào giỏ hàng',
      data: { ...newItem, book: bookData } as CartItemWithBook
    };
  } catch (error: any) {
    console.error('Error in addToCartAction:', error);
    return { error: error.message || 'Không thể thêm sách vào giỏ hàng' };
  }
}

export async function updateCartItemAction(cartId: number, quantity: number): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để cập nhật giỏ hàng' };
    }

    // Validate input
    if (!cartId || cartId <= 0) {
      return { error: 'ID giỏ hàng không hợp lệ' };
    }
    
    if (quantity < 0) {
      return { error: 'Số lượng không thể âm' };
    }
    
    // Nếu quantity = 0, xóa item thay vì update
    if (quantity === 0) {
      return await removeCartItemAction(cartId);
    }

    // Get cart item and verify ownership
    const [cartItem] = await db
      .select({ bookId: carts.bookId, userId: carts.userId })
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);
    
    if (!cartItem) {
      return { error: 'Sản phẩm không tồn tại trong giỏ hàng' };
    }

    // Verify ownership
    if (cartItem.userId !== userId) {
      return { error: 'Không có quyền truy cập' };
    }
    
    // Check book availability
    const bookData = await getBookData(cartItem.bookId);
    if (!bookData) {
      return { error: 'Sách không tồn tại' };
    }
    
    // Limit quantity to available copies
    const finalQuantity = Math.min(quantity, bookData.availableCopies);
    
    if (finalQuantity !== quantity) {
      await db
        .update(carts)
        .set({ 
          quantity: finalQuantity, 
          updatedAt: new Date() 
        })
        .where(eq(carts.id, cartId));
      
      return { 
        success: `Đã điều chỉnh số lượng về ${finalQuantity} (tối đa có sẵn)` 
      };
    }
    
    await db
      .update(carts)
      .set({ 
        quantity: finalQuantity, 
        updatedAt: new Date() 
      })
      .where(eq(carts.id, cartId));
    
    return { success: 'Đã cập nhật số lượng' };
  } catch (error: any) {
    console.error('Error in updateCartItemAction:', error);
    return { error: error.message || 'Không thể cập nhật số lượng' };
  }
}

export async function removeCartItemAction(cartId: number): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xóa sách khỏi giỏ hàng' };
    }

    // Validate input
    if (!cartId || cartId <= 0) {
      return { error: 'ID giỏ hàng không hợp lệ' };
    }

    // Verify ownership before deleting
    const [cartItem] = await db
      .select({ userId: carts.userId })
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);
    
    if (!cartItem) {
      return { error: 'Sản phẩm không tồn tại trong giỏ hàng' };
    }

    if (cartItem.userId !== userId) {
      return { error: 'Không có quyền truy cập' };
    }
    
    await db
      .delete(carts)
      .where(eq(carts.id, cartId));
    
    return { success: 'Đã xóa sách khỏi giỏ hàng' };
  } catch (error: any) {
    console.error('Error in removeCartItemAction:', error);
    return { error: error.message || 'Không thể xóa sách khỏi giỏ hàng' };
  }
}

export async function clearCartAction(): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xóa giỏ hàng' };
    }

    const user = await validateUser(userId);
    if (!user) {
      return { error: 'Người dùng không tồn tại' };
    }

    await db
      .delete(carts)
      .where(eq(carts.userId, userId));
    
    return { success: 'Đã xóa tất cả sách khỏi giỏ hàng' };
  } catch (error: any) {
    console.error('Error in clearCartAction:', error);
    return { error: error.message || 'Không thể xóa giỏ hàng' };
  }
}

// Helper actions for UI
export async function getCartItemAction(cartId: number): Promise<ActionResult<CartItemWithBook>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập' };
    }
    
    const cart = await getCartFromDB(userId);
    if (!cart.length) {
      return { error: 'Giỏ hàng trống' };
    }
    
    const cartItem = cart.find(item => item.id === cartId);
    if (!cartItem) {
      return { error: 'Sản phẩm không tồn tại trong giỏ hàng của bạn' };
    }
    
    return { data: cartItem };
  } catch (error: any) {
    console.error('Error in getCartItemAction:', error);
    return { error: error.message || 'Không thể lấy thông tin sản phẩm' };
  }
}

export async function getCartCountAction(): Promise<number> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return 0;
    }
    
    const cart = await getCartFromDB(userId);
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error in getCartCountAction:', error);
    return 0;
  }
}