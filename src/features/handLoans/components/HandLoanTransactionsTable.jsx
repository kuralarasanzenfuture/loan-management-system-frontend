import React from "react";
import { ArrowDownLeft, ArrowUpRight, Receipt, Ban } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  PAYMENT_MODE_LABELS,
} from "../utils/handLoanHelpers.js";

/**
 * HandLoanTransactionsTable
 * Props:
 * - transactions (array)
 * - loading (bool)
 */
export default function HandLoanTransactionsTable({ transactions, loading }) {
  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-xs">Loading transactions…</span>
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={18} />
        </span>
        <p className="text-xs text-base-content/40">
          No transactions recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-base-content/40">
            <th className="font-medium">Transaction</th>
            <th className="font-medium">Type</th>
            <th className="font-medium">Date</th>
            <th className="font-medium">Mode</th>
            <th className="font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const isInflow =
              txn.transaction_type === "disbursement" &&
              txn.loan?.loan_direction === "borrowed";
            const isMoneyIn = txn.transaction_type === "collection" || isInflow;
            const isReversed =
              txn.status === "reversed" || txn.status === "cancelled";

            return (
              <tr
                key={txn.id}
                className={`border-t border-base-200 ${isReversed ? "opacity-50" : ""}`}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${isMoneyIn
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                        }`}
                    >
                      {isMoneyIn ? (
                        <ArrowDownLeft size={13} />
                      ) : (
                        <ArrowUpRight size={13} />
                      )}
                    </span>
                    <span className="text-xs font-mono">
                      {txn.transaction_no}
                    </span>
                  </div>
                </td>
                <td className="text-xs capitalize">
                  {txn.transaction_type}
                  {isReversed && (
                    <span className="badge badge-error badge-outline badge-xs gap-1 font-medium ml-1.5">
                      <Ban size={8} /> {txn.status}
                    </span>
                  )}
                </td>
                <td className="text-xs text-base-content/60">
                  {formatDateTime(txn.transaction_date)}
                </td>
                <td className="text-xs text-base-content/60">
                  {PAYMENT_MODE_LABELS[txn.payment_mode] || txn.payment_mode}
                </td>
                <td className="text-right">
                  <span
                    className={`text-sm font-bold ${isMoneyIn ? "text-success" : "text-error"}`}
                  >
                    {isMoneyIn ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
