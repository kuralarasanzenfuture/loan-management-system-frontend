/**
 * loanCalculations.js
 *
 * Derives commission, net disbursed amount, installment amount, total
 * repayment, and end date from a loan amount + the selected loan plan.
 *
 * ASSUMPTIONS (no interest_rate column exists on loans or loan_plans):
 * - total_repayment = loan_amount (borrower repays the full principal;
 *   the platform's margin comes from commission_amount deducted at disbursal)
 * - number_of_installments = plan.tenure (tenure is expressed in the same
 *   unit as collection_frequency, e.g. tenure=100 + tenure_type=days +
 *   collection_frequency=daily => 100 daily installments)
 * - installment_amount = total_repayment / number_of_installments
 * - end_date = start_date + tenure (tenure_type)
 *
 * If your backend calculates these differently (e.g. adds interest), tell
 * me the formula and I'll adjust this file — the UI just calls calculate().
 */

export function calculateLoanDerivedFields({ loanAmount, plan, startDate }) {
  const amount = Number(loanAmount) || 0;

  if (!plan || amount <= 0) {
    return {
      commission_amount: 0,
      net_disbursed_amount: 0,
      installment_amount: 0,
      total_repayment: 0,
      end_date: "",
      installment_count: 0,
    };
  }

  const commission =
    plan.commission_type === "percentage"
      ? Math.round(((amount * Number(plan.commission_value)) / 100) * 100) / 100
      : Number(plan.commission_value) || 0;

  const netDisbursed = Math.max(amount - commission, 0);
  const totalRepayment = amount; // see assumption above
  const installmentCount = Number(plan.tenure) || 1;
  const installmentAmount =
    Math.round((totalRepayment / installmentCount) * 100) / 100;

  const endDate = addTenureToDate(startDate, plan.tenure, plan.tenure_type);

  return {
    commission_amount: commission,
    net_disbursed_amount: netDisbursed,
    installment_amount: installmentAmount,
    total_repayment: totalRepayment,
    end_date: endDate,
    installment_count: installmentCount,
  };
}

function addTenureToDate(startDate, tenure, tenureType) {
  if (!startDate || !tenure) return "";
  const date = new Date(startDate);
  if (isNaN(date.getTime())) return "";

  const n = Number(tenure);
  if (tenureType === "days") date.setDate(date.getDate() + n);
  else if (tenureType === "weeks") date.setDate(date.getDate() + n * 7);
  else if (tenureType === "months") date.setMonth(date.getMonth() + n);

  return date.toISOString().slice(0, 10);
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
