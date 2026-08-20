export const STATUS_STYLES = {
  pending: "badge-ghost",
  partial: "badge-warning badge-outline",
  paid: "badge-success badge-outline",
  overdue: "badge-error badge-outline",
};

export const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];

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

export function isOverdue(installment) {
  if (installment.status === "paid") return false;
  const due = new Date(installment.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
