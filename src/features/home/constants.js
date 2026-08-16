import { WHATSAPP_NUMBER } from "@/lib/contact";

export const APP_NAME = "FixedDaam";
export const TAGLINE = "Pay now. Buy later. Lock in today's price.";

/**
 * The buyer's sequence. Payment proof and delivery both run over WhatsApp, so
 * the steps say so plainly rather than pointing at anything to upload.
 */
export const HOW_IT_WORKS_STEPS = [
  {
    title: "Lock the price",
    description:
      "Check out at the rate on screen and send the transfer. Once an admin confirms the payment, the shop sets your items aside at that price.",
    icon: "lock",
  },
  {
    title: "Send payment screenshot",
    description: `Send your payment proof to ${WHATSAPP_NUMBER} on WhatsApp. Nothing to upload, and if we don't see it we'll reach out and ask.`,
    icon: "qr",
  },
  {
    title: "Reach out",
    description: `Delivery comes with every purchase. Contact us on WhatsApp (${WHATSAPP_NUMBER}) when you require delivery of your purchase.`,
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
