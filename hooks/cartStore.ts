// hooks/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
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
          const result = await fetchCartAction();
          
          if (result.error) {
            toast.error(result.error);
            set({
              error: result.error,
              isLoading: false,
              items: [],
              totalItems: 0,
              totalPrice: 0,
            });
            return;
          }

          set({ items: result.data || [], isLoading: false });
          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          const errorMessage = 'Không thể tải giỏ hàng';
          toast.error(errorMessage);
          set({
            error: errorMessage,
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
          const result = await addToCartAction(bookId, version, quantity);
          
          if (result.error) {
            toast.error(result.error);
            set({ error: result.error, isLoading: false });
            return;
          }

          if (result.success) {
            toast.success(result.success);
          }

          const newItem = result.data;
          if (!newItem) {
            toast.error('Không thể thêm sách vào giỏ hàng');
            set({ error: 'Không thể thêm sách vào giỏ hàng', isLoading: false });
            return;
          }

          set((state) => {
            const existingItemIndex = state.items.findIndex(
              (item) => item.bookId === bookId && item.version === version
            );

            let updatedItems;
            if (existingItemIndex !== -1) {
              updatedItems = state.items.map((item, index) => index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
              );
            } else {
              updatedItems = [
                ...state.items,
                {
                  ...newItem,
                  book: {
                    ...newItem.book,
                    availableCopies: newItem.book.availableCopies,
                  },
                },
              ];
            }

            return { items: updatedItems, isLoading: false };
          });

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error adding item to cart:', error);
          const errorMessage = error.message || 'Không thể thêm sách vào giỏ hàng';
          toast.error(errorMessage);
          set({ error: errorMessage, isLoading: false });
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
          if (!item) {
            toast.error('Sản phẩm không tồn tại trong giỏ hàng');
            set({ error: 'Sản phẩm không tồn tại trong giỏ hàng', isLoading: false });
            return;
          }
          
          if (quantity > item.book.availableCopies) {
            toast.error('Số lượng vượt quá số sách có sẵn');
            set({ error: 'Số lượng vượt quá số sách có sẵn', isLoading: false });
            return;
          }

          const result = await updateCartItemAction(cartId, quantity);
          
          if (result.error) {
            toast.error(result.error);
            set({ error: result.error, isLoading: false });
            return;
          }

          if (result.success) {
            toast.success(result.success);
          }

          set((state) => ({
            items: state.items.map((item) => (item.id === cartId ? { ...item, quantity } : item)),
            isLoading: false,
          }));

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error updating cart item:', error);
          const errorMessage = error.message || 'Không thể cập nhật số lượng';
          toast.error(errorMessage);
          set({ error: errorMessage, isLoading: false });
        }
      },

      removeItem: async (cartId: number) => {
        set({ isLoading: true, error: null });
        try {
          const result = await removeCartItemAction(cartId);
          
          if (result.error) {
            toast.error(result.error);
            set({ error: result.error, isLoading: false });
            return;
          }

          if (result.success) {
            toast.success(result.success);
          }

          set((state) => ({
            items: state.items.filter((item) => item.id !== cartId),
            isLoading: false,
          }));

          get().recalculateTotals();
        } catch (error: any) {
          console.error('Error removing cart item:', error);
          const errorMessage = error.message || 'Không thể xóa sách khỏi giỏ hàng';
          toast.error(errorMessage);
          set({ error: errorMessage, isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await clearCartAction();
          
          if (result.error) {
            toast.error(result.error);
            set({ error: result.error, isLoading: false });
            return;
          }

          if (result.success) {
            toast.success(result.success);
          }

          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Error clearing cart:', error);
          const errorMessage = error.message || 'Không thể xóa giỏ hàng';
          toast.error(errorMessage);
          set({
            error: errorMessage,
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