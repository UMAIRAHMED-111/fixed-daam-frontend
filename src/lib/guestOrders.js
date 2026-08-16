/**
 * Guest order tracking links, kept in localStorage.
 *
 * A guest has no account, so the token returned at checkout is the only way back
 * to their order. We store it on the device and surface it from the confirmation
 * screen, and the link itself carries the token so it works anywhere.
 */
const KEY = "fixeddaam-guest-orders";

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Most recent first, deduped by order id. */
export const getGuestOrders = () => read();

export const rememberGuestOrder = ({ orderId, token, total, placedAt }) => {
  try {
    const next = [
      { orderId, token, total, placedAt: placedAt ?? new Date().toISOString() },
      ...read().filter((o) => o.orderId !== orderId),
    ].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode, quota). The link still works.
  }
};

export const getGuestOrderToken = (orderId) =>
  read().find((o) => o.orderId === orderId)?.token ?? null;

/** Shareable path that works on any device. */
export const guestOrderPath = (orderId, token) =>
  `/track/${orderId}?token=${encodeURIComponent(token)}`;
