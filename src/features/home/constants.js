export const APP_NAME = "FixedDaam";
export const TAGLINE = "Pay now. Buy later. Lock in today's price.";

/**
 * The buyer's sequence. Wording matches what the product actually does: a
 * rotating six-digit code shown at the counter, not a QR code.
 */
export const HOW_IT_WORKS_STEPS = [
  {
    title: "Pay today's price",
    description:
      "Check out at the rate on screen and send the transfer. Once an admin confirms the payment, the shop sets your items aside at that price.",
    icon: "lock",
  },
  {
    title: "Keep your code",
    description:
      "Your order carries a six-digit code that refreshes every couple of minutes. It lives on your order page, so there is nothing to print or lose.",
    icon: "qr",
  },
  {
    title: "Collect when you want",
    description:
      "Show the code at the counter and take what you need. Come back for the rest whenever, still at the price you paid.",
    icon: "retrieve",
  },
];

/** The merchant's side of the same transaction. */
export const MERCHANT_STEPS = [
  {
    title: "List what you sell",
    description:
      "Add your items with today's price and how much you hold. Stock and reservations stay in one view.",
  },
  {
    title: "Take payment up front",
    description:
      "Buyers pay before they collect, so the money is in hand while the goods stay on your shelf.",
  },
  {
    title: "Check the code, hand it over",
    description:
      "Enter the buyer's six-digit code to confirm the order, then release all of it or part of it. The rest stays reserved.",
  },
];
