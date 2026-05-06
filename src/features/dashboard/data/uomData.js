/**
 * Units of measure used for products.
 * `step` is the numeric input granularity for price/stock when this UOM is active.
 * `integer: true` means stock and order qty must be whole numbers.
 */
export const UOM_OPTIONS = [
  { value: "each", label: "Each / unit", short: "unit", step: 1, integer: true },
  { value: "kg", label: "Kilogram (kg)", short: "kg", step: 0.01, integer: false },
  { value: "g", label: "Gram (g)", short: "g", step: 1, integer: true },
  { value: "l", label: "Liter (L)", short: "L", step: 0.01, integer: false },
  { value: "ml", label: "Milliliter (mL)", short: "mL", step: 1, integer: true },
  { value: "m", label: "Meter (m)", short: "m", step: 0.01, integer: false },
  { value: "bundle", label: "Bundle / Pack", short: "bundle", step: 1, integer: true },
];

export const UOM_VALUES = UOM_OPTIONS.map((u) => u.value);

/** Bundle's inner UOM excludes "bundle" itself (no bundles of bundles). */
export const BUNDLE_BASE_UOM_OPTIONS = UOM_OPTIONS.filter((u) => u.value !== "bundle");

export const getUom = (value) =>
  UOM_OPTIONS.find((u) => u.value === value) ?? UOM_OPTIONS[0];

/**
 * Human-readable suffix for displaying a price.
 * e.g. "/kg", "/L", "/bundle (12 × 1 L)"
 */
export const formatUomSuffix = (item) => {
  if (!item?.uom) return "";
  if (item.uom === "bundle") {
    const inner = getUom(item.bundleUom);
    if (item.bundleSize && inner) {
      return `/${item.bundleLabel || "bundle"} (${item.bundleSize} × ${inner.short})`;
    }
    return `/${item.bundleLabel || "bundle"}`;
  }
  return `/${getUom(item.uom).short}`;
};

/**
 * Format a quantity with the proper UOM suffix.
 * Examples: 12 → "12 kg" (uom=kg) | 3 → "3 cases" (bundle, label=case)
 *           5 → "5 units" (each)
 */
export const formatQuantity = (qty, item) => {
  const n = Number(qty) || 0;
  const uom = item?.uom || "each";
  if (uom === "bundle") {
    const word = (item?.bundleLabel || "bundle").trim() || "bundle";
    const plural = n === 1 ? word : `${word}s`;
    return `${formatNumber(n)} ${plural}`;
  }
  if (uom === "each") {
    return `${formatNumber(n)} ${n === 1 ? "unit" : "units"}`;
  }
  return `${formatNumber(n)} ${getUom(uom).short}`;
};

/** Drop trailing zeros for display (e.g. 12.50 → "12.5", 3.00 → "3"). */
const formatNumber = (n) => {
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(3)).toString();
};

/** Per-unit price label, e.g. "PKR 250.00 / kg" or "PKR 1200 / case". */
export const formatUnitPrice = (item) => {
  const price = Number(item?.price) || 0;
  const suffix = formatUomSuffix(item).replace(/^\//, " / ");
  return `PKR ${price.toFixed(2)}${suffix}`;
};

/**
 * Total deliverable quantity for an order item, in the deliverable UOM.
 * For bundles this is `quantity × bundleSize` (in inner UOM), otherwise just `quantity`.
 */
export const getDeliverableTotal = (item) => {
  if (!item) return 0;
  if (item.uom === "bundle" && item.bundleSize) {
    return Number(item.quantity || 0) * Number(item.bundleSize);
  }
  return Number(item.quantity || 0);
};

/** Short label for the unit a buyer actually walks away with. */
export const getDeliverableUomShort = (item) => {
  if (!item) return "";
  if (item.uom === "bundle") {
    const inner = item.bundleUom ? getUom(item.bundleUom) : null;
    return inner ? inner.short : "unit";
  }
  if (item.uom === "each") return "unit";
  return getUom(item.uom).short;
};

/** Whether the deliverable UOM accepts only whole-number pickups. */
export const isDeliverableInteger = (item) => {
  if (!item) return true;
  if (item.uom === "bundle") {
    const inner = item.bundleUom ? getUom(item.bundleUom) : null;
    return inner ? inner.integer : true;
  }
  return getUom(item.uom).integer;
};

/** Step granularity for the qty input matching the deliverable UOM. */
export const getDeliverableStep = (item) => {
  if (!item) return 1;
  if (item.uom === "bundle") {
    const inner = item.bundleUom ? getUom(item.bundleUom) : null;
    return inner ? inner.step : 1;
  }
  return getUom(item.uom).step;
};

export const getRemainingDeliverable = (item) => {
  const total = getDeliverableTotal(item);
  const delivered = Number(item?.quantityDelivered || 0);
  return Math.max(0, total - delivered);
};

const pluralize = (n, word) => `${formatNumber(n)} ${n === 1 ? word : `${word}s`}`;

/** "12 loaves", "3.5 kg", "5 units" — qty in deliverable units, with proper noun. */
export const formatDeliverableQty = (qty, item) => {
  const n = Number(qty) || 0;
  if (!item) return formatNumber(n);
  if (item.uom === "bundle") {
    const inner = item.bundleUom ? getUom(item.bundleUom) : null;
    if (!inner) return pluralize(n, "unit");
    if (inner.value === "each") return pluralize(n, "unit");
    return `${formatNumber(n)} ${inner.short}`;
  }
  if (item.uom === "each") return pluralize(n, "unit");
  return `${formatNumber(n)} ${getUom(item.uom).short}`;
};
