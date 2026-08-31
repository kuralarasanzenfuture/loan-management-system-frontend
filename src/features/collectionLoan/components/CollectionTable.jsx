import React from "react";
import { Receipt } from "lucide-react";
import CollectionRow from "./CollectionRow.jsx";

/**
 * CollectionTable
 * Props:
 * - installments (array)
 * - loading (bool)
 * - emptyMessage (string)
 * - showDaysOverdue (bool)
 */
export default function CollectionTable({
  installments = [],
  loading,
  emptyMessage,
  showDaysOverdue = false,
  canCollect,
  onPay,
}) {
  if (loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-200 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          {emptyMessage || "Nothing here"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
            <th className="font-semibold py-3">Customer / Loan</th>
            <th className="font-semibold py-3">Mobile</th>
            <th className="font-semibold py-3">Due Date</th>
            <th className="font-semibold py-3 text-right">Total Due</th>
            <th className="font-semibold py-3 text-right">Balance</th>
            <th className="font-semibold py-3 w-28">Status</th>
            <th className="text-right font-semibold py-3 w-28">Action</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((inst) => (
            <CollectionRow
              key={inst.id || `${inst.loan_id}-${inst.installment_no}`}
              installment={inst}
              showDaysOverdue={showDaysOverdue}
              canCollect={canCollect}
              onPay={onPay}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
