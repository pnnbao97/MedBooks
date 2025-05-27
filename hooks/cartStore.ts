// hooks/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchCartAction, addToCartAction, updateCartItemAction, removeCartItemAction, clearCartAction } from '@/lib/actions/cart';
import type { CartItemWithBook } from '@/lib/checkout';
import { calculateItemPrice } from '@/lib/pricing';

interface CartState {
  items: CartItemWithBook[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (bookId: number, version: 'color' | 'photo', quantity?: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;
  removeItem: (cartId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  calculateItemPrice: (item: CartItemWithBook) => number;
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

      calculateItemPrice: (item: CartItemWithBook) => calculateItemPrice(item),

      recalculateTotals: () => {
        const { items, calculateItemPrice } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
        set({ totalItems, totalPrice });
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await fetchCartAction();
          set({ items: items || [], isLoading: false });
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          set({
            error: error.message || 'Không thể tải giỏ hàng',
            isLoading: false,
            items: [],
            totalItems: 0,
            totalPrice: 0,
          });
        }
      },

      addItem: async (bookId: number, version: 'color' | 'photo', quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await addToCartAction(bookId, version, quantity);
          if (!newItem) throw new Error('Không thể thêm sách vào giỏ hàng');

          set((state) => {
            const existingItemIndex = state.items.findIndex(
              (item) => item.bookId === bookId && item.version === version,
            );

            let updatedItems;
            if (existingItemIndex !== -1) {
              updatedItems = state.items.map((item, index) =>
                index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
              );
            } else {
              updatedItems = [
                ...state.items,
                {
                  ...newItem,
                  book: {
                    ...newItem.book,
                    availableCopies: newItem.book.availableCopies || 0,
                  },
                },
              ];
            }

            return { items: updatedItems, isLoading: false };
          });

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error adding item to cart:', error);
          set({
            error: error.message || 'Không thể thêm sách vào giỏ hàng',
            isLoading: false,
          });
          throw error;
        }
      },

      updateQuantity: async (cartId: number, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          if (quantity < 1) {
            await get().removeItem(cartId);
            return;
          }

          const item = get().items.find((item) => item.id === cartId);
          if (!item) throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
          if (quantity > item.book.availableCopies) {
            throw new Error('Số lượng vượt quá số sách có sẵn');
          }

          await updateCartItemAction(cartId, quantity);
          set((state) => ({
            items: state.items.map((item) => (item.id === cartId ? { ...item, quantity } : item)),
            isLoading: false,
          }));

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error updating cart item:', error);
          set({
            error: error.message || 'Không thể cập nhật số lượng',
            isLoading: false,
          });
        }
      },

      removeItem: async (cartId: number) => {
        set({ isLoading: true, error: null });
        try {
          await removeCartItemAction(cartId);
          set((state) => ({
            items: state.items.filter((item) => item.id !== cartId),
            isLoading: false,
          }));

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error removing cart item:', error);
          set({
            error: error.message || 'Không thể xóa sách khỏi giỏ hàng',
            isLoading: false,
          });
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
            error: null,
          });
        } catch (error: any) {
          console.error('Error clearing cart:', error);
          set({
            error: error.message || 'Không thể xóa giỏ hàng',
            isLoading: false,
            items: [],
            totalItems: 0,
            totalPrice: 0,
          });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recalculateTotals();
        }
      },
    },
  ),
);