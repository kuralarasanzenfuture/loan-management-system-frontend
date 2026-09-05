import React from "react";
import { Receipt, User, Coins, Calendar, CreditCard, Tag } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getFullName,
} from "../../utils/interestReportHelpers.js";

const getPaymentModeBadge = (mode) => {
  const m = (mode || "").toLowerCase();
  switch (m) {
    case "cash":
      return <span className="badge badge-sm badge-success/20 text-success font-medium">Cash</span>;
    case "bank":
    case "bank_transfer":
      return <span className="badge badge-sm badge-info/20 text-info font-medium">Bank Transfer</span>;
    case "upi":
      return <span className="badge badge-sm badge-primary/20 text-primary font-medium">UPI</span>;
    case "cheque":
      return <span className="badge badge-sm badge-warning/20 text-warning font-medium">Cheque</span>;
    default:
      return <span className="badge badge-sm badge-ghost text-base-content/70 font-medium">{mode || "Other"}</span>;
  }
};

/**
 * InterestCollectionReportTable
 * Table displaying interest-only collection payments.
 */
export default function InterestCollectionReportTable({ rows = [], loading }) {
  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm font-medium">Loading interest collections…</p>
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-base-200 text-base-content/40">
          <Coins size={24} />
        </span>
        <p className="text-sm font-semibold text-base-content/70">
          No interest collection records found
        </p>
        <p className="text-xs text-base-content/40 max-w-sm">
          Try adjusting the search criteria or date range filter above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="w-12 font-semibold">#</th>
            <th className="font-semibold">Customer</th>
            <th className="font-semibold">Loan / Plan</th>
            <th className="font-semibold text-center">Payment #</th>
            <th className="font-semibold">Mode</th>
            <th className="font-semibold text-right">Interest Paid</th>
            <th className="font-semibold text-right">Principal Paid</th>
            <th className="font-semibold text-right">Total Paid</th>
            <th className="font-semibold text-right">Payment Date</th>
            <th className="font-semibold">Received By</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const hasInterest = Number(row.interest_amount) > 0;
            const hasPrincipal = Number(row.principal_amount) > 0;

            return (
              <tr
                key={row.id}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors"
              >
                <td className="text-base-content/40 font-mono text-xs">
                  {index + 1}
                </td>

                {/* Customer */}
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                      <User size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {getFullName(row)}
                      </div>
                      <div className="text-[11px] text-base-content/50 flex items-center gap-1.5">
                        <span>{row.mobile || "—"}</span>
                        {row.customer_no && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{row.customer_no}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Loan & Plan */}
                <td>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold text-base-content/80">
                      {row.loan_no}
                    </div>
                    <div className="text-[11px] text-base-content/50 truncate max-w-[200px]" title={row.plan_name}>
                      {row.plan_name || `${row.interest_frequency || "monthly"} interest`}
                    </div>
                  </div>
                </td>

                {/* Payment # */}
                <td className="text-center">
                  <span className="badge badge-ghost badge-sm font-semibold">
                    #{row.payment_no}
                  </span>
                </td>

                {/* Mode */}
                <td>
                  <div className="flex flex-col gap-0.5">
                    {getPaymentModeBadge(row.payment_mode)}
                    {row.transaction_reference && (
                      <span className="text-[10px] text-base-content/40 font-mono truncate max-w-[120px]" title={row.transaction_reference}>
                        Ref: {row.transaction_reference}
                      </span>
                    )}
                    {row.cheque_number && (
                      <span className="text-[10px] text-base-content/40 font-mono truncate max-w-[120px]" title={row.cheque_number}>
                        Chq: {row.cheque_number}
                      </span>
                    )}
                  </div>
                </td>

                {/* Interest Paid */}
                <td className="text-right text-xs font-medium">
                  {hasInterest ? (
                    <span className="text-primary font-semibold">
                      {formatCurrency(row.interest_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                {/* Principal Paid */}
                <td className="text-right text-xs font-medium">
                  {hasPrincipal ? (
                    <span className="text-info font-semibold">
                      {formatCurrency(row.principal_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                {/* Total Paid */}
                <td className="text-right text-sm font-bold text-success">
                  {formatCurrency(row.payment_amount)}
                </td>

                {/* Payment Date */}
                <td className="text-right text-xs text-base-content/70 whitespace-nowrap">
                  {formatDateTime(row.payment_date)}
                </td>

                {/* Received By */}
                <td>
                  <div className="text-xs font-medium text-base-content/80 truncate max-w-[120px]">
                    {row.received_by_name || "—"}
                  </div>
                  {row.remarks && (
                    <div className="text-[10px] text-base-content/40 truncate max-w-[140px]" title={row.remarks}>
                      {row.remarks}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
