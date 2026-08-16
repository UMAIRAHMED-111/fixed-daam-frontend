/** One money format for the whole app: grouped thousands, two decimals, PKR. */
const pkr = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 3800 → "3,800.00" */
export const formatAmount = (value) => pkr.format(Number(value) || 0);

/** 3800 → "PKR 3,800.00" */
export const formatPkr = (value) => `PKR ${formatAmount(value)}`;
