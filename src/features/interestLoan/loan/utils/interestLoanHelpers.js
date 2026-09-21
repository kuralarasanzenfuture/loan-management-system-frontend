/**
 * Format currency in Indian Rupee format (₹)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }
  const num = parseFloat(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format percentage rate or fixed fee
 */
export const formatRate = (rate, type = "percentage") => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return "0%";
  }
  const num = parseFloat(rate);
  if (type === "fixed") {
    return formatCurrency(num);
  }
  return `${parseFloat(num.toFixed(4))}%`;
};

/**
 * Format date string (YYYY-MM-DD or ISO) to display format (e.g. 12 Sep 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Frequency display labels & styling classes matching theme
 */
export const FREQUENCY_CONFIG = {
  daily: {
    label: "Daily",
    badge: "badge badge-xs badge-warning badge-outline",
  },
  weekly: {
    label: "Weekly",
    badge: "badge badge-xs badge-info badge-outline",
  },
  monthly: {
    label: "Monthly",
    badge: "badge badge-xs badge-primary badge-outline",
  },
  yearly: {
    label: "Yearly",
    badge: "badge badge-xs badge-secondary badge-outline",
  },
};

/**
 * Loan Status configuration matching application theme
 */
export const LOAN_STATUS_CONFIG = {
  active: {
    label: "Active",
    badge: "badge badge-sm badge-info badge-outline gap-1.5 font-medium",
    dot: "bg-info",
  },
  completed: {
    label: "Completed",
    badge: "badge badge-sm badge-success badge-outline gap-1.5 font-medium",
    dot: "bg-success",
  },
  closed: {
    label: "Closed",
    badge: "badge badge-sm badge-ghost gap-1.5 font-medium",
    dot: "bg-base-content/40",
  },
  cancelled: {
    label: "Cancelled",
    badge: "badge badge-sm badge-error badge-outline gap-1.5 font-medium",
    dot: "bg-error",
  },
};

/**
 * Period Status configuration matching application theme
 */
export const PERIOD_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badge: "badge badge-sm badge-warning badge-outline gap-1.5 font-medium",
    dot: "bg-warning",
  },
  due: {
    label: "Due",
    badge: "badge badge-sm badge-error badge-outline gap-1.5 font-medium",
    dot: "bg-error",
  },
  partial: {
    label: "Partial",
    badge: "badge badge-sm badge-info badge-outline gap-1.5 font-medium",
    dot: "bg-info",
  },
  paid: {
    label: "Paid",
    badge: "badge badge-sm badge-success badge-outline gap-1.5 font-medium",
    dot: "bg-success",
  },
};
