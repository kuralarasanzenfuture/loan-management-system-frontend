import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Undo2,
  Eye,
  Receipt,
  Ban,
} from "lucide-react";
import {
  REFERENCE_TYPE_LABELS,
  formatCurrency,
  formatDateTime,
} from "../utils/transactionHelpers.js";

/**
 * BankTransactionTable
 * Props:
 * - transactions (array)
 * - loading (bool)
 * - canView (bool)
 * - canReverse (bool)
 * - onView (fn)
 * - onReverse (fn)
 */
export default function BankTransactionTable({
  transactions,
  loading,
  canView = true,
  canReverse = true,
  onView,
  onReverse,
}) {
  const showActions = canView || canReverse;

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading transactions…</p>
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No transactions found
        </p>
        <p className="text-xs text-base-content/40">
          Record your first transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Transaction</th>
            <th className="font-medium">Date</th>
            <th className="font-medium">Reference</th>
            <th className="font-medium">Method</th>
            <th className="font-medium text-right">Amount</th>
            <th className="font-medium text-right">Balance After</th>
            {showActions && (
              <th className="text-right font-medium w-24">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {transactions.map((txn) => {
            const isCredit = txn.transaction_type === "credit";
            const isReversed = txn.status === "reversed" || txn.reversed_at;

            return (
              <tr
                key={txn.id}
                className={`border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors ${
                  isReversed ? "opacity-50" : ""
                }`}
              >
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                        isCredit
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm font-mono">
                          {txn.transaction_no}
                        </span>
                        {(txn.bank_name || txn.company_bank?.bank_name) && (
                          <span className="badge badge-ghost badge-xs text-[10px] opacity-75">
                            {txn.bank_name || txn.company_bank?.bank_name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-base-content/40 truncate max-w-[220px]">
                        {txn.description || "—"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-xs text-base-content/60">
                  {formatDateTime(txn.transaction_date)}
                </td>

                <td>
                  <span className="badge badge-ghost badge-sm font-medium">
                    {REFERENCE_TYPE_LABELS[txn.reference_type] ||
                      txn.reference_type}
                  </span>
                  {isReversed && (
                    <span className="badge badge-error badge-outline badge-sm gap-1 font-medium ml-1">
                      <Ban size={9} /> Reversed
                    </span>
                  )}
                </td>

                <td className="text-xs text-base-content/60">
                  {txn.payment_method ? txn.payment_method.toUpperCase() : "—"}
                  {txn.transaction_reference && (
                    <div className="text-[10px] text-base-content/30 font-mono">
                      {txn.transaction_reference}
                    </div>
                  )}
                </td>

                <td className="text-right">
                  <span
                    className={`text-sm font-bold ${isCredit ? "text-success" : "text-error"}`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>

                <td className="text-right text-xs font-semibold text-base-content/70">
                  {formatCurrency(txn.balance_after)}
                </td>

                {showActions && (
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {canView && (
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => onView?.(txn)}
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                      )}
                      {!isReversed && canReverse && onReverse && (
                        <button
                          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                          onClick={() => onReverse(txn)}
                          title="Reverse transaction"
                        >
                          <Undo2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
