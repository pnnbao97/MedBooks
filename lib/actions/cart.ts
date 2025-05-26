// lib/actions/cart.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/lib/cart';

export async function fetchCartAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để xem giỏ hàng');
    }
    
    const cart = await getCart(userId); // userId is already clerkId from Clerk
    return cart || [];
  } catch (error) {
    console.error('Error in fetchCartAction:', error);
    throw error;
  }
}

export async function addToCartAction(
  bookId: number, 
  version: 'color' | 'photo', 
  quantity: number = 1
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
    }
    
    // Validate input
    if (!bookId || bookId <= 0) {
      throw new Error('ID sách không hợp lệ');
    }
    
    if (!['color', 'photo'].includes(version)) {
      throw new Error('Phiên bản sách không hợp lệ');
    }
    
    if (quantity <= 0) {
      throw new Error('Số lượng phải lớn hơn 0');
    }
    
    const cartItem = await addToCart(userId, bookId, version, quantity); // userId is clerkId
    if (!cartItem) {
      throw new Error('Không thể thêm sách vào giỏ hàng');
    }
    
    return cartItem;
  } catch (error) {
    console.error('Error in addToCartAction:', error);
    throw error;
  }
}

export async function updateCartItemAction(cartId: number, quantity: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
    }

    // Validate input
    if (!cartId || cartId <= 0) {
      throw new Error('ID giỏ hàng không hợp lệ');
    }
    
    if (quantity < 0) {
      throw new Error('Số lượng không thể âm');
    }
    
    // Nếu quantity = 0, xóa item thay vì update
    if (quantity === 0) {
      await removeCartItem(cartId);
      return { success: true, message: 'Đã xóa sách khỏi giỏ hàng' };
    }
    
    await updateCartItem(cartId, quantity);
    return { success: true, message: 'Đã cập nhật số lượng sách' };
  } catch (error) {
    console.error('Error in updateCartItemAction:', error);
    throw error;
  }
}

export async function removeCartItemAction(cartId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để xóa sách khỏi giỏ hàng');
    }

    // Validate input
    if (!cartId || cartId <= 0) {
      throw new Error('ID giỏ hàng không hợp lệ');
    }
    
    await removeCartItem(cartId);
    return { success: true, message: 'Đã xóa sách khỏi giỏ hàng' };
  } catch (error) {
    console.error('Error in removeCartItemAction:', error);
    throw error;
  }
}

export async function clearCartAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để xóa giỏ hàng');
    }
    
    await clearCart(userId); // userId is clerkId
    return { success: true, message: 'Đã xóa toàn bộ giỏ hàng' };
  } catch (error) {
    console.error('Error in clearCartAction:', error);
    throw error;
  }
}

// Helper action để validate cart ownership và get cart item details
export async function getCartItemAction(cartId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // Get user's cart to validate ownership
    const cart = await getCart(userId);
    if (!cart) {
      throw new Error('Giỏ hàng không tồn tại');
    }
    
    const cartItem = cart.find(item => item.id === cartId);
    if (!cartItem) {
      throw new Error('Sản phẩm không tồn tại trong giỏ hàng của bạn');
    }
    
    return cartItem;
  } catch (error) {
    console.error('Error in getCartItemAction:', error);
    throw error;
  }
}

// Get cart count for UI
export async function getCartCountAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return 0;
    }
    
    const cart = await getCart(userId);
    if (!cart) return 0;
    
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error in getCartCountAction:', error);
    return 0;
  }
}