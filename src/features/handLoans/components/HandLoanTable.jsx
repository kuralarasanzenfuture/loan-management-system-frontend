import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  DIRECTION_LABELS,
  DIRECTION_STYLES,
  STATUS_STYLES,
  formatCurrency,
} from "../utils/handLoanHelpers.js";

/**
 * HandLoanTable
 * Props:
 * - loans (array)
 * - loading (bool)
 * - onView (fn) / onEdit (fn) / onDelete (fn)
 */
export default function HandLoanTable({
  loans,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading hand loans…</p>
      </div>
    );
  }

  if (!loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <HandCoins size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No hand loans found
        </p>
        <p className="text-xs text-base-content/40">
          Record your first hand loan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Loan</th>
            <th className="font-medium">Person</th>
            <th className="font-medium">Direction</th>
            <th className="font-medium">Amount</th>
            <th className="font-medium">Dates</th>
            <th className="font-medium w-28">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan) => {
            const isGiven = loan.loan_direction === "given";
            return (
              <tr
                key={loan.id}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              >
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                        isGiven
                          ? "bg-info/10 text-info"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {isGiven ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownLeft size={16} />
                      )}
                    </span>
                    <div>
                      <div className="font-semibold text-sm font-mono">
                        {loan.hand_loan_no}
                      </div>
                      {loan.purpose && (
                        <div className="text-[11px] text-base-content/40 truncate max-w-[160px]">
                          {loan.purpose}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="text-xs">
                  <div className="font-semibold text-base-content/80">
                    {loan.person_name}
                  </div>
                  {loan.mobile && (
                    <div className="text-[10px] text-base-content/40">
                      {loan.mobile}
                    </div>
                  )}
                </td>

                <td>
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${DIRECTION_STYLES[loan.loan_direction] || "badge-ghost"}`}
                  >
                    {DIRECTION_LABELS[loan.loan_direction] ||
                      loan.loan_direction}
                  </span>
                </td>

                <td className="text-xs">
                  <div className="font-semibold text-base-content">
                    {formatCurrency(loan.amount)}
                  </div>
                  <div className="text-[10px] text-base-content/40">
                    Outstanding: {formatCurrency(loan.outstanding_amount)}
                  </div>
                </td>

                <td className="text-[11px] text-base-content/50">
                  <div>
                    Given {new Date(loan.given_date).toLocaleDateString()}
                  </div>
                  {loan.expected_return_date && (
                    <div className="text-base-content/30">
                      Due{" "}
                      {new Date(loan.expected_return_date).toLocaleDateString()}
                    </div>
                  )}
                </td>

                <td>
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {loan.status?.charAt(0).toUpperCase() +
                      loan.status?.slice(1)}
                  </span>
                </td>

                <td>
                  <div className="flex justify-end gap-1.5">
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => onView(loan)}
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => onEdit(loan)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                      onClick={() => onDelete(loan)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
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
