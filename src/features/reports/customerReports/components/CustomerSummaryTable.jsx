import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, User, Eye } from "lucide-react";
import {
  formatCurrency,
  getFullName,
  getPendingPercent,
} from "../utils/customerSummaryHelpers.js";

/**
 * CustomerSummaryTable
 * Matches API row shape exactly:
 * { id, first_name, last_name, mobile, total_loans, total_loan, total_paid, total_pending }
 *
 * Props:
 * - rows (array)
 * - loading (bool)
 */
export default function CustomerSummaryTable({ rows = [], loading }) {
  const navigate = useNavigate();

  const safeRows = Array.isArray(rows) ? rows : [];

  if (loading && safeRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading summary…</p>
      </div>
    );
  }

  if (!loading && safeRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Users size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No customer loan data found
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
            <th className="font-medium text-center">Loans</th>
            <th className="font-medium text-right">Total Loan Amount</th>
            <th className="font-medium text-right">Total Paid</th>
            <th className="font-medium text-right">Pending</th>
            <th className="font-medium w-40">Recovery Progress</th>
            <th className="text-right font-medium w-20">View</th>
          </tr>
        </thead>

        <tbody>
          {safeRows.map((row, idx) => {
            const customerId = row.id || row.customer_id;
            const totalLoanAmt = Number(row.total_loan ?? row.total_amount ?? 0);
            const hasLoans = Number(row.total_loans ?? 0) > 0 && totalLoanAmt > 0;
            const pendingPct = hasLoans ? getPendingPercent(row) : 0;
            const recoveredPct = hasLoans ? 100 - pendingPct : 0;

            return (
              <tr
                key={customerId || idx}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              >
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                      <User size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                        <span>{getFullName(row)}</span>
                        {row.customer_no && (
                          <span className="badge badge-ghost badge-xs text-[10px] font-mono">
                            {row.customer_no}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-base-content/40">
                        {row.mobile || "—"}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-center">
                  <span className="badge badge-ghost badge-sm font-bold">
                    {row.total_loans ?? 0}
                  </span>
                </td>

                <td className="text-right text-xs font-bold text-base-content">
                  {formatCurrency(row.total_loan ?? row.total_amount)}
                </td>

                <td className="text-right text-xs">
                  {Number(row.total_paid) > 0 ? (
                    <span className="font-semibold text-success">
                      {formatCurrency(row.total_paid)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-right text-xs font-semibold">
                  {Number(row.total_pending) > 0 ? (
                    <span className="text-error">
                      {formatCurrency(row.total_pending)}
                    </span>
                  ) : (
                    formatCurrency(row.total_pending)
                  )}
                </td>

                <td>
                  {hasLoans ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-base-200 h-2 rounded-full overflow-hidden border border-base-300">
                        <div
                          className={`h-full rounded-full transition-all ${
                            recoveredPct >= 80
                              ? "bg-success"
                              : recoveredPct >= 40
                                ? "bg-warning"
                                : "bg-error"
                          }`}
                          style={{ width: `${recoveredPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-base-content/50 w-8 shrink-0 text-right">
                        {recoveredPct}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/35 italic">No loans</span>
                  )}
                </td>

                <td>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        customerId && navigate(`/customers/${customerId}`)
                      }
                      className="btn btn-ghost btn-sm btn-square"
                      title="View customer"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
