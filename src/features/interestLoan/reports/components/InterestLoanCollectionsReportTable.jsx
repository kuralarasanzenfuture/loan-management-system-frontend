import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, Coins } from "lucide-react";
import dayjs from "dayjs";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const PERIOD_STATUS_BADGES = {
  paid: "badge-success text-success-content",
  partial: "badge-warning text-warning-content",
  due: "badge-info text-info-content",
  overdue: "badge-error text-error-content font-bold animate-pulse",
  pending: "badge-ghost",
};

export default function InterestLoanCollectionsReportTable({
  todayCollections = [],
  overdueCollections = [],
  todaySummary = {},
  overdueSummary = {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <span className="text-xs text-base-content/60 font-medium">
          Loading collections & dues ledger...
        </span>
      </div>
    );
  }

  const allRecords = [...overdueCollections, ...todayCollections];

  return (
    <div className="space-y-4">
      {/* 1. Overdue Alert Banner if overdues exist */}
      {overdueCollections.length > 0 && (
        <div className="alert alert-error/10 border border-error/30 rounded-2xl flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-error text-white flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-error">
                {overdueCollections.length} Overdue Interest Cycles Detected
              </h4>
              <p className="text-[11px] text-base-content/60">
                Total overdue interest:{" "}
                <span className="font-bold text-error">
                  {formatCurrency(overdueSummary?.total_overdue_amount)}
                </span>{" "}
                across {overdueSummary?.total_loans_overdue ?? overdueCollections.length} accounts.
              </p>
            </div>
          </div>
          <Link
            to="/interest-loans/collections"
            className="btn btn-xs btn-error text-white rounded-lg text-xs normal-case shadow-xs"
          >
            Manage Dues
          </Link>
        </div>
      )}

      {/* 2. Collections Table */}
      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-2xs">
        {allRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Coins size={40} className="mx-auto text-base-content/30 mb-3" />
            <h4 className="text-sm font-bold text-base-content">No Outstanding Dues Found</h4>
            <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
              All interest cycles are currently up-to-date or already settled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full text-xs">
              <thead className="bg-base-200/60 border-b border-base-300 text-base-content/70">
                <tr>
                  <th className="font-semibold py-3 pl-4">Period / Cycle</th>
                  <th className="font-semibold py-3">Loan Account</th>
                  <th className="font-semibold py-3">Customer</th>
                  <th className="font-semibold py-3">Due Date</th>
                  <th className="font-semibold py-3 text-right">Cycle Interest</th>
                  <th className="font-semibold py-3 text-right">Paid Amount</th>
                  <th className="font-semibold py-3 text-right">Outstanding Due</th>
                  <th className="font-semibold py-3 text-center">Status</th>
                  <th className="font-semibold py-3 pr-4 text-center">Overdue Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {allRecords.map((item) => {
                  const isOverdue = item.status === "overdue" || (item.days_overdue && item.days_overdue > 0);
                  return (
                    <tr
                      key={`${item.loan_id}-${item.period_no || item.id}`}
                      className={`hover:bg-base-200/40 transition-colors ${
                        isOverdue ? "bg-error/5" : ""
                      }`}
                    >
                      <td className="pl-4 font-mono font-bold text-primary">
                        Cycle #{item.period_no ?? 1}
                      </td>

                      <td className="font-mono font-semibold">
                        <Link
                          to={`/interest-loans/${item.loan_id}`}
                          className="hover:underline text-primary"
                        >
                          {item.loan_no || `Loan #${item.loan_id}`}
                        </Link>
                        <span className="text-[10px] text-base-content/40 block font-sans font-normal capitalize">
                          {item.interest_frequency || "monthly"} cycle
                        </span>
                      </td>

                      <td>
                        <span className="font-semibold text-base-content block">
                          {item.customer_name || item.customer_no || "—"}
                        </span>
                        <span className="text-[10px] text-base-content/50 block font-mono">
                          {item.customer_mobile}
                        </span>
                      </td>

                      <td className="font-medium">
                        {item.scheduled_date
                          ? dayjs(item.scheduled_date).format("DD MMM YYYY")
                          : item.due_date
                          ? dayjs(item.due_date).format("DD MMM YYYY")
                          : "—"}
                      </td>

                      <td className="text-right font-medium text-base-content">
                        {formatCurrency(item.interest_amount || item.due_amount)}
                      </td>

                      <td className="text-right font-semibold text-success">
                        {formatCurrency(item.paid_interest_amount || item.collected_amount)}
                      </td>

                      <td className="text-right font-bold text-error">
                        {formatCurrency(
                          item.outstanding_interest_amount || item.outstanding_amount
                        )}
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge badge-sm font-semibold capitalize ${
                            PERIOD_STATUS_BADGES[item.status] || "badge-ghost"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="pr-4 text-center font-mono font-semibold">
                        {item.days_overdue > 0 ? (
                          <span className="text-error">+{item.days_overdue} d</span>
                        ) : (
                          <span className="text-base-content/40">On Time</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
