import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      token:       null,
      loading:     false,
      initialized: false,  // true once the boot check ran

      // ── Actions ──────────────────────────────────────────

      async login(email, password) {
        set({ loading: true });
        try {
          const data = await authApi.login(email, password);
          // Symfony json_login returns { token }
          // Then fetch the user profile with that token
          set({ token: data.token });
          const me = await authApi.me();
          set({ user: me.user, loading: false });
          return { ok: true };
        } catch (err) {
          set({ loading: false });
          return { ok: false, message: err.message, fields: err.fields || {} };
        }
      },

      async register(email, password, fullName) {
        set({ loading: true });
        try {
          // Register returns { token, user } directly
          const data = await authApi.register(email, password, fullName);
          set({ token: data.token, user: data.user, loading: false });
          return { ok: true };
        } catch (err) {
          set({ loading: false });
          return { ok: false, message: err.message, fields: err.fields || {} };
        }
      },

      logout() {
        set({ user: null, token: null });
      },

      // Called once on app boot to revalidate a stored token
      async init() {
        if (get().initialized) return;
        const token = get().token;
        if (!token) { set({ initialized: true }); return; }

        try {
          const me = await authApi.me();
          set({ user: me.user, initialized: true });
        } catch {
          // Token expired or invalid — clear silently
          set({ user: null, token: null, initialized: true });
        }
      },

      isLoggedIn() {
        return !!get().token && !!get().user;
      },
    }),
    {
      name: 'afrishop_auth',
      // Only persist token + user, not loading/initialized
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

// Listen to 401 events emitted by the API client → auto-logout
if (typeof window !== 'undefined') {
  window.addEventListener('afrishop:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
