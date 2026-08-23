import React from "react";
import { Receipt, User } from "lucide-react";
import {
  STATUS_STYLES,
  formatCurrency,
  formatDate,
  getFullName,
} from "../utils/installmentReportHelpers.js";

/**
 * InstallmentReportTable
 * Matches the API row shape exactly:
 * { id, loan_id, installment_no, due_date, paid_date, total_due,
 *   paid_amount, balance_amount, status, loan_no, first_name, last_name, mobile }
 *
 * Props:
 * - rows (array)
 * - loading (bool)
 */
export default function InstallmentReportTable({ rows, loading }) {
  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading report…</p>
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No installments found
        </p>
        <p className="text-xs text-base-content/40">
          Try adjusting the filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Customer</th>
            <th className="font-medium">Loan</th>
            <th className="font-medium">Due Date</th>
            <th className="font-medium text-right">Total Due</th>
            <th className="font-medium text-right">Paid</th>
            <th className="font-medium text-right">Balance</th>
            <th className="font-medium w-28">Status</th>
            <th className="font-medium text-right">Paid Date</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3 py-1">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <User size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {getFullName(row)}
                    </div>
                    <div className="text-[11px] text-base-content/40">
                      {row.mobile || "—"}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-xs">
                <span className="font-mono text-base-content/70">
                  {row.loan_no}
                </span>
                <div className="text-[10px] text-base-content/40">
                  Inst #{row.installment_no}
                </div>
              </td>

              <td className="text-xs text-base-content/60">
                {formatDate(row.due_date)}
              </td>

              <td className="text-right text-xs font-bold text-base-content">
                {formatCurrency(row.total_due)}
              </td>

              <td className="text-right text-xs">
                {Number(row.paid_amount) > 0 ? (
                  <span className="font-semibold text-success">
                    {formatCurrency(row.paid_amount)}
                  </span>
                ) : (
                  <span className="text-base-content/30">—</span>
                )}
              </td>

              <td className="text-right text-xs font-semibold">
                {Number(row.balance_amount) > 0 ? (
                  <span className="text-error">
                    {formatCurrency(row.balance_amount)}
                  </span>
                ) : (
                  formatCurrency(row.balance_amount)
                )}
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[row.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                </span>
              </td>

              <td className="text-right text-xs text-base-content/60">
                {row.paid_date ? (
                  formatDate(row.paid_date)
                ) : (
                  <span className="text-base-content/30">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
