export const CONDITION_LABELS = {
  new: "New",
  good: "Good",
  fair: "Fair",
  damaged: "Damaged",
};

export const CONDITION_STYLES = {
  new: "badge-success badge-outline",
  good: "badge-info badge-outline",
  fair: "badge-warning badge-outline",
  damaged: "badge-error badge-outline",
};

export const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-ghost",
  sold: "badge-info badge-outline",
  disposed: "badge-error badge-outline",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
