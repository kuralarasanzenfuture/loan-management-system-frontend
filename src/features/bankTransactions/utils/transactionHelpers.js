export const REFERENCE_TYPE_LABELS = {
  loan_collection: "Loan Collection",
  loan_disbursement: "Loan Disbursement",
  expense: "Expense",
  income: "Income",
  cash_deposit: "Cash Deposit",
  cash_withdrawal: "Cash Withdrawal",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  neft: "NEFT",
  rtgs: "RTGS",
  imps: "IMPS",
  cheque: "Cheque",
  cash_deposit: "Cash Deposit",
  other: "Other",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(value) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
