import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],

      toggle(id) {
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] });
      },

      has(id) {
        return get().ids.includes(id);
      },

      clearAll() {
        set({ ids: [] });
      },
    }),
    { name: 'afrishop_wish' }
  )
);
