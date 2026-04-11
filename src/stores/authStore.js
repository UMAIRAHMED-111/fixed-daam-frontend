import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

const COOKIE_NAME = "fixeddaam-session";
const COOKIE_OPTIONS = {
  expires: 7,          // days — aligns with refresh token lifetime
  sameSite: "Strict",
  secure: window.location.protocol === "https:",
};

/**
 * Store only non-sensitive session info (user object, isAuthenticated).
 * JWT tokens are in HttpOnly cookies managed entirely by the server —
 * JavaScript cannot read them, which is the security benefit.
 */
const cookieStorage = {
  getItem: (name) => Cookies.get(name) ?? null,
  setItem: (name, value) => Cookies.set(name, value, COOKIE_OPTIONS),
  removeItem: (name) => Cookies.remove(name),
};

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
          // Keep storeName in sync with name for merchants
          if (state.user.role === "merchant" && userData.name) {
            merged.storeName = userData.name;
          }
          return { user: merged };
        }),
    }),
    { name: COOKIE_NAME, storage: cookieStorage }
  )
);
