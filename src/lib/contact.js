/**
 * How buyers reach us, in one place.
 *
 * The same number takes the payment, receives the confirmation screenshot, and
 * arranges delivery, so screens across checkout, order tracking and the landing
 * page all read it from here rather than hardcoding it three ways.
 */

/** Digits as the buyer would dial or save them locally. */
export const WHATSAPP_NUMBER = "03321144623";

/** International form, for wa.me links. */
const WHATSAPP_INTL = "923321144623";

/** Where buyers send the transfer. Verified by an admin afterwards. */
export const PAYMENT_DETAILS = {
  bankName: "SadaPay",
  accountNumber: WHATSAPP_NUMBER,
  accountName: "Nauman",
};

/**
 * A wa.me link, optionally pre-filled with a message.
 * @param {string} [message] - Prefilled chat text
 * @returns {string}
 */
export const whatsappLink = (message) =>
  `https://wa.me/${WHATSAPP_INTL}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
