import { z } from "zod";

/**
 * Stage 1 covers everything we need about the buyer, delivery address included.
 * Delivery ships with every purchase, so there is no method to choose and the
 * address is never optional.
 */
export const customerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number"),
  address: z
    .string()
    .trim()
    .min(5, "Enter the address we should deliver to")
    .max(500, "That address is too long"),
});
