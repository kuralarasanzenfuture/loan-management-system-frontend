export const DIRECTION_LABELS = {
  given: "Given (You Lent)",
  borrowed: "Borrowed (You Owe)",
};

export const DIRECTION_STYLES = {
  given: "badge-info badge-outline",
  borrowed: "badge-warning badge-outline",
};

export const STATUS_STYLES = {
  pending: "badge-ghost",
  partial: "badge-warning badge-outline",
  completed: "badge-success badge-outline",
  overdue: "badge-error badge-outline",
  cancelled: "badge-ghost",
};

export const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  bank: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  other: "Other",
};

/**
 * Transaction types supported by backend (POST /hand-loans/:id/transactions):
 * - given loans (company lent money): "collection" (receive repayment from borrower)
 * - borrowed loans (company owes money): "repayment" (pay back to lender)
 * Note: Initial "disbursement" is automatically recorded on loan creation by backend.
 */
export function getTransactionTypesForDirection(direction) {
  if (direction === "borrowed") {
    return [
      {
        value: "repayment",
        label: "Repayment (Pay Back to Lender)",
        moneyDirection: "out",
      },
    ];
  }
  // default: given
  return [
    {
      value: "collection",
      label: "Collection (Receive from Borrower)",
      moneyDirection: "in",
    },
  ];
}

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
