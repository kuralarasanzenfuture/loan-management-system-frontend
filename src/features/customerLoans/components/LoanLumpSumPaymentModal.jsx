import React, { useState, useMemo } from "react";
import {
  X,
  Loader2,
  Receipt,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Coins,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI / QR" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function LoanLumpSumPaymentModal({
  open,
  loan,
  installments = [],
  loading = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    payment_amount: "",
    payment_mode: "cash",
    payment_date: new Date().toISOString().slice(0, 10),
    transaction_reference: "",
    cheque_number: "",
    remarks: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [successResult, setSuccessResult] = useState(null);

  // Unpaid installments in chronological order
  const unpaidInstallments = useMemo(() => {
    return (installments || [])
      .filter((i) => i.status !== "paid" && Number(i.balance_amount || 0) > 0)
      .sort((a, b) => (a.installment_no || 0) - (b.installment_no || 0));
  }, [installments]);

  // Total outstanding balance across all unpaid installments
  const totalOutstanding = useMemo(() => {
    return unpaidInstallments.reduce(
      (sum, i) => sum + Number(i.balance_amount || 0),
      0
    );
  }, [unpaidInstallments]);

  // Single installment typical amount
  const singleInstallmentAmount = useMemo(() => {
    if (unpaidInstallments.length > 0) {
      return Number(unpaidInstallments[0].balance_amount || loan?.installment_amount || 0);
    }
    return Number(loan?.installment_amount || 0);
  }, [unpaidInstallments, loan]);

  // Live simulation of how the entered lump-sum will be allocated across installments
  const simulation = useMemo(() => {
    const entered = Number(form.payment_amount || 0);
    if (!entered || entered <= 0) return [];

    let remainingToDistribute = entered;
    const allocations = [];

    for (const inst of unpaidInstallments) {
      if (remainingToDistribute <= 0) break;
      const instBal = Number(inst.balance_amount || 0);
      const allocated = Math.min(remainingToDistribute, instBal);
      const newBal = Math.max(0, Number((instBal - allocated).toFixed(2)));
      remainingToDistribute = Number((remainingToDistribute - allocated).toFixed(2));

      allocations.push({
        installment_no: inst.installment_no,
        due_date: inst.due_date,
        previous_balance: instBal,
        allocated_amount: allocated,
        remaining_balance: newBal,
        is_cleared: newBal <= 0,
      });
    }

    return allocations;
  }, [form.payment_amount, unpaidInstallments]);

  if (!open || !loan) return null;

  const handleAmountChange = (val) => {
    setForm((prev) => ({ ...prev, payment_amount: val }));
    const num = Number(val);
    if (num <= 0) {
      setFieldErrors((prev) => ({ ...prev, payment_amount: "Amount must be greater than 0" }));
    } else if (num > totalOutstanding) {
      setFieldErrors((prev) => ({
        ...prev,
        payment_amount: `Amount cannot exceed total outstanding of ${formatCurrency(totalOutstanding)}`,
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, payment_amount: null }));
    }
  };

  const handleQuickAmount = (amount) => {
    const target = Math.min(amount, totalOutstanding);
    handleAmountChange(String(target));
  };

  const validate = () => {
    const errors = {};
    const amt = Number(form.payment_amount);
    if (!form.payment_amount || isNaN(amt) || amt <= 0) {
      errors.payment_amount = "Enter a valid amount greater than 0";
    } else if (amt > totalOutstanding) {
      errors.payment_amount = `Amount cannot exceed total loan dues of ${formatCurrency(totalOutstanding)}`;
    }

    if (!form.payment_mode) {
      errors.payment_mode = "Select a payment mode";
    }

    if (!form.payment_date) {
      errors.payment_date = "Select a payment date";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      loan_id: loan.id,
      payment_amount: Number(form.payment_amount),
      payment_mode: form.payment_mode,
      payment_date: form.payment_date,
      transaction_reference: form.transaction_reference || undefined,
      cheque_number: form.cheque_number || undefined,
      remarks: form.remarks || undefined,
    };

    const res = await onSubmit(payload);
    if (res && res.success) {
      setSuccessResult(res);
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg rounded-2xl border border-base-300 shadow-2xl p-6 transition-all">
        {/* SUCCESS SCREEN */}
        {successResult ? (
          <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-success/20 animate-ping opacity-60" />
              <div className="relative w-16 h-16 rounded-full bg-success/15 border-2 border-success/40 text-success flex items-center justify-center shadow-md">
                <CheckCircle2 size={36} className="text-success stroke-[2.5]" />
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-xl text-base-content tracking-tight">
                Lump Sum Payment Allocated!
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                {successResult.message || `Successfully distributed across installments.`}
              </p>
            </div>

            {/* Total Paid Card */}
            <div className="rounded-2xl bg-gradient-to-b from-base-200/90 to-base-200/50 border border-base-300 p-4 text-center">
              <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
                Total Amount Disbursed into Loan
              </div>
              <div className="text-3xl font-black text-primary tracking-tight mt-1">
                {formatCurrency(successResult.total_paid || form.payment_amount)}
              </div>
              {successResult.loan_completed && (
                <div className="mt-2 inline-flex">
                  <span className="badge badge-success font-bold text-xs py-2 px-3 gap-1">
                    <CheckCircle2 size={13} /> Loan Fully Settled & Completed!
                  </span>
                </div>
              )}
            </div>

            {/* Allocations Breakdown */}
            {Array.isArray(successResult.allocations) && successResult.allocations.length > 0 && (
              <div className="rounded-xl border border-base-200 bg-base-100 p-3 text-xs text-left space-y-2 max-h-48 overflow-y-auto">
                <div className="font-bold text-[10px] uppercase text-base-content/50 tracking-wider">
                  Settlement Breakdown
                </div>
                <div className="divide-y divide-base-200">
                  {successResult.allocations.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-base-content">
                          Installment #{item.installment_no}
                        </span>
                        <span className="text-[10px] text-base-content/50 ml-1.5">
                          {item.status === "paid" ? "(Cleared)" : `(Bal: ${formatCurrency(item.remaining_balance)})`}
                        </span>
                      </div>
                      <span className="font-bold text-success text-xs tracking-tight">
                        + {formatCurrency(item.allocated_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm rounded-xl gap-1.5 w-full font-bold shadow-sm"
              >
                <Check size={16} />
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM */
          <>
            <div className="flex items-center justify-between pb-3 border-b border-base-200 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Coins size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-base-content leading-tight">
                    Pay Loan (Auto-Allocate Lump Sum)
                  </h3>
                  <p className="text-[11px] text-base-content/50">
                    {loan.loan_no || `LN-${loan.id}`} · Chronological auto-settlement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{typeof error === "string" ? error : "Payment failed. Please check inputs."}</span>
              </div>
            )}

            {/* Total Balance Card */}
            <div className="rounded-xl bg-base-200/60 border border-base-300 p-3.5 mb-4 text-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">
                  Total Outstanding Balance
                </div>
                <div className="text-xl font-bold text-primary tracking-tight mt-0.5">
                  {formatCurrency(totalOutstanding)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider">
                  Pending Installments
                </div>
                <div className="font-bold text-base-content text-sm mt-0.5">
                  {unpaidInstallments.length} installments
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Amount Input */}
              <div className="form-control">
                <div className="flex items-center justify-between pb-1">
                  <label className="text-xs font-semibold text-base-content/80">
                    Lump Sum Amount to Pay (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(totalOutstanding)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Full Payoff ({formatCurrency(totalOutstanding)})
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-base-content/40 text-xs font-bold pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    max={totalOutstanding}
                    step="0.01"
                    required
                    value={form.payment_amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={`Max ${totalOutstanding}`}
                    className={`input input-bordered input-sm rounded-xl pl-7 w-full font-medium ${
                      fieldErrors.payment_amount ? "input-error border-error" : ""
                    }`}
                  />
                </div>
                {fieldErrors.payment_amount && (
                  <span className="text-[11px] text-error mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    {fieldErrors.payment_amount}
                  </span>
                )}

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className="text-[11px] text-base-content/50 font-medium mr-0.5">Quick:</span>
                  {singleInstallmentAmount > 0 && singleInstallmentAmount <= totalOutstanding && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(singleInstallmentAmount)}
                      className="btn btn-xs rounded-full border-base-300 hover:border-primary/60 hover:bg-primary/5 px-3 h-7 text-xs font-semibold text-base-content/80 transition-all shadow-2xs"
                    >
                      1 Inst <span className="text-base-content/50 font-normal ml-0.5">({formatCurrency(singleInstallmentAmount)})</span>
                    </button>
                  )}
                  {singleInstallmentAmount * 2 <= totalOutstanding && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(singleInstallmentAmount * 2)}
                      className="btn btn-xs rounded-full border-base-300 hover:border-primary/60 hover:bg-primary/5 px-3 h-7 text-xs font-semibold text-base-content/80 transition-all shadow-2xs"
                    >
                      2 Inst <span className="text-base-content/50 font-normal ml-0.5">({formatCurrency(singleInstallmentAmount * 2)})</span>
                    </button>
                  )}
                  {singleInstallmentAmount * 5 <= totalOutstanding && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(singleInstallmentAmount * 5)}
                      className="btn btn-xs rounded-full border-base-300 hover:border-primary/60 hover:bg-primary/5 px-3 h-7 text-xs font-semibold text-base-content/80 transition-all shadow-2xs"
                    >
                      5 Inst <span className="text-base-content/50 font-normal ml-0.5">({formatCurrency(singleInstallmentAmount * 5)})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">Payment Mode *</span>
                  </label>
                  <select
                    value={form.payment_mode}
                    onChange={(e) => setForm((prev) => ({ ...prev, payment_mode: e.target.value }))}
                    className="select select-bordered select-sm rounded-xl w-full text-xs font-medium capitalize"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">Payment Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.payment_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                    className="input input-bordered input-sm rounded-xl w-full text-xs font-medium"
                  />
                </div>
              </div>

              {/* Transaction Ref / Cheque No */}
              {form.payment_mode !== "cash" && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-xs font-semibold">Txn Reference</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI / UTR Reference"
                      value={form.transaction_reference}
                      onChange={(e) => setForm((prev) => ({ ...prev, transaction_reference: e.target.value }))}
                      className="input input-bordered input-sm rounded-xl w-full text-xs"
                    />
                  </div>

                  {form.payment_mode === "cheque" && (
                    <div className="form-control">
                      <label className="label pb-1">
                        <span className="label-text text-xs font-semibold">Cheque Number</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Cheque No"
                        value={form.cheque_number}
                        onChange={(e) => setForm((prev) => ({ ...prev, cheque_number: e.target.value }))}
                        className="input input-bordered input-sm rounded-xl w-full text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Remarks */}
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Remarks / Note (optional)"
                  value={form.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="input input-bordered input-sm rounded-xl w-full text-xs"
                />
              </div>

              {/* Live Preview of Sequential Settlement */}
              {simulation.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] uppercase tracking-wider">
                    <Sparkles size={13} />
                    Auto-Allocation Preview ({simulation.length} installment{simulation.length > 1 ? "s" : ""})
                  </div>
                  <div className="divide-y divide-base-200/60 max-h-36 overflow-y-auto pr-1">
                    {simulation.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-base-content/80">
                          Inst #{item.installment_no}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-success tracking-tight">
                            +{formatCurrency(item.allocated_amount)}
                          </span>
                          {item.is_cleared ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30">
                              Cleared
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/15 text-warning border border-warning/30">
                              Partial
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
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
                  disabled={loading || Boolean(fieldErrors.payment_amount) || !form.payment_amount}
                  className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm font-bold"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Confirm Lump Sum Payment</span>
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
