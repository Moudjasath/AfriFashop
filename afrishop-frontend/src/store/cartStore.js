import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Returns the qty actually added (0 if stock exceeded)
      addItem(product, size = '', qty = 1, color = null) {
        const items    = get().items;
        const key      = `${product.id}-${size}-${color ?? ''}`;
        const existing = items.find(i => i.key === key);
        const stock    = product.stock ?? Infinity;
        const inCart   = existing?.qty ?? 0;
        const canAdd   = Math.max(0, Math.min(qty, stock - inCart));
        if (canAdd === 0) return 0;
        if (existing) {
          set({ items: items.map(i => i.key === key ? { ...i, qty: i.qty + canAdd } : i) });
        } else {
          set({ items: [...items, { ...product, size, color, qty: canAdd, key }] });
        }
        return canAdd;
      },

      removeItem(key) {
        set({ items: get().items.filter(i => i.key !== key) });
      },

      updateQty(key, qty) {
        if (qty < 1) { get().removeItem(key); return; }
        set({ items: get().items.map(i => i.key === key ? { ...i, qty } : i) });
      },

      clearCart() {
        set({ items: [] });
      },

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },

      get count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
    }),
    { name: 'afrishop_cart' }
  )
);
