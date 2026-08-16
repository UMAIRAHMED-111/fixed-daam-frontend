/** Flat standard delivery fee (PKR). Mirrors DELIVERY_FEE in the backend order service. */
export const DELIVERY_FEE = 100;

/** Delivery is currently offered in this city only. */
export const DELIVERY_CITY = "Karachi";

/**
 * Checkout stages, in order. The active one is driven by `?stage=` so the URL is
 * shareable and the browser back button steps back through checkout.
 */
export const CHECKOUT_STAGES = [
  { id: "customer", step: "Contact", heading: "Contact details" },
  { id: "delivery", step: "Delivery", heading: "How would you like to get it?" },
  { id: "payment", step: "Payment", heading: "Payment" },
  { id: "review", step: "Place order", heading: "Review your order" },
];

export const STAGE_IDS = CHECKOUT_STAGES.map((s) => s.id);

/** Where buyers send the bank transfer. Payment is verified by an admin afterwards. */
export const BANK_DETAILS = {
  bankName: "DBBL",
  accountName: "FixedDaam Ltd.",
  accountNumber: "XXXXXXXXXXXXXXXX",
  branch: "Gulshan",
  iban: "PKXXXXXXXXXXXXXXXXXXXXXXXX",
};
