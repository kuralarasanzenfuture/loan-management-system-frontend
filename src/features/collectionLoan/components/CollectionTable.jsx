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
  onPay,
}) {
  if (loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
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
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Customer / Loan</th>
            <th className="font-medium">Mobile</th>
            <th className="font-medium">Due Date</th>
            <th className="font-medium text-right">Total Due</th>
            <th className="font-medium text-right">Balance</th>
            <th className="font-medium w-28">Status</th>
            <th className="text-right font-medium w-28">Action</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((inst) => (
            <CollectionRow
              key={inst.id || `${inst.loan_id}-${inst.installment_no}`}
              installment={inst}
              showDaysOverdue={showDaysOverdue}
              onPay={onPay}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
