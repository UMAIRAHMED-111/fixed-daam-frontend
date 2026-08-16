import { z } from "zod";
import { DELIVERY_CITY } from "../constants";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number"),
});

export const deliverySchema = z
  .object({
    method: z.enum(["pickup", "delivery"]),
    address: z.string().trim().optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (values.method !== "delivery") return;
    if (!values.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Enter the address we should deliver to",
      });
      return;
    }
    if (!new RegExp(`\\b${DELIVERY_CITY}\\b`, "i").test(values.address)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: `Delivery is currently available in ${DELIVERY_CITY} only, include the city in your address`,
      });
    }
  });
