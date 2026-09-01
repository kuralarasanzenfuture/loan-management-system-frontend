import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Undo2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
} from "lucide-react";
import {
  fetchBankTransactionById,
  reverseTransaction,
  clearSelectedBankTransaction,
  clearBankTransactionError,
} from "../../../redux/bankTransactions/bankTransactionSlice.js";
import ReverseTransactionModal from "../components/ReverseTransactionModal.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";
import {
  REFERENCE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  formatCurrency,
  formatDateTime,
} from "../utils/transactionHelpers.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value || <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );
}

export default function BankTransactionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    bankTransaction: txn,
    loading,
    error,
  } = useSelector((state) => state.bankTransactions);

  const { can } = usePermissions();
  const canReverse =
    can(PERMISSIONS.BANK_TRANSACTION_DELETE) ||
    can(PERMISSIONS.BANK_ACCOUNT_DELETE) ||
    can(PERMISSIONS.COMPANY_EDIT);

  const [reverseOpen, setReverseOpen] = useState(false);
  const [reverseSubmitting, setReverseSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBankTransactionById(id));
    return () => dispatch(clearSelectedBankTransaction());
  }, [dispatch, id]);

  const handleReverseConfirm = async () => {
    if (!canReverse) return;
    setReverseSubmitting(true);
    try {
      const action = await dispatch(
        reverseTransaction({ id, company_bank_id: txn?.company_bank_id }),
      );
      if (reverseTransaction.fulfilled.match(action)) {
        setReverseOpen(false);
        dispatch(fetchBankTransactionById(id));
      }
    } finally {
      setReverseSubmitting(false);
    }
  };

  if (loading && !txn) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading transaction…</p>
      </div>
    );
  }

  if (!txn) return null;

  const isCredit = txn.transaction_type === "credit";
  const isReversed = txn.status === "reversed" || txn.reversed_at;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft size={18} />
          </button>
          <span
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
              isCredit ? "bg-success/10 text-success" : "bg-error/10 text-error"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft size={20} />
            ) : (
              <ArrowUpRight size={20} />
            )}
          </span>
          <div>
            <h1 className="text-xl font-bold font-mono">
              {txn.transaction_no}
            </h1>
            <p className="text-xs text-base-content/40">
              {formatDateTime(txn.transaction_date)}
            </p>
          </div>
          {isReversed && (
            <span className="badge badge-error badge-outline gap-1.5 font-medium ml-2">
              <Ban size={11} /> Reversed
            </span>
          )}
        </div>

        {!isReversed && canReverse && (
          <button
            onClick={() => {
              dispatch(clearBankTransactionError());
              setReverseOpen(true);
            }}
            className="btn btn-outline btn-sm gap-1.5 border-base-300 text-warning hover:bg-warning/10 hover:border-warning"
          >
            <Undo2 size={15} />
            Reverse
          </button>
        )}
      </div>

      {/* Amount highlight */}
      <div
        className={`rounded-2xl border px-6 py-6 text-center ${
          isCredit
            ? "border-success/20 bg-success/5"
            : "border-error/20 bg-error/5"
        }`}
      >
        <p className="text-[11px] text-base-content/50 font-medium uppercase tracking-wider mb-1">
          {isCredit ? "Credit" : "Debit"} Amount
        </p>
        <p
          className={`text-3xl font-bold ${isCredit ? "text-success" : "text-error"}`}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(txn.amount)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Receipt size={13} /> Transaction Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Transaction No." value={txn.transaction_no} />
            <InfoRow
              label="Date & Time"
              value={formatDateTime(txn.transaction_date)}
            />
            <InfoRow label="Type" value={isCredit ? "Credit" : "Debit"} />
            <InfoRow
              label="Reference Type"
              value={
                REFERENCE_TYPE_LABELS[txn.reference_type] || txn.reference_type
              }
            />
            <InfoRow label="Reference ID" value={txn.reference_id} />
          </div>
        </div>

        {/* Payment info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
            Payment Info
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Payment Method"
              value={
                PAYMENT_METHOD_LABELS[txn.payment_method] || txn.payment_method
              }
            />
            <InfoRow
              label="Transaction Ref."
              value={txn.transaction_reference}
            />
            <InfoRow label="Cheque Number" value={txn.cheque_number} />
          </div>
        </div>

        {/* Balance snapshot */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
            Balance Snapshot
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Balance Before"
              value={formatCurrency(txn.balance_before)}
            />
            <InfoRow
              label="Balance After"
              value={formatCurrency(txn.balance_after)}
            />
          </div>
        </div>

        {/* Description & remarks */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
            Notes
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-base-content/40 mb-1">
                Description
              </p>
              <p className="text-sm text-base-content/70">
                {txn.description || (
                  <span className="text-base-content/30">—</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-base-content/40 mb-1">Remarks</p>
              <p className="text-sm text-base-content/70">
                {txn.remarks || <span className="text-base-content/30">—</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReverseTransactionModal
        open={reverseOpen}
        transaction={txn}
        loading={reverseSubmitting}
        error={reverseOpen ? error : null}
        onConfirm={handleReverseConfirm}
        onClose={() => setReverseOpen(false)}
      />
    </div>
  );
}
