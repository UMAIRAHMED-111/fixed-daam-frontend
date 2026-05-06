import { z } from "zod";
import { UOM_VALUES, BUNDLE_BASE_UOM_OPTIONS, getUom } from "../data/uomData";

const BUNDLE_BASE_VALUES = BUNDLE_BASE_UOM_OPTIONS.map((u) => u.value);

export const productFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    description: z.string().max(2000, "Description is too long").optional(),
    price: z.coerce.number().min(0, "Price must be 0 or more"),
    category: z.string().min(1, "Category is required"),
    uom: z.enum(UOM_VALUES, { errorMap: () => ({ message: "Pick a unit of measure" }) }),
    stock: z.coerce.number().min(0, "Stock must be 0 or more"),
    bundleSize: z
      .union([z.coerce.number().int().min(1, "Bundle size must be at least 1"), z.literal("")])
      .optional(),
    bundleUom: z.string().optional(),
    bundleLabel: z.string().max(40).optional(),
  })
  .superRefine((data, ctx) => {
    const uomDef = getUom(data.uom);
    if (uomDef.integer && !Number.isInteger(Number(data.stock))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stock"],
        message: `Stock must be a whole number for ${uomDef.short}`,
      });
    }
    if (data.uom === "bundle") {
      if (!data.bundleSize || Number(data.bundleSize) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bundleSize"],
          message: "Bundle size is required",
        });
      }
      if (!data.bundleUom || !BUNDLE_BASE_VALUES.includes(data.bundleUom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bundleUom"],
          message: "Pick what's inside the bundle",
        });
      }
    }
  });
