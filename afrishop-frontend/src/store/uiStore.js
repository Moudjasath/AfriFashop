import { create } from 'zustand';

export const useUiStore = create(set => ({
  cartOpen:     false,
  authOpen:     false,
  toast:        null,   // { message, id }

  openCart:     () => set({ cartOpen: true }),
  closeCart:    () => set({ cartOpen: false }),
  toggleCart:   () => set(s => ({ cartOpen: !s.cartOpen })),

  openAuth:     () => set({ authOpen: true }),
  closeAuth:    () => set({ authOpen: false }),

  showToast(message, duration = 2800) {
    const id = Date.now();
    set({ toast: { message, id } });
    setTimeout(() => set(s => s.toast?.id === id ? { toast: null } : {}), duration);
  },
}));
