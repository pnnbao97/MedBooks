// hooks/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { 
  fetchCartAction, 
  addToCartAction, 
  updateCartItemAction, 
  removeCartItemAction, 
  clearCartAction,
  type CartItemWithBook,
  type ActionResult
} from '@/lib/actions/cart';

interface CartState {
  items: CartItemWithBook[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchCart: (force?: boolean) => Promise<void>;
  addItem: (bookId: number, version: 'color' | 'photo', quantity?: number) => Promise<boolean>;
  updateQuantity: (cartId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  
  // Utilities
  calculateItemPrice: (item: CartItemWithBook) => number;
  recalculateTotals: () => void;
  resetError: () => void;
  getItemByBookId: (bookId: number, version: 'color' | 'photo') => CartItemWithBook | undefined;
}

// Helper function để calculate giá của một item
const calculateItemPrice = (item: CartItemWithBook): number => {
  const basePrice = item.version === 'color'
    ? (item.book.hasColorSale 
        ? item.book.colorPrice - item.book.colorSaleAmount 
        : item.book.colorPrice)
    : item.book.photoPrice;
  
  return basePrice * item.quantity * 1000; // Convert to VND
};

// Helper function để handle errors
const handleError = (error: any, defaultMessage: string, set: any) => {
  console.error('Cart operation error:', error);
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
  set({ error: errorMessage, isLoading: false });
};

// Helper function để handle success với optional message
const handleSuccess = (message?: string) => {
  if (message) {
    toast.success(message);
  }
};

// Helper function để handle action results
const handleActionResult = <T>(
  result: ActionResult<T>, 
  successMessage?: string
): { success: boolean; data?: T } => {
  if (result.error) {
    toast.error(result.error);
    return { success: false };
  }
  
  if (result.success) {
    handleSuccess(result.success);
  } else if (successMessage) {
    handleSuccess(successMessage);
  }
  
  return { success: true, data: result.data };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,
      lastFetch: null,

      calculateItemPrice,

      recalculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
        set({ totalItems, totalPrice });
      },

      resetError: () => set({ error: null }),

      getItemByBookId: (bookId: number, version: 'color' | 'photo') => {
        const { items } = get();
        return items.find(item => item.bookId === bookId && item.version === version);
      },

      fetchCart: async (force = false) => {
        const { lastFetch, isLoading } = get();
        
        // Avoid multiple simultaneous fetches
        if (isLoading) return;
        
        // Cache for 30 seconds unless forced
        if (!force && lastFetch && Date.now() - lastFetch < 30000) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const result = await fetchCartAction();
          const { success, data } = handleActionResult(result);
          
          if (success) {
            set({ 
              items: data || [], 
              isLoading: false, 
              lastFetch: Date.now() 
            });
            get().recalculateTotals();
          } else {
            set({
              items: [],
              totalItems: 0,
              totalPrice: 0,
              isLoading: false,
              lastFetch: Date.now()
            });
          }
        } catch (error: any) {
          handleError(error, 'Không thể tải giỏ hàng', set);
          set({ 
            items: [], 
            totalItems: 0, 
            totalPrice: 0, 
            lastFetch: Date.now() 
          });
        }
      },

      addItem: async (bookId: number, version: 'color' | 'photo', quantity = 1) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await addToCartAction(bookId, version, quantity);
          const { success, data } = handleActionResult(result);
          
          if (success && data) {
            // Update local state optimistically
            const { items } = get();
            const existingItemIndex = items.findIndex(
              item => item.bookId === bookId && item.version === version
            );

            let updatedItems: CartItemWithBook[];
            if (existingItemIndex !== -1) {
              // Update existing item
              updatedItems = items.map((item, index) => 
                index === existingItemIndex 
                  ? { ...item, quantity: data.quantity, updatedAt: new Date() }
                  : item
              );
            } else {
              // Add new item
              updatedItems = [...items, data];
            }

            set({ items: updatedItems, isLoading: false });
            get().recalculateTotals();
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          handleError(error, 'Không thể thêm sách vào giỏ hàng', set);
          return false;
        }
      },

      updateQuantity: async (cartId: number, quantity: number) => {
        // Validate input
        if (quantity < 0) {
          toast.error('Số lượng không thể âm');
          return false;
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
          return await get().removeItem(cartId);
        }

        set({ isLoading: true, error: null });
        
        try {
          const result = await updateCartItemAction(cartId, quantity);
          const { success } = handleActionResult(result);
          
          if (success) {
            // Update local state optimistically
            const { items } = get();
            const item = items.find(item => item.id === cartId);
            
            if (item) {
              // Validate against available copies
              const finalQuantity = Math.min(quantity, item.book.availableCopies);
              
              const updatedItems = items.map(item => 
                item.id === cartId 
                  ? { ...item, quantity: finalQuantity, updatedAt: new Date() }
                  : item
              );

              set({ items: updatedItems, isLoading: false });
              get().recalculateTotals();
            } else {
              set({ isLoading: false });
            }
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          handleError(error, 'Không thể cập nhật số lượng', set);
          return false;
        }
      },

      removeItem: async (cartId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await removeCartItemAction(cartId);
          const { success } = handleActionResult(result);
          
          if (success) {
            // Update local state optimistically
            const { items } = get();
            const updatedItems = items.filter(item => item.id !== cartId);
            
            set({ items: updatedItems, isLoading: false });
            get().recalculateTotals();
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          handleError(error, 'Không thể xóa sách khỏi giỏ hàng', set);
          return false;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await clearCartAction();
          const { success } = handleActionResult(result);
          
          if (success) {
            set({
              items: [],
              totalItems: 0,
              totalPrice: 0,
              isLoading: false,
              error: null,
              lastFetch: Date.now()
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          handleError(error, 'Không thể xóa giỏ hàng', set);
          // Reset cart state even if API call fails
          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            lastFetch: Date.now()
          });
          return false;
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items,
        lastFetch: state.lastFetch 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recalculateTotals();
          // Reset loading state on rehydration
          state.isLoading = false;
          state.error = null;
        }
      },
    },
  ),
);