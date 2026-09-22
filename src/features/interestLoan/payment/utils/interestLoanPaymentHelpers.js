import React from "react";
import {
  Banknote,
  Building2,
  Smartphone,
  FileCheck2,
  Coins,
  ArrowDownRight,
  Split,
  Percent,
  TrendingDown,
} from "lucide-react";

/**
 * Payment Mode Options and Configuration
 */
export const PAYMENT_MODE_CONFIG = {
  cash: {
    label: "Cash",
    badge: "badge-success/15 text-success border-success/30",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Banknote,
  },
  bank: {
    label: "Bank Transfer",
    badge: "badge-primary/15 text-primary border-primary/30",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Building2,
  },
  upi: {
    label: "UPI",
    badge: "badge-secondary/15 text-secondary border-secondary/30",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Smartphone,
  },
  cheque: {
    label: "Cheque",
    badge: "badge-warning/15 text-warning border-warning/30",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: FileCheck2,
  },
  other: {
    label: "Other",
    badge: "badge-ghost text-base-content/70 border-base-300",
    bg: "bg-base-200 text-base-content/70 border-base-300",
    icon: Coins,
  },
};

export const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];

/**
 * Allocation Strategy Config
 */
export const ALLOCATION_STRATEGIES = {
  auto: {
    label: "Automatic (FIFO)",
    desc: "Settles overdue/due interest periods in chronological order first; remaining amount reduces outstanding principal.",
    badge: "badge-info/15 text-info border-info/30",
    icon: ArrowDownRight,
  },
  interest_only: {
    label: "Interest Only",
    desc: "Allocates payment strictly across unpaid interest billing periods.",
    badge: "badge-primary/15 text-primary border-primary/30",
    icon: Percent,
  },
  principal_only: {
    label: "Principal Pre-payment",
    desc: "Applies 100% of the payment directly to reduce outstanding principal principal balance.",
    badge: "badge-success/15 text-success border-success/30",
    icon: TrendingDown,
  },
  manual: {
    label: "Manual Split",
    desc: "Specify exact amounts to split between interest settlement and principal reduction.",
    badge: "badge-secondary/15 text-secondary border-secondary/30",
    icon: Split,
  },
};

/**
 * Format currency without trailing zeros (e.g. ₹5,000 or ₹5,000.50)
 */
export const formatCurrency = (val) => {
  if (val == null || val === "" || isNaN(val)) return "₹0";
  const num = parseFloat(val);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
};

/**
 * Format plain number with commas
 */
export const formatNumber = (val) => {
  if (val == null || val === "" || isNaN(val)) return "0";
  const num = parseFloat(val);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
};

/**
 * Format date string YYYY-MM-DD to readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
};

/**
 * Format date-time string to readable date + time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateStr);
  }
};

export const periodOutstanding = (period) =>
  Number(
    period?.outstanding_interest_amount ??
      period?.outstanding_amount ??
      0
  );

export const loanTotalOutstanding = (loan) => {
  if (!loan) return 0;
  const principal = Number(loan.outstanding_principal || 0);
  const interest = Number(loan.outstanding_interest || 0);
  const periodInterest = Array.isArray(loan.periods)
    ? loan.periods.reduce((sum, p) => sum + periodOutstanding(p), 0)
    : 0;
  return principal + Math.max(interest, periodInterest);
};
