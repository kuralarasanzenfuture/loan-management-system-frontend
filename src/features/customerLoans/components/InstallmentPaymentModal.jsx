import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Loader2,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";
import { calculatePenalty } from "../../../redux/installments/installment.service.js";

/**
 * InstallmentPaymentModal
 *
 * Handles:
 * 1. Partial Payments: Automatically detects already-paid amounts and defaults to REMAINING due.
 * 2. Cumulative tracking: Submits total cumulative paid amount so backend stores exact ledger balances.
 * 3. Live Penalty API: Fetches overdue days & policy-calculated penalty.
 * 4. Penalty Bounds: Prevents paying over the calculated/maximum penalty.
 * 5. "Pay Penalty Later": Deferral option to pay just remaining principal now.
 * 6. Automatic Status: Dynamically updates to "paid" or "partial" based on cumulative total.
 */
export default function InstallmentPaymentModal({
  open,
  installment,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  // Amount paying in THIS transaction
  const [form, setForm] = useState({
    amount_paying_now: "",
    paid_date: new Date().toISOString().slice(0, 10),
    penalty_amount: "0",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Penalty calculation API state
  const [penaltyApiData, setPenaltyApiData] = useState(null);
  const [loadingPenalty, setLoadingPenalty] = useState(false);

  // Defer penalty option
  const [payPenaltyLater, setPayPenaltyLater] = useState(false);

  // Canonical principal due for this installment
  const principalAmount = useMemo(() => {
    if (!installment) return 0;
    return Number(
      installment.principal_amount ??
      installment.installment_amount ??
      installment.total_due ??
      0
    );
  }, [installment]);

  // Amount already paid on this installment from previous transactions
  const alreadyPaid = useMemo(() => {
    if (!installment) return 0;
    return Number(installment.paid_amount || 0);
  }, [installment]);

  // System calculated penalty from API
  const calculatedPenalty = useMemo(() => {
    if (!penaltyApiData) return 0;
    return Math.max(0, Number(penaltyApiData?.penalty_amount || 0));
  }, [penaltyApiData]);

  // Max allowed penalty (cannot enter higher than calculated or already recorded)
  const maxAllowedPenalty = useMemo(() => {
    const fromInstallment = Number(installment?.penalty_amount || 0);
    return Math.max(calculatedPenalty, fromInstallment);
  }, [calculatedPenalty, installment]);

  // Dynamic penalty amount
  const penaltyAmount = useMemo(() => {
    if (!form.penalty_amount || isNaN(Number(form.penalty_amount))) return 0;
    return Math.max(0, Number(form.penalty_amount));
  }, [form.penalty_amount]);

  // Total payable liability for this installment (principal + penalty)
  const totalPayableLiability = useMemo(() => {
    return Number((principalAmount + penaltyAmount).toFixed(2));
  }, [principalAmount, penaltyAmount]);

  // Total remaining balance due across principal + penalty
  const remainingTotalDue = useMemo(() => {
    return Math.max(0, Number((totalPayableLiability - alreadyPaid).toFixed(2)));
  }, [totalPayableLiability, alreadyPaid]);

  // Remaining principal due (excluding penalty)
  const remainingPrincipalDue = useMemo(() => {
    return Math.max(0, Number((principalAmount - alreadyPaid).toFixed(2)));
  }, [principalAmount, alreadyPaid]);

  // Maximum amount permitted to be collected in this transaction
  const maxPayableNow = useMemo(() => {
    if (payPenaltyLater) {
      return remainingPrincipalDue > 0 ? remainingPrincipalDue : remainingTotalDue;
    }
    return remainingTotalDue;
  }, [payPenaltyLater, remainingPrincipalDue, remainingTotalDue]);

  // Current amount being paid in this session
  const currentPayingNow = useMemo(() => {
    const entered = Number(form.amount_paying_now || 0);
    return isNaN(entered) || entered < 0 ? 0 : entered;
  }, [form.amount_paying_now]);

  // Cumulative paid sum that will be stored in the database
  const projectedCumulativePaid = useMemo(() => {
    return Number((alreadyPaid + currentPayingNow).toFixed(2));
  }, [alreadyPaid, currentPayingNow]);

  // Projected remaining balance after this payment is made
  const projectedRemainingBalance = useMemo(() => {
    return Math.max(0, Number((totalPayableLiability - projectedCumulativePaid).toFixed(2)));
  }, [totalPayableLiability, projectedCumulativePaid]);

  // Dynamic status based on cumulative total paid
  const autoStatus = useMemo(() => {
    if (projectedCumulativePaid >= totalPayableLiability && projectedCumulativePaid > 0) {
      return "paid";
    }
    if (projectedCumulativePaid > 0 && projectedCumulativePaid < totalPayableLiability) {
      return "partial";
    }
    return "pending";
  }, [projectedCumulativePaid, totalPayableLiability]);

  // Initialize modal state on open
  useEffect(() => {
    if (open && installment) {
      const principal = Number(
        installment.principal_amount ??
        installment.installment_amount ??
        installment.total_due ??
        0
      );
      const prevPaid = Number(installment.paid_amount || 0);
      const existingPenalty = Number(installment.penalty_amount || 0);
      const initialTotal = Number((principal + existingPenalty).toFixed(2));
      const initialRemaining = Math.max(0, Number((initialTotal - prevPaid).toFixed(2)));

      setForm({
        amount_paying_now: initialRemaining > 0 ? String(initialRemaining) : "",
        paid_date: new Date().toISOString().slice(0, 10),
        penalty_amount: String(existingPenalty),
      });
      setFieldErrors({});
      setPayPenaltyLater(false);

      // Fetch live penalty from API
      let isSubscribed = true;
      setLoadingPenalty(true);
      calculatePenalty(installment.id)
        .then((res) => {
          if (!isSubscribed) return;
          const data = res?.data?.data || res?.data || res;
          setPenaltyApiData(data);

          const apiPenalty = Math.max(0, Number(data?.penalty_amount || 0));

          // If backend calculated a penalty and none was recorded yet, update penalty & remaining due
          if (apiPenalty > 0 && existingPenalty === 0) {
            const updatedTotal = Number((principal + apiPenalty).toFixed(2));
            const updatedRemaining = Math.max(0, Number((updatedTotal - prevPaid).toFixed(2)));
            setForm((prev) => ({
              ...prev,
              penalty_amount: String(apiPenalty),
              amount_paying_now: String(updatedRemaining),
            }));
          }
        })
        .catch((err) => {
          console.warn("Could not calculate penalty from API:", err);
        })
        .finally(() => {
          if (isSubscribed) setLoadingPenalty(false);
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [open, installment]);

  if (!open || !installment) return null;

  // Handle Amount Paying Now change
  const handleAmountPayingNowChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, amount_paying_now: val }));

    if (val !== "") {
      const num = Number(val);
      if (num > maxPayableNow) {
        setFieldErrors((prev) => ({
          ...prev,
          amount_paying_now: `Amount cannot exceed remaining due of ${formatCurrency(maxPayableNow)}`,
        }));
      } else if (num <= 0) {
        setFieldErrors((prev) => ({
          ...prev,
          amount_paying_now: "Please enter an amount greater than 0",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, amount_paying_now: null }));
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, amount_paying_now: null }));
    }
  };

  // Handle Penalty Change
  const handlePenaltyChange = (e) => {
    const val = e.target.value;
    const num = Number(val || 0);

    // Enforce cap: penalty cannot exceed maxAllowedPenalty
    if (maxAllowedPenalty > 0 && num > maxAllowedPenalty) {
      setFieldErrors((prev) => ({
        ...prev,
        penalty_amount: `Penalty cannot exceed calculated limit of ${formatCurrency(maxAllowedPenalty)}`,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, penalty_amount: null }));
    }

    setForm((prev) => {
      const newPenalty = Math.max(0, num);
      const newTotal = Number((principalAmount + newPenalty).toFixed(2));
      const newRemaining = Math.max(0, Number((newTotal - alreadyPaid).toFixed(2)));

      // If user had remaining balance entered, keep it synced to new remaining
      const wasFullRemaining = Number(prev.amount_paying_now) === remainingTotalDue;

      return {
        ...prev,
        penalty_amount: val,
        amount_paying_now: wasFullRemaining && !payPenaltyLater ? String(newRemaining) : prev.amount_paying_now,
      };
    });
  };

  // Toggle "Pay Penalty Later"
  const handleTogglePayPenaltyLater = (payLater) => {
    setPayPenaltyLater(payLater);
    setFieldErrors({});

    if (payLater) {
      // Pay only remaining principal
      setForm((prev) => ({
        ...prev,
        amount_paying_now: String(remainingPrincipalDue > 0 ? remainingPrincipalDue : remainingTotalDue),
      }));
    } else {
      // Pay full remaining total including penalty
      setForm((prev) => ({
        ...prev,
        amount_paying_now: String(remainingTotalDue),
      }));
    }
  };

  // Waive penalty to 0
  const handleWaivePenalty = () => {
    setForm((prev) => ({
      ...prev,
      penalty_amount: "0",
      amount_paying_now: String(remainingPrincipalDue),
    }));
    setPayPenaltyLater(false);
    setFieldErrors({});
  };

  // Quick action: Set remaining full payment
  const handleSetFullRemainingPayment = () => {
    setPayPenaltyLater(false);
    setForm((prev) => ({
      ...prev,
      amount_paying_now: String(remainingTotalDue),
    }));
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};
    const payingNum = Number(form.amount_paying_now);
    const penaltyNum = Number(form.penalty_amount || 0);

    if (!form.amount_paying_now || isNaN(payingNum) || payingNum <= 0) {
      errors.amount_paying_now = "Enter a valid amount greater than 0";
    } else if (payingNum > maxPayableNow) {
      errors.amount_paying_now = `Amount cannot exceed remaining payable of ${formatCurrency(maxPayableNow)}`;
    }

    if (maxAllowedPenalty > 0 && penaltyNum > maxAllowedPenalty) {
      errors.penalty_amount = `Penalty cannot exceed calculated limit of ${formatCurrency(maxAllowedPenalty)}`;
    }

    if (!form.paid_date) {
      errors.paid_date = "Select a payment date";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // We submit the new CUMULATIVE paid amount to the backend:
    // cumulativePaid = alreadyPaid + payingNow
    onSubmit({
      paid_amount: projectedCumulativePaid,
      paid_date: form.paid_date,
      status: autoStatus,
      penalty_amount: penaltyAmount,
    });
  };

  const isAlreadyFullySettled = alreadyPaid >= totalPayableLiability && totalPayableLiability > 0;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md rounded-2xl border border-base-300 shadow-2xl p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt size={17} />
            </span>
            <div>
              <h3 className="font-bold text-base text-base-content leading-tight">
                {alreadyPaid > 0 ? "Record Subsequent Payment" : "Record Installment Payment"}
              </h3>
              <p className="text-[11px] text-base-content/50">
                Installment #{installment.installment_no} · Due {new Date(installment.due_date).toLocaleDateString("en-GB")}
                {alreadyPaid > 0 && (
                  <span className="text-warning font-semibold ml-1.5">(Partial Paid)</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Backend / Submission Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="font-medium">
              {typeof error === "string" ? error : "Failed to record payment. Please verify the amount."}
            </div>
          </div>
        )}

        {/* Overdue & Penalty Calculation API Info Banner */}
        {loadingPenalty ? (
          <div className="flex items-center gap-2 p-2.5 mb-3 rounded-xl bg-base-200/50 text-[11px] text-base-content/60">
            <Loader2 size={13} className="animate-spin text-primary shrink-0" />
            <span>Calculating system penalty from active loan policy…</span>
          </div>
        ) : penaltyApiData && penaltyApiData.days_overdue > 0 ? (
          <div className="p-3 mb-3.5 rounded-xl bg-warning/10 border border-warning/25 text-warning-content text-xs space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-warning">
                <ShieldAlert size={14} />
                Installment Overdue
              </span>
              <span className="text-mono font-bold text-error">
                {penaltyApiData.days_overdue} Days Late ({penaltyApiData.penalty_days} Penalty Days)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-base-content/70 pt-0.5">
              <span>Policy Calculated Penalty:</span>
              <span className="font-bold text-mono text-error">
                {formatCurrency(penaltyApiData.penalty_amount)}
              </span>
            </div>
          </div>
        ) : null}

        {/* Financial Breakdown Card with Remaining Due Clarity */}
        <div className="rounded-xl bg-base-200/60 border border-base-300/80 p-3.5 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-center text-base-content/70">
            <span>Total Installment Amount</span>
            <span className="font-semibold text-base-content text-mono">
              {formatCurrency(principalAmount)}
            </span>
          </div>

          {penaltyAmount > 0 && (
            <div className="flex justify-between items-center text-base-content/70">
              <span>Late Fee / Penalty</span>
              <span className="font-semibold text-mono text-error">
                + {formatCurrency(penaltyAmount)}
              </span>
            </div>
          )}

          {alreadyPaid > 0 && (
            <div className="flex justify-between items-center text-success font-medium">
              <span>Already Paid Previously</span>
              <span className="font-bold text-mono">
                - {formatCurrency(alreadyPaid)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-base-300 flex justify-between items-center">
            <div>
              <span className="font-bold text-base-content text-xs">Remaining Balance Due</span>
              {alreadyPaid > 0 && (
                <div className="text-[10px] text-base-content/50">
                  Total {formatCurrency(totalPayableLiability)} less {formatCurrency(alreadyPaid)} paid
                </div>
              )}
            </div>
            <span className="font-bold text-base text-primary text-mono">
              {formatCurrency(remainingTotalDue)}
            </span>
          </div>
        </div>

        {/* Fully Settled Alert */}
        {isAlreadyFullySettled ? (
          <div className="p-4 mb-4 rounded-xl bg-success/10 border border-success/20 text-success text-center space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-success mb-1" />
            <div className="font-bold text-sm">Installment Fully Settled</div>
            <p className="text-xs text-base-content/70">
              This installment has already been paid in full ({formatCurrency(alreadyPaid)} collected). No further dues remaining.
            </p>
            <div className="pt-3">
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm rounded-xl">
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Penalty Payment Options: Pay Now vs Pay Later */}
            {penaltyAmount > 0 && (
              <div className="rounded-xl border border-base-300 bg-base-100 p-3 mb-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-base-content/80 text-[11px] uppercase tracking-wider">
                  <span>Penalty Payment Option</span>
                  <button
                    type="button"
                    onClick={handleWaivePenalty}
                    className="text-[10px] font-bold text-error hover:underline"
                  >
                    Waive Penalty (₹0)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePayPenaltyLater(false)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      !payPenaltyLater
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-base-300 bg-base-200/40 text-base-content/70 hover:border-base-content/30"
                    }`}
                  >
                    <span className="text-xs font-bold">Pay Penalty Now</span>
                    <span className="text-[10px] opacity-70">
                      Pay {formatCurrency(remainingTotalDue)} in full
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePayPenaltyLater(true)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      payPenaltyLater
                        ? "border-warning bg-warning/15 text-warning font-bold shadow-xs"
                        : "border-base-300 bg-base-200/40 text-base-content/70 hover:border-base-content/30"
                    }`}
                  >
                    <span className="text-xs font-bold">Pay Penalty Later</span>
                    <span className="text-[10px] opacity-70">
                      Pay {formatCurrency(remainingPrincipalDue)} · Defer penalty
                    </span>
                  </button>
                </div>

                {payPenaltyLater && (
                  <p className="text-[11px] text-warning font-medium leading-tight pt-1">
                    Notice: Paying <strong>{formatCurrency(remainingPrincipalDue)}</strong> toward remaining principal now. Penalty of <strong>{formatCurrency(penaltyAmount)}</strong> remains recorded and will be collected later.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Amount to Pay Now Input */}
              <div className="form-control">
                <div className="flex items-center justify-between pb-1">
                  <label className="text-xs font-semibold text-base-content/80" htmlFor="payment-amount-now-input">
                    Amount to Pay Now (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={handleSetFullRemainingPayment}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Pay Remaining ({formatCurrency(remainingTotalDue)})
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-base-content/40 text-xs font-bold pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="payment-amount-now-input"
                    type="number"
                    min="0.01"
                    max={maxPayableNow}
                    step="0.01"
                    required
                    value={form.amount_paying_now}
                    onChange={handleAmountPayingNowChange}
                    placeholder={`Max ${maxPayableNow}`}
                    className={`input input-bordered input-sm rounded-xl pl-7 w-full font-medium ${
                      fieldErrors.amount_paying_now ? "input-error border-error" : ""
                    }`}
                  />
                </div>
                {fieldErrors.amount_paying_now && (
                  <span className="text-[11px] text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    {fieldErrors.amount_paying_now}
                  </span>
                )}
              </div>

              {/* Payment Date & Penalty Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Payment Date */}
                <div className="form-control">
                  <label className="label pb-1" htmlFor="payment-date-input">
                    <span className="label-text text-xs font-semibold">Payment Date *</span>
                  </label>
                  <input
                    id="payment-date-input"
                    type="date"
                    required
                    value={form.paid_date}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, paid_date: e.target.value }));
                      setFieldErrors((prev) => ({ ...prev, paid_date: null }));
                    }}
                    className={`input input-bordered input-sm rounded-xl w-full font-medium ${
                      fieldErrors.paid_date ? "input-error border-error" : ""
                    }`}
                  />
                  {fieldErrors.paid_date && (
                    <span className="text-[11px] text-error mt-1">{fieldErrors.paid_date}</span>
                  )}
                </div>

                {/* Penalty Input with Max Cap */}
                <div className="form-control">
                  <div className="flex items-center justify-between pb-1">
                    <label className="text-xs font-semibold text-base-content/80" htmlFor="penalty-amount-input">
                      Penalty (₹)
                    </label>
                    {maxAllowedPenalty > 0 && (
                      <span className="text-[10px] text-base-content/50">
                        Max: ₹{maxAllowedPenalty}
                      </span>
                    )}
                  </div>
                  <input
                    id="penalty-amount-input"
                    type="number"
                    min="0"
                    max={maxAllowedPenalty > 0 ? maxAllowedPenalty : undefined}
                    step="0.01"
                    value={form.penalty_amount}
                    onChange={handlePenaltyChange}
                    placeholder="0"
                    className={`input input-bordered input-sm rounded-xl w-full font-medium ${
                      fieldErrors.penalty_amount ? "input-error border-error" : ""
                    }`}
                  />
                  {fieldErrors.penalty_amount && (
                    <span className="text-[10px] text-error mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={11} />
                      {fieldErrors.penalty_amount}
                    </span>
                  )}
                </div>
              </div>

              {/* Automatic Status & Cumulative Accounting Summary */}
              <div className="rounded-xl border border-base-300 bg-base-200/40 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">
                    New Installment Status
                  </div>
                  <div className="mt-1">
                    {autoStatus === "paid" && (
                      <span className="badge badge-success gap-1 text-[11px] font-bold text-success-content py-2 px-2.5">
                        <CheckCircle2 size={12} />
                        Paid (Full Settlement)
                      </span>
                    )}
                    {autoStatus === "partial" && (
                      <span className="badge badge-warning gap-1 text-[11px] font-bold text-warning-content py-2 px-2.5">
                        <Clock size={12} />
                        Partial Payment
                      </span>
                    )}
                    {autoStatus === "pending" && (
                      <span className="badge badge-ghost text-[11px] font-medium py-2 px-2.5">
                        Pending (Unpaid)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">
                    Remaining After Payment
                  </div>
                  <div className="text-sm font-bold text-mono text-base-content mt-0.5">
                    {formatCurrency(projectedRemainingBalance)}
                  </div>
                </div>
              </div>

              {/* Cumulative Progress Pill (Shows previous + current payment) */}
              {alreadyPaid > 0 && currentPayingNow > 0 && (
                <div className="text-[11px] text-base-content/60 bg-base-200/70 rounded-lg px-3 py-1.5 flex items-center justify-between">
                  <span>Ledger Progress:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(alreadyPaid)} + <strong className="text-primary">{formatCurrency(currentPayingNow)}</strong> = <strong>{formatCurrency(projectedCumulativePaid)}</strong> of {formatCurrency(totalPayableLiability)}
                  </span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="modal-action mt-5 pt-3 border-t border-base-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="btn btn-ghost btn-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || Boolean(fieldErrors.amount_paying_now) || Boolean(fieldErrors.penalty_amount)}
                  className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm font-bold"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Confirm & Save Payment</span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
      <div className="modal-backdrop bg-black/50 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
