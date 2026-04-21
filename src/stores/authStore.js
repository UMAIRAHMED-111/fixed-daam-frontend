import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

const COOKIE_NAME = "fixeddaam-session";
const COOKIE_OPTIONS = {
  expires: 7,
  sameSite: "Strict",
  secure: window.location.protocol === "https:",
};

/**
 * Wrap the js-cookie adapter with createJSONStorage so that Zustand v4 persist
 * receives the serialised JSON string it needs — not a raw StorageValue object,
 * which js-cookie would silently convert to "[object Object]".
 */
const cookieStorage = createJSONStorage(() => ({
  getItem: (name) => Cookies.get(name) ?? null,
  setItem: (name, value) => Cookies.set(name, value, COOKIE_OPTIONS),
  removeItem: (name) => Cookies.remove(name),
}));

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => {
        const user = {
          ...userData,
          storeName:
            userData.storeName ??
            (userData.role === "merchant" ? (userData.name ?? "My Store") : undefined),
        };
        set({ user, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      setStoreName: (storeName) =>
        set((state) => ({
          user: state.user ? { ...state.user, storeName } : null,
        })),

      updateUser: (userData) =>
        set((state) => {
          if (!state.user) return {};
          const merged = { ...state.user, ...userData };
          if (state.user.role === "merchant" && userData.name) {
            merged.storeName = userData.name;
          }
          return { user: merged };
        }),
    }),
    { name: COOKIE_NAME, storage: cookieStorage }
  )
);
