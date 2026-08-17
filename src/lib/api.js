import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send HttpOnly auth cookies automatically on every request
});

let isRefreshing = false;
let waitQueue = [];

const flushQueue = (error) => {
  waitQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve()));
  waitQueue = [];
};

// On 401: silently refresh the access token then retry. Only logout if refresh itself fails.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes("/auth/refresh-tokens");
    const isLogoutCall = original?.url?.includes("/auth/logout");
    // reset-password answers 401 for an expired or spent link. That is the real
    // answer for the caller, not a stale access token, so it must not be turned
    // into a refresh attempt that fails and logs the visitor out with the wrong
    // message. These are signed-out endpoints, so refreshing could never help.
    const isPasswordResetCall =
      original?.url?.includes("/auth/reset-password") || original?.url?.includes("/auth/forgot-password");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isRefreshCall &&
      !isLogoutCall &&
      !isPasswordResetCall
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Refresh sets new HttpOnly accessToken + refreshToken cookies server-side.
        // No token data needed in JS, the browser handles cookies automatically.
        await api.post("/v1/auth/refresh-tokens");
        flushQueue(null);
        return api(original);
      } catch (refreshError) {
        flushQueue(refreshError);
        const { useAuthStore } = await import("@/stores/authStore");
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
