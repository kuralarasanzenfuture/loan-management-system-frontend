import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Calendar, Clock, IndianRupee, CheckCircle2 } from "lucide-react";
import { triggerSyncDuePeriods } from "../../../../redux/interestLoan/period/interestPeriodSlice.js";
import {
  formatCurrency,
  formatDate,
  formatRate,
  PERIOD_STATUS_CONFIG,
} from "../../loan/utils/interestLoanHelpers.js";
import { periodOutstanding } from "../../payment/utils/interestLoanPaymentHelpers.js";

const InterestPeriodScheduleTable = ({
  periods = [],
  loanId = null,
  onSyncComplete,
  canCollect = false,
  onPayPeriod,
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
          <h3 className="text-base font-extrabold text-base-content flex items-center gap-2 tracking-tight">
            <Calendar size={16} className="text-primary" />
            Periodic Billing Schedule & Dues
          </h3>
          <p className="text-xs text-base-content/50 mt-0.5 font-medium">
            Automated billing cycles computed from assigned anytime loan terms
          </p>
        </div>

        <button
          onClick={handleSyncDue}
          disabled={syncing}
          className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-primary hover:border-primary/50 text-xs font-semibold rounded-lg gap-1.5 shadow-2xs h-8 min-h-[32px] px-3 transition-all"
          title="Advance past scheduled dates to 'Due' status"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          <span>{syncing ? "Syncing..." : "Sync Due Statuses"}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 border-b border-base-200 bg-base-200/40 select-none">
              <th scope="col" className="px-4 py-3 text-center w-12">
                #
              </th>
              <th scope="col" className="px-4 py-3 min-w-[210px]">
                Billing Cycle
              </th>
              <th scope="col" className="px-4 py-3 min-w-[120px]">
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
              {canCollect && (
                <th scope="col" className="px-4 py-3 text-right min-w-[120px]">
                  Action
                </th>
              )}
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
                    className="hover:bg-base-200/40 transition-colors border-b border-base-200"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-base-200 text-xs font-bold text-base-content/70">
                        {period.period_no}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-base-content">
                        <span>{formatDate(period.period_start_date)}</span>
                        <span className="text-base-content/30 font-normal">→</span>
                        <span>{formatDate(period.period_end_date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-base-content tabular-nums">
                      {formatDate(period.scheduled_date)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-base-content/80">
                      {formatCurrency(period.opening_principal)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-base-content/70">
                      {formatRate(period.interest_rate)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-base-content">
                      {formatCurrency(period.interest_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(period.paid_interest_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
                      {formatCurrency(period.outstanding_interest_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={statusCfg.badge}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    {canCollect && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {periodOutstanding(period) > 0 ? (
                          <button
                            type="button"
                            onClick={() => onPayPeriod?.(period)}
                            className="btn btn-xs btn-primary inline-flex flex-row flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap px-3 h-7 min-h-[28px] rounded-lg font-bold text-xs shadow-xs hover:shadow-sm hover:brightness-105 active:scale-95 transition-all"
                            title={`Pay ₹${periodOutstanding(period).toLocaleString("en-IN")} due for cycle #${period.period_no}`}
                          >
                            <IndianRupee size={12} className="shrink-0" />
                            <span className="leading-none whitespace-nowrap">Pay Due</span>
                          </button>
                        ) : period.status === "paid" ? (
                          <span className="badge badge-sm bg-success/15 text-success border-success/30 gap-1 font-medium">
                            <CheckCircle2 size={11} />
                            Settled
                          </span>
                        ) : (
                          <span className="text-[11px] text-base-content/30">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={canCollect ? 10 : 9}
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
