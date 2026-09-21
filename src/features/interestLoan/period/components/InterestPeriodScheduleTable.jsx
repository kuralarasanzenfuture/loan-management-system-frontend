import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Calendar, Clock } from "lucide-react";
import { triggerSyncDuePeriods } from "../../../../redux/interestLoan/period/interestPeriodSlice.js";
import {
  formatCurrency,
  formatDate,
  formatRate,
  PERIOD_STATUS_CONFIG,
} from "../../loan/utils/interestLoanHelpers.js";

const InterestPeriodScheduleTable = ({
  periods = [],
  loanId = null,
  onSyncComplete,
}) => {
  const dispatch = useDispatch();
  const { syncing } = useSelector((state) => state.interestPeriods || {});

  const handleSyncDue = async () => {
    try {
      await dispatch(triggerSyncDuePeriods(loanId)).unwrap();
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      console.error("Failed to sync due periods:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 bg-base-200/40">
        <div>
          <h3 className="text-sm font-bold text-base-content flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Periodic Billing Schedule & Dues
          </h3>
          <p className="text-xs text-base-content/50 mt-0.5">
            Automated billing cycles computed from assigned anytime loan terms
          </p>
        </div>

        <button
          onClick={handleSyncDue}
          disabled={syncing}
          className="btn btn-outline btn-primary btn-xs gap-1.5 shadow-xs"
          title="Advance past scheduled dates to 'Due' status"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync Due Statuses"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/20">
              <th scope="col" className="px-4 py-3 text-center w-12">
                #
              </th>
              <th scope="col" className="px-4 py-3">
                Billing Cycle
              </th>
              <th scope="col" className="px-4 py-3">
                Scheduled Date
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Opening Principal
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Rate
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Interest Due
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Paid
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Balance
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {periods && periods.length > 0 ? (
              periods.map((period) => {
                const statusCfg =
                  PERIOD_STATUS_CONFIG[period.status] ||
                  PERIOD_STATUS_CONFIG.pending;

                return (
                  <tr
                    key={period.id || period.period_no}
                    className="hover:bg-base-200/50 transition-colors border-b border-base-200"
                  >
                    <td className="px-4 py-3.5 text-center font-bold text-xs text-base-content">
                      {period.period_no}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-semibold text-base-content">
                        {formatDate(period.period_start_date)}
                      </span>
                      <span className="text-base-content/40 mx-1">→</span>
                      <span className="font-semibold text-base-content">
                        {formatDate(period.period_end_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-medium text-base-content">
                        {formatDate(period.scheduled_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-medium text-base-content">
                      {formatCurrency(period.opening_principal)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-base-content/70">
                      {formatRate(period.interest_rate)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-bold text-base-content">
                      {formatCurrency(period.interest_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-success font-semibold">
                      {formatCurrency(period.paid_interest_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-bold text-warning">
                      {formatCurrency(period.outstanding_interest_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={statusCfg.badge}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-12 text-center text-base-content/40"
                >
                  <Clock size={28} className="mx-auto mb-2 text-base-content/20" />
                  <p className="text-xs font-medium">
                    No billing periods generated yet
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterestPeriodScheduleTable;
