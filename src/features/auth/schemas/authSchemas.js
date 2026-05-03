import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character (!@#$%^&* …)");

export const buyerSignUpSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const merchantSignUpSchema = z
  .object({
    storeName: z.string().min(1, "Store name is required"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Keep for backward compatibility
export const signUpSchema = buyerSignUpSchema;
