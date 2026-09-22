import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, FileSpreadsheet } from "lucide-react";
import dayjs from "dayjs";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const STATUS_BADGES = {
  active: "badge-primary text-primary-content",
  completed: "badge-success text-success-content",
  closed: "badge-neutral text-neutral-content",
  cancelled: "badge-error text-error-content",
};

export default function InterestLoanLoansReportTable({
  loans = [],
  pagination = {},
  onPageChange = () => {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <span className="text-xs text-base-content/60 font-medium">
          Loading loan portfolio report...
        </span>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-2xl p-12 text-center">
        <FileSpreadsheet size={40} className="mx-auto text-base-content/30 mb-3" />
        <h4 className="text-sm font-bold text-base-content">No Loan Records Found</h4>
        <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
          Try adjusting your date range or filter criteria to see loan portfolio records.
        </p>
      </div>
    );
  }

  const { page = 1, totalPages = 1, total = loans.length } = pagination;

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="table table-sm w-full text-xs">
          <thead className="bg-base-200/60 border-b border-base-300 text-base-content/70">
            <tr>
              <th className="font-semibold py-3 pl-4">Loan Account</th>
              <th className="font-semibold py-3">Customer</th>
              <th className="font-semibold py-3">Plan & Frequency</th>
              <th className="font-semibold py-3 text-right">Principal Disbursed</th>
              <th className="font-semibold py-3 text-right">Outstanding Principal</th>
              <th className="font-semibold py-3 text-right">Interest Rate</th>
              <th className="font-semibold py-3 text-right">Interest Paid</th>
              <th className="font-semibold py-3 text-right">Principal Paid</th>
              <th className="font-semibold py-3 text-center">Status</th>
              <th className="font-semibold py-3 pr-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-base-200/40 transition-colors">
                <td className="pl-4 font-mono font-bold text-primary">
                  <Link
                    to={`/interest-loans/${loan.id}`}
                    className="hover:underline flex items-center gap-1"
                  >
                    {loan.loan_no}
                  </Link>
                  <span className="text-[10px] text-base-content/40 block font-sans font-normal">
                    {loan.start_date ? dayjs(loan.start_date).format("DD MMM YYYY") : "—"}
                  </span>
                </td>

                <td>
                  <span className="font-semibold text-base-content block">
                    {loan.customer_name || loan.customer_no || `Cust #${loan.customer_id}`}
                  </span>
                  <span className="text-[10px] text-base-content/50 block font-mono">
                    {loan.customer_mobile || loan.customer_no}
                  </span>
                </td>

                <td>
                  <span className="font-medium text-base-content block">
                    {loan.plan_name || "Custom Plan"}
                  </span>
                  <span className="badge badge-xs badge-ghost capitalize font-medium">
                    {loan.interest_frequency}
                  </span>
                </td>

                <td className="text-right font-semibold text-base-content">
                  {formatCurrency(loan.principal_amount)}
                </td>

                <td className="text-right font-bold text-info">
                  {formatCurrency(loan.outstanding_principal)}
                </td>

                <td className="text-right font-medium">
                  {loan.interest_rate}%
                </td>

                <td className="text-right font-semibold text-success">
                  {formatCurrency(loan.total_interest_paid)}
                </td>

                <td className="text-right font-semibold text-base-content/80">
                  {formatCurrency(loan.total_principal_paid)}
                </td>

                <td className="text-center">
                  <span
                    className={`badge badge-sm font-semibold capitalize ${
                      STATUS_BADGES[loan.status] || "badge-ghost"
                    }`}
                  >
                    {loan.status}
                  </span>
                </td>

                <td className="pr-4 text-center">
                  <Link
                    to={`/interest-loans/${loan.id}`}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                    title="View Account Details"
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
          Showing <span className="font-semibold text-base-content">{loans.length}</span> of{" "}
          <span className="font-semibold text-base-content">{total}</span> records
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
