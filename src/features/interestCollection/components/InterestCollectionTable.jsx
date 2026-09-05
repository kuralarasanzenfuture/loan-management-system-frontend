import React from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ExternalLink,
  Receipt,
  AlertTriangle,
  User,
  CheckCircle2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
} from "../../customerInterest/utils/interestOnlyLoanHelpers.js";

const SCHEDULE_STATUS_STYLES = {
  pending: "badge-warning",
  partial: "badge-info",
  paid: "badge-success",
  overdue: "badge-error",
  cancelled: "badge-ghost",
};

export default function InterestCollectionTable({
  items = [],
  loading = false,
  isOverdueTab = false,
  canCollect = false,
  onCollect,
}) {
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm font-medium">Loading collection dues…</p>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-200 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          {isOverdueTab
            ? "No overdue interest schedules pending across active loans."
            : "No interest dues scheduled for this selected date and filter."}
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
            <th className="font-semibold py-3 text-right">Interest Due</th>
            <th className="font-semibold py-3 text-right">Principal</th>
            <th className="font-semibold py-3 text-right">Total Due</th>
            <th className="font-semibold py-3 text-right">Paid</th>
            <th className="font-semibold py-3 text-right">Balance</th>
            <th className="font-semibold py-3 w-28 text-center">Status</th>
            <th className="font-semibold py-3 w-28 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const balance = Number(row.balance_amount || 0);
            const isPaid = row.status === "paid" || balance <= 0;
            const isRowPayable = balance > 0 && row.status !== "paid";
            const daysOverdue =
              row.days_overdue != null ? Number(row.days_overdue) : 0;
            const customerDisplayName =
              row.customer_name ||
              `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
              (row.customer_id ? `Customer #${row.customer_id}` : "Customer");
            const loanDisplayName = row.loan_no || `Loan #${row.loan_id}`;

            return (
              <tr
                key={`${row.loan_id}-${row.id}`}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              >
                {/* Customer / Loan */}
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                      <User size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {customerDisplayName}
                      </div>
                      <div className="text-[11px] text-base-content/40 truncate flex items-center gap-1.5 mt-0.5">
                        <Link
                          to={`/interest-only-loans/${row.loan_id}`}
                          className="text-primary hover:underline flex items-center gap-0.5 font-medium"
                          title="View Loan Details"
                        >
                          <span>{loanDisplayName}</span>
                          <ExternalLink size={10} className="opacity-60" />
                        </Link>
                        <span>· Sched #{row.schedule_no}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Mobile */}
                <td className="text-xs text-base-content/60 whitespace-nowrap">
                  {row.customer_mobile || row.mobile || "—"}
                </td>

                {/* Due Date */}
                <td className="text-xs whitespace-nowrap">
                  <div className="font-semibold text-base-content/80">
                    {formatDate(row.due_date) || "—"}
                  </div>
                  {isOverdueTab && daysOverdue > 0 ? (
                    <div className="flex items-center gap-1 text-[10px] text-error font-semibold mt-0.5">
                      <AlertTriangle size={10} /> {daysOverdue} days overdue
                    </div>
                  ) : isOverdueTab ? (
                    <div className="text-[10px] text-error font-medium mt-0.5">
                      Overdue
                    </div>
                  ) : null}
                </td>

                {/* Interest Due */}
                <td className="text-right text-xs whitespace-nowrap font-medium">
                  {formatCurrency(row.interest_amount)}
                </td>

                {/* Principal Portion */}
                <td className="text-right text-xs whitespace-nowrap text-base-content/60">
                  {Number(row.principal_amount) > 0 ? (
                    formatCurrency(row.principal_amount)
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                {/* Total Due */}
                <td className="text-right text-xs font-bold text-base-content whitespace-nowrap">
                  {formatCurrency(row.total_due)}
                </td>

                {/* Paid */}
                <td className="text-right text-xs whitespace-nowrap">
                  {Number(row.paid_amount) > 0 ? (
                    <span className="text-success font-semibold">
                      {formatCurrency(row.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                {/* Balance */}
                <td className="text-right text-xs font-bold whitespace-nowrap">
                  {balance > 0 ? (
                    <span
                      className={
                        daysOverdue > 0 || isOverdueTab
                          ? "text-error"
                          : "text-warning"
                      }
                    >
                      {formatCurrency(balance)}
                    </span>
                  ) : (
                    <span className="text-success">Settled</span>
                  )}
                </td>

                {/* Status */}
                <td className="text-center whitespace-nowrap">
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${
                      SCHEDULE_STATUS_STYLES[row.status] || "badge-ghost"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {row.status
                      ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
                      : "Pending"}
                  </span>
                </td>

                {/* Action */}
                <td>
                  <div className="flex items-center justify-end gap-1.5">
                    {isPaid ? (
                      <span className="badge bg-success/25 text-success border border-success/30 px-2 py-1 badge-sm gap-1 text-[11px] font-medium">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : canCollect ? (
                      <button
                        type="button"
                        onClick={() => onCollect(row)}
                        className="btn btn-primary btn-xs rounded-lg gap-1 font-medium shadow-xs"
                        title={`Collect payment for ${row.loan_no} Schedule #${row.schedule_no}`}
                      >
                        <IndianRupee size={12} />
                        Collect
                      </button>
                    ) : (
                      <span className="text-xs text-base-content/40 italic py-1">
                        Due
                      </span>
                    )}

                    {row.loan_id && (
                      <Link
                        to={`/interest-only-loans/${row.loan_id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/40 hover:text-base-content"
                        title="View loan details"
                      >
                        <ExternalLink size={12} />
                      </Link>
                    )}
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
