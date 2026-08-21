import React from "react";
import { Receipt, User } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getFullName,
} from "../../utils/collectionReportHelpers.js";

/**
 * CollectionReportTable
 * Matches ReportModel.findCollections row shape exactly:
 * { id, loan_id, installment_no, paid_amount, paid_date, loan_no,
 *   customer_id, first_name, last_name, mobile }
 *
 * Props:
 * - rows (array)
 * - loading (bool)
 */
export default function CollectionReportTable({ rows = [], loading }) {
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
          No collections found
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
            <th className="w-14 font-medium">#</th>
            <th className="font-medium">Customer</th>
            <th className="font-medium">Loan</th>
            <th className="font-medium">Installment</th>
            <th className="font-medium text-right">Paid Amount</th>
            <th className="font-medium text-right">Paid Date</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td className="text-base-content/40">{index + 1}</td>

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

              <td className="text-xs font-mono text-base-content/70">
                {row.loan_no}
              </td>

              <td className="text-xs">
                <span className="badge badge-ghost badge-sm font-medium">
                  #{row.installment_no}
                </span>
              </td>

              <td className="text-right text-sm font-bold text-success">
                {formatCurrency(row.paid_amount)}
              </td>

              <td className="text-right text-xs text-base-content/60">
                {formatDate(row.paid_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
