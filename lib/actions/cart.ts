// lib/actions/cart.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/lib/cart';

export async function fetchCartAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xem giỏ hàng' };
    }
    
    const cart = await getCart(userId);
    return { data: cart || [] };
  } catch (error) {
    console.error('Error in fetchCartAction:', error);
    return { error: 'Không thể tải giỏ hàng' };
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
    
    const result = await addToCart(userId, bookId, version, quantity);
    if (!result.success) {
      return { error: result.error || 'Không thể thêm sách vào giỏ hàng' };
    }
    
    return { data: result.data, success: 'Đã thêm sách vào giỏ hàng' };
  } catch (error: any) {
    console.error('Error in addToCartAction:', error);
    return { error: error.message || 'Không thể thêm sách vào giỏ hàng' };
  }
}

export async function updateCartItemAction(cartId: number, quantity: number) {
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
      const result = await removeCartItem(cartId);
      if (!result.success) {
        return { error: result.error || 'Không thể xóa sách khỏi giỏ hàng' };
      }
      return { success: 'Đã xóa sách khỏi giỏ hàng' };
    }
    
    const result = await updateCartItem(cartId, quantity);
    if (!result.success) {
      return { error: result.error || 'Không thể cập nhật số lượng' };
    }
    
    return { success: 'Đã cập nhật số lượng sách' };
  } catch (error: any) {
    console.error('Error in updateCartItemAction:', error);
    return { error: error.message || 'Không thể cập nhật số lượng' };
  }
}

export async function removeCartItemAction(cartId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xóa sách khỏi giỏ hàng' };
    }

    // Validate input
    if (!cartId || cartId <= 0) {
      return { error: 'ID giỏ hàng không hợp lệ' };
    }
    
    const result = await removeCartItem(cartId);
    if (!result.success) {
      return { error: result.error || 'Không thể xóa sách khỏi giỏ hàng' };
    }
    
    return { success: 'Đã xóa sách khỏi giỏ hàng' };
  } catch (error: any) {
    console.error('Error in removeCartItemAction:', error);
    return { error: error.message || 'Không thể xóa sách khỏi giỏ hàng' };
  }
}

export async function clearCartAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Vui lòng đăng nhập để xóa giỏ hàng' };
    }
    
    const result = await clearCart(userId);
    if (!result.success) {
      return { error: result.error || 'Không thể xóa giỏ hàng' };
    }
    
    return { success: 'Đã xóa toàn bộ giỏ hàng' };
  } catch (error: any) {
    console.error('Error in clearCartAction:', error);
    return { error: error.message || 'Không thể xóa giỏ hàng' };
  }
}

// Helper action để validate cart ownership và get cart item details
export async function getCartItemAction(cartId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    
    // Get user's cart to validate ownership
    const cart = await getCart(userId);
    if (!cart) {
      return { error: 'Giỏ hàng không tồn tại' };
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