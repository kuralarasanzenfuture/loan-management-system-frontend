import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, CreditCard } from "lucide-react";
import dayjs from "dayjs";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const MODE_BADGES = {
  cash: "badge-success text-success-content",
  bank: "badge-info text-info-content",
  upi: "badge-secondary text-secondary-content",
  cheque: "badge-warning text-warning-content",
  other: "badge-ghost",
};

export default function InterestLoanPaymentsReportTable({
  payments = [],
  pagination = {},
  onPageChange = () => {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <span className="text-xs text-base-content/60 font-medium">
          Loading payment receipts ledger...
        </span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-2xl p-12 text-center">
        <CreditCard size={40} className="mx-auto text-base-content/30 mb-3" />
        <h4 className="text-sm font-bold text-base-content">No Payment Records Found</h4>
        <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
          No payment transactions matched your date range or filters.
        </p>
      </div>
    );
  }

  const { page = 1, totalPages = 1, total = payments.length } = pagination;

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="table table-sm w-full text-xs">
          <thead className="bg-base-200/60 border-b border-base-300 text-base-content/70">
            <tr>
              <th className="font-semibold py-3 pl-4">Payment #</th>
              <th className="font-semibold py-3">Date</th>
              <th className="font-semibold py-3">Loan Account</th>
              <th className="font-semibold py-3">Customer</th>
              <th className="font-semibold py-3 text-center">Mode</th>
              <th className="font-semibold py-3 text-right">Total Paid</th>
              <th className="font-semibold py-3 text-right text-success">Interest Portion</th>
              <th className="font-semibold py-3 text-right text-info">Principal Portion</th>
              <th className="font-semibold py-3 text-right">Remaining Principal</th>
              <th className="font-semibold py-3 pr-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-base-200/40 transition-colors">
                <td className="pl-4 font-mono font-bold text-primary">
                  <Link
                    to={`/interest-loans/payments/${p.id}`}
                    className="hover:underline"
                  >
                    {p.payment_no || `PAY-${p.id}`}
                  </Link>
                </td>

                <td className="font-medium text-base-content">
                  {p.payment_date
                    ? dayjs(p.payment_date).format("DD MMM YYYY")
                    : "—"}
                  <span className="text-[10px] text-base-content/40 block font-mono">
                    {p.payment_date ? dayjs(p.payment_date).format("hh:mm A") : ""}
                  </span>
                </td>

                <td className="font-mono font-semibold">
                  <Link
                    to={`/interest-loans/${p.loan_id}`}
                    className="hover:underline text-primary"
                  >
                    {p.loan_no || `Loan #${p.loan_id}`}
                  </Link>
                </td>

                <td>
                  <span className="font-semibold text-base-content block">
                    {p.customer_name || p.customer_no || "—"}
                  </span>
                  <span className="text-[10px] text-base-content/50 block font-mono">
                    {p.customer_mobile}
                  </span>
                </td>

                <td className="text-center">
                  <span
                    className={`badge badge-sm uppercase text-[10px] font-bold ${
                      MODE_BADGES[p.payment_mode] || "badge-ghost"
                    }`}
                  >
                    {p.payment_mode || "cash"}
                  </span>
                </td>

                <td className="text-right font-bold text-base-content">
                  {formatCurrency(p.payment_amount)}
                </td>

                <td className="text-right font-semibold text-success">
                  {formatCurrency(p.interest_amount)}
                </td>

                <td className="text-right font-semibold text-info">
                  {formatCurrency(p.principal_amount)}
                </td>

                <td className="text-right font-mono font-medium text-base-content/70">
                  {formatCurrency(p.outstanding_principal_after)}
                </td>

                <td className="pr-4 text-center">
                  <Link
                    to={`/interest-loans/payments/${p.id}`}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                    title="View Receipt"
                  >
                    <Eye size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 bg-base-200/40 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60">
        <span>
          Showing <span className="font-semibold text-base-content">{payments.length}</span> of{" "}
          <span className="font-semibold text-base-content">{total}</span> transactions
        </span>

        {totalPages > 1 && (
          <div className="join">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="join-item btn btn-xs btn-ghost border border-base-300 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="join-item btn btn-xs btn-ghost border border-base-300 pointer-events-none">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="join-item btn btn-xs btn-ghost border border-base-300 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
