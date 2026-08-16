import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Cart item: { productId, name, price, image, quantity, merchantId? }
 *
 * Persisted to localStorage so a signed-out shopper keeps their cart across the
 * sign-in round-trip at checkout (and across reloads).
 */
export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const newItems = existing
            ? state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [
                ...state.items,
                {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0] ?? product.image,
                  quantity,
                  merchantId: product.merchantId ?? null,
                  merchantName: product.merchantName ?? null,
                  uom: product.uom ?? "each",
                  bundleSize: product.bundleSize ?? null,
                  bundleUom: product.bundleUom ?? null,
                  bundleLabel: product.bundleLabel ?? "",
                },
              ];
          return { items: newItems };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "fixeddaam-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function getCartTotalItems(state) {
  return state.items.reduce((s, i) => s + i.quantity, 0);
}
export function getCartTotalAmount(state) {
  return state.items.reduce((s, i) => s + i.price * i.quantity, 0);
}
