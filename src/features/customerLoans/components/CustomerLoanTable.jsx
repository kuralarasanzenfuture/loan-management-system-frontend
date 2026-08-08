import React from "react";
import { Pencil, Trash2, Eye, HandCoins, Repeat } from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
};

/**
 * CustomerLoanTable
 * Props:
 * - loans (array) : flattened rows, ideally joined with customer name + plan name
 *   from the backend. Falls back gracefully if only IDs are present.
 * - loading (bool)
 * - onView (fn) / onEdit (fn) / onDelete (fn) / onStatusChange (fn)
 */
export default function CustomerLoanTable({
  loans,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  console.log(loans);
  if (loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loans…</p>
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
          No loans found
        </p>
        <p className="text-xs text-base-content/40">
          Issue your first loan to get started.
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
            <th className="font-medium">Loan</th>
            <th className="font-medium">Customer</th>
            <th className="font-medium">Plan</th>
            <th className="font-medium">Amount</th>
            <th className="font-medium">Installment</th>
            <th className="font-medium">Period</th>
            <th className="font-medium w-28">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan, index) => (
            <tr
              key={loan.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              //   onClick={() => onView(loan)}
            >
              <td className="text-base-content/40">{index + 1}</td>

              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <HandCoins size={16} />
                  </div>
                  <div className="font-semibold text-sm">
                    {loan.loan_no || `#${loan.id}`}
                  </div>
                </div>
              </td>

              {/* <td className="text-xs">
                <span className="font-semibold text-base-content/80">
                  {loan.customer_name || `Customer #${loan.customer_id}`}
                </span>
              </td> */}
              <td className="text-xs">
                <div className="flex items-center gap-2">
                  {loan.photo ? (
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={loan.photo}
                      alt={loan.customer_name || "Customer Photo"}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center uppercase select-none shrink-0">
                      {loan.customer_name
                        ? loan.customer_name
                            .trim()
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")
                        : `#${loan.customer_id}`}
                    </div>
                  )}

                  <span className="font-semibold text-base-content/80">
                    {loan.customer_name || `Customer #${loan.customer_id}`}
                  </span>
                </div>
              </td>

              <td className="text-xs">
                <span className="text-base-content/60">
                  {loan.plan_name || `Plan #${loan.loan_plan_id}`}
                </span>
              </td>

              <td>
                <div className="text-xs font-semibold text-base-content">
                  {formatCurrency(loan.loan_amount)}
                </div>
                <div className="text-[10px] text-base-content/40">
                  Net: {formatCurrency(loan.net_disbursed_amount)}
                </div>
              </td>

              <td className="text-xs">
                <span className="flex items-center gap-1 font-semibold text-base-content/70">
                  <Repeat size={11} className="text-base-content/30" />
                  {formatCurrency(loan.installment_amount)}
                </span>
              </td>

              <td className="text-[11px] text-base-content/50">
                {loan.start_date && (
                  <div>{new Date(loan.start_date).toLocaleDateString()}</div>
                )}
                {loan.end_date && (
                  <div className="text-base-content/30">
                    → {new Date(loan.end_date).toLocaleDateString()}
                  </div>
                )}
              </td>

              <td>
                <button
                  onClick={() => onStatusChange(loan)}
                  className={`badge gap-1.5 font-medium badge-sm cursor-pointer hover:opacity-80 ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
                  title="Change status"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {loan.status
                    ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
                    : "Unknown"}
                </button>
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onView(loan)}
                    title="View loan"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(loan)}
                    title="Edit loan"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(loan)}
                    title="Delete loan"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
