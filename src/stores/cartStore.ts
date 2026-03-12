/**
 * Store Zustand pour le panier d'achats
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Retourne le prix effectif d'un produit (promo si active, sinon base_price)
 */
export function getEffectivePrice(product: Product): number {
  const base = Number(product.base_price) || 0;
  const promo = Number((product as any).promo_price) || 0;
  if (promo <= 0 || promo >= base) return base;
  const now = new Date();
  const start = (product as any).promo_start_date ? new Date((product as any).promo_start_date) : null;
  const end = (product as any).promo_end_date ? new Date((product as any).promo_end_date) : null;
  if (start && now < start) return base;
  if (end && now > end) return base;
  return promo;
}

interface CartState {
  items: CartItem[];
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Getters
  getItemCount: () => number;
  getTotal: () => number;
  getItem: (productId: number) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity: number = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.id === product.id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity }],
          });
        }
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter(item => item.product.id !== productId),
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = getEffectivePrice(item.product);
          return total + (price * item.quantity);
        }, 0);
      },

      getItem: (productId: number) => {
        return get().items.find(item => item.product.id === productId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
