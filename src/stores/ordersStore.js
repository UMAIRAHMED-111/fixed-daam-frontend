import { create } from "zustand";
import { api } from "@/lib/api";

/**
 * Orders store — backed by /v1/orders API.
 * Order shape: { id, buyerId, items[], total, redemptionCode, status: 'locked'|'ready'|'delivered', createdAt }
 */
export const useOrdersStore = create((set, get) => ({
  orders: [],
  loading: false,

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
      set({ loading: false });
    }
  },

  /**
   * Create a new order from cart items with a proof-of-payment image.
   * @param {Array<{productId: string, quantity: number}>} cartItems
   * @param {File} paymentProofFile
   * @returns {Promise<Order>}
   */
  addOrder: async (cartItems, paymentProofFile) => {
    const formData = new FormData();
    formData.append("items", JSON.stringify(cartItems));
    if (paymentProofFile) {
      formData.append("paymentProof", paymentProofFile);
    }
    const res = await api.post("/v1/orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const order = res.data;
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
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
