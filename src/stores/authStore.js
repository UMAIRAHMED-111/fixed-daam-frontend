import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  login: (userData, accessToken, refreshToken) => {
    const user = {
      ...userData,
      storeName: userData.storeName ?? (userData.role === "merchant" ? (userData.name ?? "My Store") : undefined),
    };
    set({ user, token: accessToken, refreshToken: refreshToken ?? null, isAuthenticated: true });
  },
  logout: () =>
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
  setStoreName: (storeName) =>
    set((state) => ({
      user: state.user ? { ...state.user, storeName } : null,
    })),
  updateUser: (userData) =>
    set((state) => {
      if (!state.user) return {};
      const merged = { ...state.user, ...userData };
      // Keep storeName in sync with name for merchants
      if (state.user.role === "merchant" && userData.name) {
        merged.storeName = userData.name;
      }
      return { user: merged };
    }),
  setTokens: (accessToken, refreshToken) =>
    set({ token: accessToken, refreshToken: refreshToken ?? null }),
}));
