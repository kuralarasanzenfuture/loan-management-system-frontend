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

export function formatLoanTenure(loan) {
  if (!loan) return "";
  const tenure = loan.tenure;
  if (tenure === undefined || tenure === null || tenure === "") return "";

  const n = Number(tenure);
  if (isNaN(n)) return String(tenure);
  const isSingle = n === 1;

  // 1. Explicit tenure_type if present on loan or plan
  const rawType = (loan.tenure_type || "").toLowerCase().trim();
  if (rawType) {
    if (rawType.startsWith("day")) return `${n} ${isSingle ? "day" : "days"}`;
    if (rawType.startsWith("week")) return `${n} ${isSingle ? "week" : "weeks"}`;
    if (rawType.startsWith("month")) return `${n} ${isSingle ? "month" : "months"}`;
    if (rawType.startsWith("year")) return `${n} ${isSingle ? "year" : "years"}`;
    return `${n} ${rawType}`;
  }

  // 2. Infer from collection_frequency (daily -> days, weekly -> weeks, monthly -> months, yearly -> years)
  const freq = (loan.collection_frequency || "").toLowerCase().trim();
  if (freq === "daily") return `${n} ${isSingle ? "day" : "days"}`;
  if (freq === "weekly") return `${n} ${isSingle ? "week" : "weeks"}`;
  if (freq === "monthly") return `${n} ${isSingle ? "month" : "months"}`;
  if (freq === "yearly" || freq === "annual") return `${n} ${isSingle ? "year" : "years"}`;

  // 3. Infer from plan_code or plan_name (e.g. LP-DAILY-100, LP-WEEKLY-12)
  const planInfo = `${loan.plan_code || ""} ${loan.plan_name || ""}`.toLowerCase();
  if (planInfo.includes("daily") || planInfo.includes("day")) return `${n} ${isSingle ? "day" : "days"}`;
  if (planInfo.includes("weekly") || planInfo.includes("week")) return `${n} ${isSingle ? "week" : "weeks"}`;
  if (planInfo.includes("monthly") || planInfo.includes("month")) return `${n} ${isSingle ? "month" : "months"}`;
  if (planInfo.includes("year") || planInfo.includes("annual")) return `${n} ${isSingle ? "year" : "years"}`;

  // 4. Default fallback: installments
  return `${n} ${isSingle ? "installment" : "installments"}`;
}

