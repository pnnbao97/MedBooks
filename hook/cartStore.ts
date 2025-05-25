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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await fetchCartAction();
          if (!items) {
            set({ items: [], totalItems: 0, totalPrice: 0, isLoading: false });
            return;
          }
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = items.reduce((sum, item) => {
            const price = item.version === 'color'
              ? item.book.hasColorSale
                ? item.book.colorPrice - item.book.colorSaleAmount
                : item.book.colorPrice
              : item.book.photoPrice;
            return sum + price * item.quantity;
          }, 0);
          set({ items, totalItems, totalPrice, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addItem: async (bookId: number, version: 'color' | 'photo', quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await addToCartAction(bookId, version, quantity);
          if (!newItem) throw new Error('Failed to add item to cart');
          set((state) => {
            const existingItem = state.items.find(
              (item) => item.bookId === bookId && item.version === version
            );
            if (existingItem) {
              return {
                items: state.items.map((item) =>
                  item.id === newItem.id ? newItem : item
                ),
                totalItems: state.totalItems + quantity,
                totalPrice: state.totalPrice + (
                  version === 'color'
                    ? newItem.book.hasColorSale
                      ? newItem.book.colorPrice - newItem.book.colorSaleAmount
                      : newItem.book.colorPrice
                    : newItem.book.photoPrice
                ) * quantity,
              };
            }
            return {
              items: [...state.items, newItem],
              totalItems: state.totalItems + quantity,
              totalPrice: state.totalPrice + (
                version === 'color'
                  ? newItem.book.hasColorSale
                    ? newItem.book.colorPrice - newItem.book.colorSaleAmount
                    : newItem.book.colorPrice
                  : newItem.book.photoPrice
              ) * quantity,
            };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateQuantity: async (cartId: number, quantity: number) => {
        if (quantity < 1) return;
        set({ isLoading: true, error: null });
        try {
          await updateCartItemAction(cartId, quantity);
          set((state) => {
            const item = state.items.find((i) => i.id === cartId);
            if (!item) return state;
            const price = item.version === 'color'
              ? item.book.hasColorSale
                ? item.book.colorPrice - item.book.colorSaleAmount
                : item.book.colorPrice
              : item.book.photoPrice;
            const oldQuantity = item.quantity;
            return {
              items: state.items.map((i) =>
                i.id === cartId ? { ...i, quantity } : i
              ),
              totalItems: state.totalItems + (quantity - oldQuantity),
              totalPrice: state.totalPrice + (price * (quantity - oldQuantity)),
            };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      removeItem: async (cartId: number) => {
        set({ isLoading: true, error: null });
        try {
          await removeCartItemAction(cartId);
          set((state) => {
            const item = state.items.find((i) => i.id === cartId);
            if (!item) return state;
            const price = item.version === 'color'
              ? item.book.hasColorSale
                ? item.book.colorPrice - item.book.colorSaleAmount
                : item.book.colorPrice
              : item.book.photoPrice;
            return {
              items: state.items.filter((i) => i.id !== cartId),
              totalItems: state.totalItems - item.quantity,
              totalPrice: state.totalPrice - (price * item.quantity),
            };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await clearCartAction();
          set({ items: [], totalItems: 0, totalPrice: 0 });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);