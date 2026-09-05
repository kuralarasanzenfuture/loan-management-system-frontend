import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Loader2,
  Receipt,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Printer,
  CheckCircle2,
  Hash,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency } from "../utils/interestOnlyLoanHelpers.js";
import { printInterestReceipt } from "../utils/printInterestReceipt.js";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

/**
 * InterestOnlyPaymentModal
 * Modal to record repayments against an interest-only loan.
 * Restricts installment payments to that installment's due amount (cannot pay more).
 * Includes instant receipt printing upon successful payment.
 */
export default function InterestOnlyPaymentModal({
  open,
  loan,
  defaultAmount = null,
  defaultRemarks = "",
  initialValues = null,
  loading = false,
  error = null,
  company = null,
  onClose,
  onSubmit,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const reduxCompany = useSelector((state) => state.companyDetails?.company);
  const effectiveCompany = company || reduxCompany || {};

  useEffect(() => {
    if (open && !company && !reduxCompany) {
      dispatch(fetchCompanyDetails());
    }
  }, [open, company, reduxCompany, dispatch]);

  // Determine if this payment is targeting a specific schedule/installment
  const targetScheduleDue =
    initialValues?.schedule_due !== undefined &&
    initialValues?.schedule_due !== null
      ? Number(initialValues.schedule_due)
      : loan?.schedule_due !== undefined && loan?.schedule_due !== null
      ? Number(loan.schedule_due)
      : null;

  const targetScheduleId =
    initialValues?.schedule_id || loan?.schedule_id || null;
  const targetScheduleNo =
    initialValues?.schedule_no || loan?.schedule_no || null;

  const isInstallmentPayment = Boolean(
    targetScheduleDue !== null && targetScheduleDue > 0,
  );

  const outstandingInterest = Number(loan?.outstanding_interest || 0);
  const outstandingPrincipal = Number(loan?.outstanding_principal || 0);
  const totalOutstanding = Number(
    (outstandingInterest + outstandingPrincipal).toFixed(2),
  );

  // Maximum allowed payable amount
  const maxAllowedAmount = isInstallmentPayment
    ? targetScheduleDue
    : totalOutstanding;

  const effectiveAmount =
    initialValues?.payment_amount !== undefined &&
    initialValues?.payment_amount !== null
      ? initialValues.payment_amount
      : defaultAmount;
  const effectiveRemarks =
    initialValues?.remarks !== undefined && initialValues?.remarks !== null
      ? initialValues.remarks
      : defaultRemarks;

  const [form, setForm] = useState({
    payment_amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_mode: "cash",
    transaction_reference: "",
    cheque_number: "",
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const prevOpenRef = useRef(false);

  useEffect(() => {
    // When modal transitions from closed to open:
    if (!prevOpenRef.current && open) {
      setSuccessData(null);
      setLocalError(null);

      const defaultFill =
        effectiveAmount !== null && effectiveAmount !== undefined
          ? String(Math.min(Number(effectiveAmount), maxAllowedAmount))
          : isInstallmentPayment
            ? String(targetScheduleDue)
            : outstandingInterest > 0
              ? String(outstandingInterest)
              : String(totalOutstanding || "");

      setForm({
        payment_amount: defaultFill,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_mode: "cash",
        transaction_reference: "",
        cheque_number: "",
        remarks:
          effectiveRemarks ||
          (targetScheduleNo
            ? `Repayment for Schedule #${targetScheduleNo}`
            : ""),
      });
      setFieldErrors({});
    }

    // When modal closes:
    if (!open) {
      setSuccessData(null);
      setLocalError(null);
    }

    prevOpenRef.current = open;
  }, [
    open,
    effectiveAmount,
    effectiveRemarks,
    isInstallmentPayment,
    targetScheduleDue,
    targetScheduleNo,
    maxAllowedAmount,
    outstandingInterest,
    totalOutstanding,
  ]);

  if (!open || !loan) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleQuickAmount = (amt) => {
    const safeAmt = Math.min(amt, maxAllowedAmount);
    setForm((prev) => ({ ...prev, payment_amount: String(safeAmt) }));
    setFieldErrors((prev) => ({ ...prev, payment_amount: null }));
  };

  const validate = () => {
    const errors = {};
    const amount = Number(form.payment_amount);

    if (!form.payment_amount || isNaN(amount) || amount <= 0) {
      errors.payment_amount = "Enter a valid positive amount";
    } else if (isInstallmentPayment && amount > targetScheduleDue) {
      errors.payment_amount = `Amount cannot exceed installment #${targetScheduleNo || ""} due of ${formatCurrency(targetScheduleDue)}. You cannot pay more than this installment.`;
    } else if (amount > totalOutstanding) {
      errors.payment_amount = `Amount cannot exceed total outstanding (${formatCurrency(totalOutstanding)})`;
    }

    if (!form.payment_date) {
      errors.payment_date = "Payment date is required";
    }

    if (!form.payment_mode) {
      errors.payment_mode = "Select payment mode";
    }

    if (form.payment_mode === "cheque" && !form.cheque_number?.trim()) {
      errors.cheque_number = "Cheque number is required for cheque payments";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      loan_id: loan.id,
      schedule_id: targetScheduleId || null,
      payment_amount: Number(form.payment_amount),
      payment_date: form.payment_date,
      payment_mode: form.payment_mode,
      transaction_reference: form.transaction_reference?.trim() || null,
      cheque_number:
        form.payment_mode === "cheque" ? form.cheque_number?.trim() : null,
      remarks: form.remarks?.trim() || null,
    };

    setLocalSubmitting(true);
    setLocalError(null);

    try {
      let result = null;
      if (onSubmit) {
        result = await onSubmit(payload);
      }

      if (result && result.success === false) {
        setLocalError(result.error || "Failed to record payment");
        setLocalSubmitting(false);
        return;
      }

      const paymentInfo = result?.data || result || payload;
      const finalRemaining =
        result?.data?.remaining_outstanding !== undefined
          ? result.data.remaining_outstanding
          : Math.max(0, totalOutstanding - Number(form.payment_amount));

      const mergedSuccessData = {
        ...payload,
        ...paymentInfo,
        payment_amount: Number(form.payment_amount),
        remaining_outstanding: finalRemaining,
        loan_no: loan?.loan_no,
        customer_name: loan?.customer_name,
        customer_mobile: loan?.customer_mobile,
        schedule_no: targetScheduleNo || loan?.schedule_no,
      };

      setSuccessData(mergedSuccessData);
      if (onSuccess) {
        onSuccess(mergedSuccessData);
      }
    } catch (err) {
      setLocalError(err.message || "Failed to record payment");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!successData) return;
    printInterestReceipt({
      loan,
      payment: successData,
      allocations: successData?.allocations || [
        targetScheduleNo
          ? {
              schedule_no: targetScheduleNo,
              allocation_type: "interest",
              amount: successData.payment_amount,
            }
          : null,
      ].filter(Boolean),
      company: effectiveCompany,
      remainingOutstanding: successData?.remaining_outstanding,
    });
  };

  const handleDone = () => {
    setSuccessData(null);
    onClose();
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${
      fieldErrors[field] ? "input-error" : ""
    }`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  const isBusy = loading || localSubmitting;
  const activeError = localError || error;

  return (
    <div className="modal modal-open overflow-x-hidden">
      <style>{`
        @keyframes psm-circle-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes psm-check-draw {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes psm-ring-pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .psm-circle {
          animation: psm-circle-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .psm-check {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: psm-check-draw 0.4s 0.35s ease-out forwards;
        }
        .psm-ring {
          animation: psm-ring-pulse 1.1s 0.1s ease-out both;
        }
        @keyframes psm-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-box {
          overflow-x: hidden !important;
        }
      `}</style>

      <div
        className="modal-box max-w-lg rounded-2xl p-6 overflow-x-hidden"
        style={{ overflowX: "hidden" }}
      >
        {/* ================= SUCCESS VIEW ================= */}
        {successData ? (
          <div className="text-center relative">
            <button
              type="button"
              onClick={handleDone}
              className="btn btn-ghost btn-sm btn-circle absolute right-1 top-1 text-base-content/50 hover:text-base-content"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Animated Checkmark */}
            <div className="relative w-18 h-18 mx-auto mt-2 mb-3 flex items-center justify-center overflow-hidden">
              <span className="psm-ring absolute inset-0 rounded-full bg-success/30" />
              <div className="psm-circle relative w-18 h-18 rounded-full bg-success/15 flex items-center justify-center">
                <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    className="stroke-success"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M12 20.5L17 25.5L28 14"
                    className="psm-check stroke-success"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            <div className="psm-fade-up space-y-4">
              <div>
                <h3 className="font-bold text-xl text-base-content">
                  Payment Successful!
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Receipt generated for loan{" "}
                  <span className="font-mono font-semibold text-primary">
                    {loan.loan_no}
                  </span>
                </p>
              </div>

              {/* Amount Hero */}
              <div className="bg-success/10 border border-success/30 rounded-2xl p-3.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-success/80 mb-0.5">
                  Amount Received
                </div>
                <div className="text-2xl sm:text-3xl font-black text-success tracking-tight">
                  {formatCurrency(successData.payment_amount)}
                </div>
                <div className="text-[11px] text-base-content/60 mt-1 capitalize flex items-center justify-center gap-1.5 font-medium">
                  <span>
                    via{" "}
                    {successData.payment_mode === "bank"
                      ? "Bank Transfer"
                      : successData.payment_mode}
                  </span>
                  {successData.transaction_reference && (
                    <span>· Ref: {successData.transaction_reference}</span>
                  )}
                  {successData.cheque_number && (
                    <span>· Chq: {successData.cheque_number}</span>
                  )}
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="rounded-xl border border-base-200 bg-base-200/30 divide-y divide-base-200 text-left text-xs">
                {loan.customer_name && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-base-content/50">Borrower:</span>
                    <span className="font-semibold">{loan.customer_name}</span>
                  </div>
                )}
                {successData.schedule_no && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-base-content/50">Settled Schedule:</span>
                    <span className="font-semibold text-primary">
                      Schedule #{successData.schedule_no}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-base-content/50">Date of Payment:</span>
                  <span className="font-medium">
                    {new Date(successData.payment_date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                {successData.remaining_outstanding !== undefined && (
                  <div className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-base-content/50">
                      Remaining Total Balance:
                    </span>
                    <span
                      className={`font-bold ${
                        Number(successData.remaining_outstanding) > 0
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {formatCurrency(successData.remaining_outstanding)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-outline btn-primary btn-sm rounded-xl flex-1 gap-2 shadow-xs"
                >
                  <Printer size={15} />
                  <span>Print Receipt / Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className="btn btn-success btn-sm rounded-xl text-success-content flex-1 font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= FORM VIEW ================= */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Receipt size={18} className="text-primary" />
                  {isInstallmentPayment
                    ? `Pay Installment #${targetScheduleNo || ""}`
                    : "Record Repayment"}
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5 font-mono">
                  {loan.loan_no}{" "}
                  {loan.customer_name ? `· ${loan.customer_name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Installment Banner when paying specific schedule / due */}
            {isInstallmentPayment ? (
              <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-base-200/40 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-primary badge-sm font-bold gap-1">
                        <Receipt size={12} /> Installment #{targetScheduleNo || "Due"}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/60 font-medium">
                      Paying interest due for this installment only
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/50 block">
                      Installment Due
                    </span>
                    <span className="text-2xl font-black text-primary tracking-tight">
                      {formatCurrency(targetScheduleDue)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Loan Balance Summary Card - ONLY for generic loan payments */
              <div className="rounded-xl border border-base-300 bg-base-200/40 p-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/60">
                    Outstanding Interest:
                  </span>
                  <span className="font-semibold text-warning">
                    {formatCurrency(outstandingInterest)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/60">
                    Outstanding Principal:
                  </span>
                  <span className="font-semibold text-base-content/80">
                    {formatCurrency(outstandingPrincipal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-300 font-bold">
                  <span className="text-base-content">Total Loan Due:</span>
                  <span className="text-error text-sm">
                    {formatCurrency(totalOutstanding)}
                  </span>
                </div>
              </div>
            )}

            {activeError && (
              <div className="alert alert-error text-xs py-2 mb-4 rounded-xl">
                <span>
                  {typeof activeError === "string"
                    ? activeError
                    : activeError?.message || "Failed to record payment."}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Amount Select - ONLY for generic repayments, NOT for specific installment payments */}
              {!isInstallmentPayment && (
                <div>
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Quick Amount Select
                    </span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {outstandingInterest > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQuickAmount(outstandingInterest)}
                        className="btn btn-xs btn-outline btn-warning"
                      >
                        Pay Interest ({formatCurrency(outstandingInterest)})
                      </button>
                    )}
                    {totalOutstanding > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQuickAmount(totalOutstanding)}
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        Full Settlement ({formatCurrency(totalOutstanding)})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Amount */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <IndianRupee size={12} /> Payment Amount *
                    </span>
                    {isInstallmentPayment && (
                      <span className="text-[11px] text-primary font-normal">
                        Max payable: {formatCurrency(targetScheduleDue)}
                      </span>
                    )}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxAllowedAmount}
                  value={form.payment_amount}
                  onChange={handleChange("payment_amount")}
                  className={inputClass("payment_amount")}
                  placeholder={`Enter amount (max ${formatCurrency(maxAllowedAmount)})`}
                />
                <FieldError field="payment_amount" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Payment Date */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold flex items-center gap-1">
                      <Calendar size={12} /> Payment Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={handleChange("payment_date")}
                    className={inputClass("payment_date")}
                  />
                  <FieldError field="payment_date" />
                </div>

                {/* Payment Mode */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold flex items-center gap-1">
                      <CreditCard size={12} /> Payment Mode *
                    </span>
                  </label>
                  <select
                    value={form.payment_mode}
                    onChange={handleChange("payment_mode")}
                    className="select select-bordered select-sm rounded-lg w-full"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <FieldError field="payment_mode" />
                </div>
              </div>

              {/* Conditional Cheque Number */}
              {form.payment_mode === "cheque" && (
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Cheque Number *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.cheque_number}
                    onChange={handleChange("cheque_number")}
                    className={inputClass("cheque_number")}
                    placeholder="e.g. CHQ-987654"
                  />
                  <FieldError field="cheque_number" />
                </div>
              )}

              {/* Reference Number */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Transaction / Reference # (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.transaction_reference}
                  onChange={handleChange("transaction_reference")}
                  className={inputClass("transaction_reference")}
                  placeholder="e.g. UPI-123456789 or NEFT Ref"
                />
                <FieldError field="transaction_reference" />
              </div>

              {/* Remarks */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold flex items-center gap-1">
                    <FileText size={12} /> Remarks
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={handleChange("remarks")}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                  placeholder="Optional payment notes..."
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="modal-action pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost btn-sm rounded-lg"
                  disabled={isBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || totalOutstanding <= 0}
                  className="btn btn-primary btn-sm rounded-lg gap-1.5 font-bold"
                >
                  {isBusy && <Loader2 size={14} className="animate-spin" />}
                  {isInstallmentPayment
                    ? `Confirm Payment (${formatCurrency(form.payment_amount || targetScheduleDue)})`
                    : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="modal-backdrop bg-black/40" onClick={handleDone} />
    </div>
  );
}
