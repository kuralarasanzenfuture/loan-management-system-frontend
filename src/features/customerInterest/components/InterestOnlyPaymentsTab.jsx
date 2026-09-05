import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  PieChart,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  fetchInterestOnlyPayments,
  removeInterestOnlyPayment,
} from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import {
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatDate,
} from "../utils/interestOnlyLoanHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

/**
 * InterestOnlyPaymentsTab
 * Displays payment history for an interest-only loan and allows recording or reversing payments.
 *
 * Props:
 * - loanId (number)
 * - onRecordPayment (fn) : callback to open payment modal
 * - onPaymentReversed (fn) : callback to trigger parent loan/schedule refresh
 */
export default function InterestOnlyPaymentsTab({
  loanId,
  onRecordPayment,
  onPaymentReversed,
}) {
  const dispatch = useDispatch();
  const { payments = [], loading } = useSelector(
    (state) => state.interestOnlyPayments || {},
  );

  const { can, isAdmin } = usePermissions();
  const canPay = can([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.LOAN_COLLECTION_CREATE,
  ]);
  const canDeletePayment =
    isAdmin ||
    can([
      PERMISSIONS.INTEREST_ONLY_PAYMENT_DELETE,
      PERMISSIONS.LOAN_COLLECTION_DELETE,
      PERMISSIONS.LOAN_DELETE,
    ]);

  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (loanId) {
      dispatch(fetchInterestOnlyPayments(loanId));
    }
  }, [dispatch, loanId]);

  const paymentList = Array.isArray(payments) ? payments : [];

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const action = await dispatch(removeInterestOnlyPayment(deleteTarget.id));
      if (removeInterestOnlyPayment.fulfilled.match(action)) {
        setDeleteTarget(null);
        if (onPaymentReversed) onPaymentReversed();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base-200 bg-base-200/20 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
          <Receipt size={13} /> Payment History
        </h3>
        {onRecordPayment && canPay && (
          <button
            type="button"
            onClick={onRecordPayment}
            className="btn btn-primary btn-xs gap-1"
          >
            <Plus size={13} /> Record Payment
          </button>
        )}
      </div>

      {loading && paymentList.length === 0 ? (
        <div className="flex items-center justify-center py-12 gap-2 text-base-content/40">
          <span className="loading loading-spinner loading-sm text-primary" />
          <span className="text-xs">Loading payments…</span>
        </div>
      ) : paymentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-base-300 text-base-content/40">
            <Receipt size={18} />
          </span>
          <p className="text-xs text-base-content/40">
            No payments recorded yet.
          </p>
          {onRecordPayment && canPay && (
            <button
              type="button"
              onClick={onRecordPayment}
              className="btn btn-outline btn-primary btn-xs mt-1 gap-1"
            >
              <Plus size={13} /> Record First Payment
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-base-200">
          {paymentList.map((p) => {
            const isExpanded = expandedId === p.id;
            const hasAllocations =
              Array.isArray(p.allocations) && p.allocations.length > 0;

            return (
              <div key={p.id} className="hover:bg-base-200/20 transition-colors">
                <div className="flex items-center justify-between px-5 py-3.5 gap-3">
                  <div
                    onClick={() =>
                      hasAllocations && setExpandedId(isExpanded ? null : p.id)
                    }
                    className={`flex items-center gap-3.5 flex-1 min-w-0 ${
                      hasAllocations ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-success/10 text-success shrink-0">
                      <Receipt size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <span>Payment #{p.payment_no}</span>
                        {p.received_by_name && (
                          <span className="text-[10px] font-normal text-base-content/40">
                            by {p.received_by_name}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-base-content/40">
                        {formatDate(p.payment_date)} ·{" "}
                        {PAYMENT_MODE_LABELS[p.payment_mode] || p.payment_mode}
                        {p.transaction_reference
                          ? ` · Ref: ${p.transaction_reference}`
                          : ""}
                        {p.cheque_number ? ` · Chq: ${p.cheque_number}` : ""}
                      </p>
                      {p.remarks && (
                        <p className="text-[11px] text-base-content/60 italic mt-0.5">
                          "{p.remarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-success">
                      {formatCurrency(p.payment_amount)}
                    </span>

                    {canDeletePayment && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Reverse / delete this payment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {hasAllocations && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : p.id)
                        }
                        className="btn btn-ghost btn-xs btn-square"
                        title={isExpanded ? "Collapse breakdown" : "Expand breakdown"}
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-base-content/40" />
                        ) : (
                          <ChevronDown size={16} className="text-base-content/40" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Allocation breakdown */}
                {isExpanded && hasAllocations && (
                  <div className="px-5 pb-4 pl-16">
                    <div className="rounded-xl border border-base-200 bg-base-200/40 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-base-content/50 border-b border-base-200">
                        <PieChart size={11} /> Allocation Breakdown
                      </div>
                      {p.allocations.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between px-3.5 py-2 text-xs border-t border-base-200 first:border-t-0"
                        >
                          <span className="capitalize text-base-content/70">
                            {a.allocation_type === "interest" ? "Interest Due" : "Principal Repayment"}
                            {a.schedule_no
                              ? ` · Schedule #${a.schedule_no}`
                              : a.schedule_id
                                ? ` · Schedule #${a.schedule_id}`
                                : ""}
                          </span>
                          <span className="font-semibold text-base-content/90">
                            {formatCurrency(a.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete / Reverse Confirmation Modal */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm rounded-2xl">
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error">
                <AlertTriangle size={22} />
              </span>
              <h3 className="font-bold text-base">Reverse this payment?</h3>
            </div>

            <div className="p-3 my-4 rounded-xl border border-base-300 bg-base-200/40 text-left text-xs space-y-1">
              <div>
                <span className="text-base-content/50">Payment No:</span>{" "}
                <span className="font-semibold">#{deleteTarget.payment_no}</span>
              </div>
              <div>
                <span className="text-base-content/50">Amount:</span>{" "}
                <span className="font-bold text-error">
                  {formatCurrency(deleteTarget.payment_amount)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50">Date:</span>{" "}
                <span>{formatDate(deleteTarget.payment_date)}</span>
              </div>
            </div>

            <p className="text-xs text-base-content/60 text-center">
              Reversing this payment will restore the outstanding balances on
              the loan and reopen the affected schedule installments.
            </p>

            <div className="modal-action justify-center mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-ghost btn-sm rounded-lg"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="btn btn-error btn-sm rounded-lg gap-1.5"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Confirm Reversal
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
