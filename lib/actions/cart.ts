'use server';
import { auth } from '@clerk/nextjs/server';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/lib/cart';

export async function fetchCartAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để xem giỏ hàng');
    }
    
    const cart = await getCart(userId);
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
    
    const cartItem = await addToCart(userId, bookId, version, quantity);
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
    // Validate input
    if (!cartId || cartId <= 0) {
      throw new Error('ID giỏ hàng không hợp lệ');
    }
    
    if (quantity < 0) {
      throw new Error('Số lượng không thể âm');
    }
    
    // Nếu quantity = 0, xóa item thay vì update
    if (quantity === 0) {
      return await removeCartItemAction(cartId);
    }
    
    const updatedItem = await updateCartItem(cartId, quantity);
    if (!updatedItem) {
      throw new Error('Không thể cập nhật số lượng sách');
    }
    
    return updatedItem;
  } catch (error) {
    console.error('Error in updateCartItemAction:', error);
    throw error;
  }
}

export async function removeCartItemAction(cartId: number) {
  try {
    // Validate input
    if (!cartId || cartId <= 0) {
      throw new Error('ID giỏ hàng không hợp lệ');
    }
    
    const result = await removeCartItem(cartId);
    return result;
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
    
    const result = await clearCart(userId);
    return result;
  } catch (error) {
    console.error('Error in clearCartAction:', error);
    throw error;
  }
}

// Helper action để validate cart ownership (tùy chọn)
export async function validateCartItemOwnership(cartId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    
    // Có thể thêm logic kiểm tra cart item có thuộc về user hiện tại không
    // Điều này tùy thuộc vào cấu trúc database của bạn
    
    return true;
  } catch (error) {
    console.error('Error in validateCartItemOwnership:', error);
    throw error;
  }
}