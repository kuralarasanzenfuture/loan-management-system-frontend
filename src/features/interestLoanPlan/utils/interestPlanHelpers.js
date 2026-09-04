export const INTEREST_FREQUENCY_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  yearly: "Yearly",
};

export const TENURE_TYPE_LABELS = {
  months: "Months",
  years: "Years",
};

export const COMMISSION_TYPE_LABELS = {
  none: "None",
  fixed: "Fixed",
  percentage: "Percentage",
};

export const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInterestValue(plan) {
  return plan.interest_type === "percentage"
    ? `${Number(plan.interest_value).toFixed(2)}%`
    : formatCurrency(plan.interest_value);
}

export function formatCommissionValue(plan) {
  if (plan.commission_type === "none" || !plan.commission_type)
    return "No commission";
  return plan.commission_type === "percentage"
    ? `${Number(plan.commission_value).toFixed(2)}%`
    : formatCurrency(plan.commission_value);
}
