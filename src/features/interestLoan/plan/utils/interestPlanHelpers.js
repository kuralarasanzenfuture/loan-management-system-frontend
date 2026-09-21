export const INTEREST_TYPE_OPTIONS = ["percentage", "fixed"];
export const INTEREST_FREQUENCY_OPTIONS = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];
export const CALCULATION_METHOD_OPTIONS = ["simple"];
export const PRINCIPAL_BASIS_OPTIONS = [
  "outstanding_principal",
  "original_principal",
];
export const PAYMENT_TYPE_OPTIONS = ["anytime"];
export const STATUS_OPTIONS = ["active", "inactive"];

export const INTEREST_TYPE_LABELS = {
  percentage: "Percentage (%)",
  fixed: "Fixed Amount (₹)",
};

export const INTEREST_FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const CALCULATION_METHOD_LABELS = {
  simple: "Simple Interest",
};

export const PRINCIPAL_BASIS_LABELS = {
  outstanding_principal: "Outstanding Principal",
  original_principal: "Original Principal",
};

export const PAYMENT_TYPE_LABELS = {
  anytime: "Anytime Repayment",
};

export const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatInterestValue(plan) {
  if (!plan) return "—";
  const val = parseFloat(plan.interest_value || 0);
  if (plan.interest_type === "percentage") {
    return `${val}%`;
  }
  return formatCurrency(val);
}
