/**
 * Checkout stages, in order. The active one is driven by `?stage=` so the URL is
 * shareable and the browser back button steps back through checkout.
 *
 * There is no delivery stage: delivery comes with every purchase, so the address
 * is collected alongside the rest of the contact details and the buyer arranges
 * timing over WhatsApp afterwards.
 */
export const CHECKOUT_STAGES = [
  { id: "customer", step: "Details", heading: "Your details" },
  { id: "payment", step: "Payment", heading: "Payment" },
  { id: "review", step: "Place order", heading: "Review your order" },
];

export const STAGE_IDS = CHECKOUT_STAGES.map((s) => s.id);
