export const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
  cancelled: "badge-ghost",
};

export const SCHEDULE_STATUS_STYLES = {
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
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  yearly: "Yearly",
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

/**
 * periodsPerYear — how many interest cycles occur per year for a given frequency.
 * Used to derive number of installments from tenure + frequency.
 */
const PERIODS_PER_YEAR = {
  monthly: 12,
  quarterly: 4,
  half_yearly: 2,
  yearly: 1,
};

function tenureInMonths(tenure, tenureType) {
  return tenureType === "years" ? Number(tenure) * 12 : Number(tenure);
}

/**
 * calculateInterestOnlyLoan
 *
 * ASSUMPTION (not confirmed against your backend's actual formula — your
 * create service does the real computation server-side; this is only a
 * client-side PREVIEW so the user sees numbers before submitting):
 * - Simple, non-compounding interest per period:
 *     interestPerPeriod = interest_type === 'percentage'
 *       ? principal * (interest_value / 100)
 *       : interest_value   (flat amount per period)
 * - number_of_periods = tenure (in months) / months-per-period for the frequency
 * - total_interest = interestPerPeriod * number_of_periods
 * - total_payable = principal + total_interest  (principal due at end of term)
 * - commission is deducted from principal at disbursal (net_disbursed = principal - commission)
 *
 * If your backend uses a different formula (e.g. reducing balance, or interest
 * recalculated against outstanding_principal), tell me and this gets corrected —
 * this preview must not be trusted over what the API actually persists.
 */
export function calculateInterestOnlyLoan({
  principal,
  interestType,
  interestValue,
  interestFrequency,
  tenure,
  tenureType,
  commissionType,
  commissionValue,
}) {
  const months = tenureInMonths(tenure, tenureType);
  const monthsPerPeriod = 12 / (PERIODS_PER_YEAR[interestFrequency] || 12);
  const numberOfPeriods =
    monthsPerPeriod > 0 ? Math.round(months / monthsPerPeriod) : 0;

  const p = Number(principal) || 0;
  if (p <= 0) {
    return {
      numberOfPeriods,
      interestPerPeriod: 0,
      totalInterest: 0,
      totalPayable: 0,
      commissionAmount: 0,
      netDisbursed: 0,
    };
  }

  const interestPerPeriod =
    interestType === "percentage"
      ? p * (Number(interestValue) / 100)
      : Number(interestValue) || 0;

  const totalInterest =
    Math.round(interestPerPeriod * numberOfPeriods * 100) / 100;
  const totalPayable = p + totalInterest;

  const commissionAmount =
    commissionType === "percentage"
      ? Math.round(p * (Number(commissionValue) / 100) * 100) / 100
      : commissionType === "fixed"
        ? Number(commissionValue) || 0
        : 0;

  const netDisbursed = Math.max(p - commissionAmount, 0);

  return {
    numberOfPeriods,
    interestPerPeriod,
    totalInterest,
    totalPayable,
    commissionAmount,
    netDisbursed,
  };
}
