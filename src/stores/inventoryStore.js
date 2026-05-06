import { create } from "zustand";
import { api } from "@/lib/api";

/**
 * Inventory store — backed by /v1/products API.
 * Product shape: { id, merchantId, merchantName, name, description, price, category, stock, images[], isActive, createdAt }
 */
export const useInventoryStore = create((set, get) => ({
  products: [],
  loading: false,

  /** Fetch all active products (buyer view) */
  fetchAllProducts: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get("/v1/products", { params });
      const data = res.data;
      set({ products: data.results ?? (Array.isArray(data) ? data : []) });
    } catch {
      // silent
    } finally {
      set({ loading: false });
    }
  },

  /** Fetch all products belonging to a specific merchant */
  fetchMerchantProducts: async (merchantId) => {
    if (!merchantId) return;
    set({ loading: true });
    try {
      const res = await api.get("/v1/products", { params: { merchantId } });
      const data = res.data;
      set({ products: data.results ?? (Array.isArray(data) ? data : []) });
    } catch {
      // silent
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (payload) => {
    const isInteger = payload.uom !== "kg" && payload.uom !== "l" && payload.uom !== "m";
    const stock = isInteger
      ? Math.max(0, Math.floor(Number(payload.stock) || 0))
      : Math.max(0, Number(payload.stock) || 0);
    const res = await api.post("/v1/products", {
      name: payload.name,
      description: payload.description ?? "",
      price: Number(payload.price),
      category: payload.category,
      stock,
      images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
      uom: payload.uom ?? "each",
      bundleSize: payload.bundleSize ?? null,
      bundleUom: payload.bundleUom ?? null,
      bundleLabel: payload.bundleLabel ?? "",
    });
    const product = res.data;
    set((state) => ({ products: [product, ...state.products] }));
    return product;
  },

  updateProduct: async (id, payload) => {
    const body = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.price != null) body.price = Number(payload.price);
    if (payload.category !== undefined) body.category = payload.category;
    if (payload.stock != null) {
      const isInteger =
        payload.uom !== "kg" && payload.uom !== "l" && payload.uom !== "m";
      body.stock = isInteger
        ? Math.max(0, Math.floor(Number(payload.stock)))
        : Math.max(0, Number(payload.stock));
    }
    if (Array.isArray(payload.images)) body.images = payload.images.filter(Boolean);
    if (payload.uom !== undefined) body.uom = payload.uom;
    if (payload.bundleSize !== undefined) body.bundleSize = payload.bundleSize;
    if (payload.bundleUom !== undefined) body.bundleUom = payload.bundleUom;
    if (payload.bundleLabel !== undefined) body.bundleLabel = payload.bundleLabel;

    const res = await api.patch(`/v1/products/${id}`, body);
    const updated = res.data;
    set((state) => ({
      products: state.products.map((p) => (p.id !== id ? p : updated)),
    }));
    return updated;
  },

  removeProduct: async (id) => {
    await api.delete(`/v1/products/${id}`);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  getByMerchant: (merchantId) =>
    get().products.filter((p) => p.merchantId === merchantId),

  getProductById: (id) => get().products.find((p) => p.id === id),
}));
