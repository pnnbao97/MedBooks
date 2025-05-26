import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchCartAction, addToCartAction, updateCartItemAction, removeCartItemAction, clearCartAction } from '@/lib/actions/cart';

interface CartItem {
  id: number;
  bookId: number;
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

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (bookId: number, version: 'color' | 'photo', quantity?: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  // Helper function để tính giá
  calculateItemPrice: (item: CartItem) => number;
  // Recalculate totals
  recalculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,

      // Helper function để tính giá của một item
      calculateItemPrice: (item: CartItem) => {
        return item.version === 'color'
          ? item.book.hasColorSale
            ? item.book.colorPrice - item.book.colorSaleAmount
            : item.book.colorPrice
          : item.book.photoPrice;
      },

      // Recalculate tổng số lượng và tổng giá
      recalculateTotals: () => {
        const { items, calculateItemPrice } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          return sum + calculateItemPrice(item) * item.quantity;
        }, 0);
        set({ totalItems, totalPrice });
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await fetchCartAction();
          if (!items || items.length === 0) {
            set({ items: [], totalItems: 0, totalPrice: 0, isLoading: false });
            return;
          }
          
          // Set items trước, sau đó recalculate totals
          set({ items, isLoading: false });
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          set({ 
            error: error.message || 'Không thể tải giỏ hàng', 
            isLoading: false,
            items: [],
            totalItems: 0,
            totalPrice: 0
          });
        }
      },

      addItem: async (bookId: number, version: 'color' | 'photo', quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await addToCartAction(bookId, version, quantity);
          if (!newItem) throw new Error('Không thể thêm sách vào giỏ hàng');
          
          set((state) => {
            // Kiểm tra xem item đã tồn tại chưa
            const existingItemIndex = state.items.findIndex(
              (item) => item.bookId === bookId && item.version === version
            );
            
            let updatedItems;
            if (existingItemIndex !== -1) {
              // Cập nhật item hiện có
              updatedItems = state.items.map((item, index) =>
                index === existingItemIndex ? newItem : item
              );
            } else {
              // Thêm item mới
              updatedItems = [...state.items, newItem];
            }
            
            return { ...state, items: updatedItems, isLoading: false };
          });
          
          // Recalculate totals sau khi update
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error adding item to cart:', error);
          set({ 
            error: error.message || 'Không thể thêm sách vào giỏ hàng', 
            isLoading: false 
          });
          throw error; // Re-throw để component có thể handle
        }
      },

      updateQuantity: async (cartId: number, quantity: number) => {
        if (quantity < 1) {
          // Nếu quantity < 1, xóa item thay vì update
          await get().removeItem(cartId);
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          await updateCartItemAction(cartId, quantity);
          
          set((state) => ({
            ...state,
            items: state.items.map((item) =>
              item.id === cartId ? { ...item, quantity } : item
            ),
            isLoading: false
          }));
          
          // Recalculate totals
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error updating cart item:', error);
          set({ 
            error: error.message || 'Không thể cập nhật số lượng', 
            isLoading: false 
          });
          // Refresh cart để đồng bộ với server
          get().fetchCart();
        }
      },

      removeItem: async (cartId: number) => {
        set({ isLoading: true, error: null });
        try {
          await removeCartItemAction(cartId);
          
          set((state) => ({
            ...state,
            items: state.items.filter((item) => item.id !== cartId),
            isLoading: false
          }));
          
          // Recalculate totals
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error removing cart item:', error);
          set({ 
            error: error.message || 'Không thể xóa sách khỏi giỏ hàng', 
            isLoading: false 
          });
          // Refresh cart để đồng bộ với server
          get().fetchCart();
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await clearCartAction();
          set({ 
            items: [], 
            totalItems: 0, 
            totalPrice: 0, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          console.error('Error clearing cart:', error);
          set({ 
            error: error.message || 'Không thể xóa giỏ hàng', 
            isLoading: false 
          });
          // Vẫn clear local state nếu server action thất bại
          // để tránh trạng thái không nhất quán
          set((state) => ({ 
            ...state,
            items: [], 
            totalItems: 0, 
            totalPrice: 0 
          }));
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist items, không persist loading states
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
      // Rehydrate và recalculate khi load từ storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recalculateTotals();
        }
      },
    }
  )
);