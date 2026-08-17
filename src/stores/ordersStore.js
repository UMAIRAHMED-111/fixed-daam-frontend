import { create } from "zustand";
import { api } from "@/lib/api";

/**
 * Orders store, backed by /v1/orders API.
 * Order shape: { id, buyerId, items[], total, redemptionCode, status: 'locked'|'ready'|'delivered', createdAt }
 */
export const useOrdersStore = create((set, get) => ({
  orders: [],
  loading: false,
  /**
   * False until a fetch has finished at least once. `loading` alone can't carry
   * this: it is still false on the very first render, before the effect that
   * starts the request runs, so a screen keyed on `loading` would flash "no
   * orders yet" for a frame before the skeleton appears.
   */
  hasLoaded: false,

  /** Fetch orders for the current user (buyers: own orders; merchants: orders with their products) */
  fetchOrders: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/v1/orders");
      const data = res.data;
      set({ orders: data.results ?? (Array.isArray(data) ? data : []) });
    } catch {
      // silent
    } finally {
      set({ loading: false, hasLoaded: true });
    }
  },

  /**
   * Create a new order from cart items. Nothing is uploaded: the buyer sends the
   * payment confirmation over WhatsApp and an admin approves it afterwards.
   * Delivery ships with every order, so the address is always required.
   * @param {Array<{productId: string, quantity: number}>} cartItems
   * @param {string} deliveryAddress
   * @returns {Promise<Order>}
   */
  addOrder: async (cartItems, deliveryAddress) => {
    const res = await api.post("/v1/orders", {
      items: cartItems,
      deliveryAddress,
    });
    const order = res.data;
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },

  /**
   * Place an order without an account. The contact details identify the buyer and
   * the response carries a token that tracks this one order.
   * @param {Array<{productId: string, quantity: number}>} cartItems
   * @param {{name: string, email: string, phoneNumber: string, address: string}} contact
   * @returns {Promise<{order: Object, guestToken: string}>}
   */
  addGuestOrder: async (cartItems, contact) => {
    const res = await api.post("/v1/orders/guest", {
      items: cartItems,
      name: contact.name,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      deliveryAddress: contact.address,
    });
    return res.data;
  },

  markReady: async (orderId) => {
    const res = await api.patch(`/v1/orders/${orderId}/status`, { status: "ready" });
    const updated = res.data;
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
  },

  markDelivered: async (orderId) => {
    const res = await api.patch(`/v1/orders/${orderId}/status`, { status: "delivered" });
    const updated = res.data;
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
  },

  getOrdersForMerchant: (merchantId) =>
    get().orders.filter((o) =>
      o.items.some((i) => i.merchantId === merchantId)
    ),

  validateCode: async (code) => {
    const res = await api.post("/v1/orders/validate-code", { code });
    return res.data;
  },

  /**
   * Fulfill (full or partial) a buyer's pickup against their live TOTP code.
   * @param {string} orderId
   * @param {string} code 6-digit TOTP from the buyer
   * @param {Array<{itemIndex: number, quantity: number}>} pickups
   */
  fulfillOrder: async (orderId, code, pickups) => {
    const res = await api.post(`/v1/orders/${orderId}/fulfill`, { code, pickups });
    const updated = res.data;
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
    return updated;
  },
}));
