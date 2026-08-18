export const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  cancelled: "badge-error badge-outline",
};

export const PAYMENT_STATUS_STYLES = {
  pending: "badge-ghost",
  partial: "badge-warning badge-outline",
  paid: "badge-success badge-outline",
  overdue: "badge-error badge-outline",
};

export const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  bank: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  other: "Other",
};

export const FREQUENCY_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  custom: "Custom",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
