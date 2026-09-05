import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Receipt,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../utils/interestOnlyLoanHelpers.js";

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
 *
 * Props:
 * - open (bool)
 * - loan (object)
 * - defaultAmount (number|null)
 * - defaultRemarks (string|null)
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function InterestOnlyPaymentModal({
  open,
  loan,
  defaultAmount = null,
  defaultRemarks = "",
  initialValues = null,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const effectiveAmount =
    initialValues?.payment_amount !== undefined && initialValues?.payment_amount !== null
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

  const outstandingInterest = Number(loan?.outstanding_interest || 0);
  const outstandingPrincipal = Number(loan?.outstanding_principal || 0);
  const totalOutstanding = Number(
    (outstandingInterest + outstandingPrincipal).toFixed(2),
  );

  useEffect(() => {
    if (!open) return;

    setForm({
      payment_amount:
        effectiveAmount !== null && effectiveAmount !== undefined
          ? String(effectiveAmount)
          : outstandingInterest > 0
            ? String(outstandingInterest)
            : String(totalOutstanding || ""),
      payment_date: new Date().toISOString().slice(0, 10),
      payment_mode: "cash",
      transaction_reference: "",
      cheque_number: "",
      remarks: effectiveRemarks || "",
    });
    setFieldErrors({});
  }, [open, loan, effectiveAmount, effectiveRemarks, outstandingInterest, totalOutstanding]);


  if (!open || !loan) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleQuickAmount = (amt) => {
    const safeAmt = Math.min(amt, totalOutstanding);
    setForm((prev) => ({ ...prev, payment_amount: String(safeAmt) }));
    setFieldErrors((prev) => ({ ...prev, payment_amount: null }));
  };

  const validate = () => {
    const errors = {};
    const amount = Number(form.payment_amount);

    if (!form.payment_amount || isNaN(amount) || amount <= 0) {
      errors.payment_amount = "Enter a valid positive amount";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      loan_id: loan.id,
      payment_amount: Number(form.payment_amount),
      payment_date: form.payment_date,
      payment_mode: form.payment_mode,
      transaction_reference: form.transaction_reference?.trim() || null,
      cheque_number:
        form.payment_mode === "cheque" ? form.cheque_number?.trim() : null,
      remarks: form.remarks?.trim() || null,
    });
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${
      fieldErrors[field] ? "input-error" : ""
    }`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              Record Repayment
            </h3>
            <p className="text-xs text-base-content/50 mt-0.5 font-mono">
              {loan.loan_no} {loan.customer_name ? `· ${loan.customer_name}` : ""}
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

        {/* Loan Balance Summary Card */}
        <div className="rounded-xl border border-base-300 bg-base-200/40 p-3.5 mb-4 space-y-2">
          {loan.schedule_due > 0 && (
            <div className="flex items-center justify-between text-xs pb-1.5 mb-1 border-b border-base-300/60">
              <span className="font-semibold text-primary">
                Selected Schedule {loan.schedule_no ? `#${loan.schedule_no}` : ""} Due:
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(loan.schedule_due)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/60">Outstanding Interest:</span>
            <span className="font-semibold text-warning">
              {formatCurrency(outstandingInterest)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/60">Outstanding Principal:</span>
            <span className="font-semibold text-base-content/80">
              {formatCurrency(outstandingPrincipal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-300 font-bold">
            <span className="text-base-content">Total Outstanding Due:</span>
            <span className="text-error text-sm">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string"
                ? error
                : error?.message || "Failed to record payment."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Amount Fill Buttons */}
          <div>
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Quick Amount Select
              </span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {loan.schedule_due > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(Number(loan.schedule_due))}
                  className="btn btn-xs btn-primary font-medium"
                >
                  Pay Schedule #{loan.schedule_no || "Due"} ({formatCurrency(loan.schedule_due)})
                </button>
              )}
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


          {/* Payment Amount */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold flex items-center gap-1">
                <IndianRupee size={12} /> Payment Amount *
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={totalOutstanding}
              value={form.payment_amount}
              onChange={handleChange("payment_amount")}
              className={inputClass("payment_amount")}
              placeholder="Enter amount to pay"
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || totalOutstanding <= 0}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
