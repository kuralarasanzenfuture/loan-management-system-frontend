import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarClock,
  Receipt,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import {
  fetchLoanSchedules,
  fetchPendingSchedules,
  fetchOverdueSchedules,
} from "../../../redux/interestOnlySchedule/interestOnlyScheduleSlice.js";
import { regenerateLoanScheduleAction } from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import {
  SCHEDULE_STATUS_STYLES,
  formatCurrency,
  formatDate,
} from "../utils/interestOnlyLoanHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
];

const formatPaymentType = (type) => {
  if (type === "interest_and_principal") return "Interest + Principal";
  if (type === "interest") return "Interest Only";
  if (type === "principal") return "Principal Only";
  return type ? type.replace(/_/g, " ") : "—";
};

export default function InterestOnlyScheduleTab({
  loanId,
  loan = null,
  onPayDue,
  onScheduleRegenerated,
}) {
  const dispatch = useDispatch();
  const {
    schedules = [],
    pendingSchedules = [],
    overdueSchedules = [],
    loading,
  } = useSelector((state) => state.interestOnlySchedules || {});

  const { can } = usePermissions();
  const canPay = can([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.LOAN_COLLECTION_CREATE,
  ]);
  const canManage = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_EDIT,
    PERMISSIONS.LOAN_CREATE,
  ]);

  const [filter, setFilter] = useState("all");
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenSubmitting, setRegenSubmitting] = useState(false);
  const [regenSuccessMsg, setRegenSuccessMsg] = useState("");
  const [regenError, setRegenError] = useState("");

  const [regenForm, setRegenForm] = useState({
    interest_frequency: "monthly",
    tenure: 12,
    tenure_type: "months",
    interest_rate: "",
  });

  const loadSchedules = () => {
    if (loanId) {
      dispatch(fetchLoanSchedules(loanId));
      dispatch(fetchPendingSchedules(loanId));
      dispatch(fetchOverdueSchedules(loanId));
    }
  };

  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, loanId]);

  useEffect(() => {
    if (loan) {
      setRegenForm({
        interest_frequency: loan.interest_frequency || "monthly",
        tenure: loan.tenure || 12,
        tenure_type: loan.tenure_type || "months",
        interest_rate: loan.interest_rate || "",
      });
    }
  }, [loan]);

  const scheduleList = Array.isArray(schedules) ? schedules : [];
  const pendingList = Array.isArray(pendingSchedules) ? pendingSchedules : [];
  const overdueList = Array.isArray(overdueSchedules) ? overdueSchedules : [];

  const rows =
    filter === "pending"
      ? pendingList
      : filter === "overdue"
        ? overdueList
        : scheduleList;

  const hasPayAction = Boolean(onPayDue && canPay);
  const canRegenerate =
    canManage &&
    loan &&
    Number(loan.total_interest_paid || 0) === 0 &&
    Number(loan.total_principal_paid || 0) === 0;

  // Handle regenerating schedule
  const handleRegenerateSubmit = async (e) => {
    e.preventDefault();
    setRegenSubmitting(true);
    setRegenError("");

    try {
      const action = await dispatch(
        regenerateLoanScheduleAction({
          id: loanId,
          data: {
            interest_frequency: regenForm.interest_frequency,
            tenure: Number(regenForm.tenure),
            tenure_type: regenForm.tenure_type,
            interest_rate: regenForm.interest_rate
              ? Number(regenForm.interest_rate)
              : undefined,
          },
        }),
      );

      if (regenerateLoanScheduleAction.fulfilled.match(action)) {
        setShowRegenModal(false);
        setRegenSuccessMsg("Repayment schedule regenerated successfully with all installments!");
        loadSchedules();
        if (onScheduleRegenerated) onScheduleRegenerated();
        setTimeout(() => setRegenSuccessMsg(""), 5000);
      } else {
        setRegenError(action.payload || "Failed to regenerate schedule.");
      }
    } catch (err) {
      setRegenError(err.message || "Failed to regenerate schedule.");
    } finally {
      setRegenSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-200 bg-base-200/20 flex-wrap gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
          <CalendarClock size={14} className="text-primary" /> Repayment Schedule
        </h3>

        <div className="flex items-center gap-2">
          {canRegenerate && (
            <button
              type="button"
              onClick={() => setShowRegenModal(true)}
              className="btn btn-xs btn-outline btn-warning gap-1 rounded-lg font-medium"
              title="Regenerate all installment schedules"
            >
              <RefreshCw size={12} />
              Regenerate Schedule
            </button>
          )}

          <div className="join">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`join-item btn btn-xs ${
                  filter === f.key
                    ? "btn-primary"
                    : "btn-ghost bg-base-100 border-base-300"
                }`}
              >
                {f.label}
                {f.key === "pending" && pendingList.length > 0 && (
                  <span className="badge badge-xs ml-1">
                    {pendingList.length}
                  </span>
                )}
                {f.key === "overdue" && overdueList.length > 0 && (
                  <span className="badge badge-xs badge-error ml-1">
                    {overdueList.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {regenSuccessMsg && (
        <div className="alert alert-success text-xs py-2.5 px-4 rounded-none flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{regenSuccessMsg}</span>
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex items-center justify-center py-16 gap-2 text-base-content/40">
          <span className="loading loading-spinner loading-md text-primary" />
          <span className="text-sm font-medium">Loading schedule…</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-200 text-base-content/40">
            <Receipt size={20} />
          </span>
          <p className="text-sm font-medium text-base-content/70">
            No {filter !== "all" ? filter : ""} schedule entries found.
          </p>
          {canRegenerate && (
            <button
              onClick={() => setShowRegenModal(true)}
              className="btn btn-sm btn-primary mt-2 gap-1.5 rounded-xl"
            >
              <RefreshCw size={13} />
              Generate All Installments
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
                <th className="font-semibold py-3 whitespace-nowrap">#</th>
                <th className="font-semibold py-3 whitespace-nowrap">Due Date</th>
                <th className="font-semibold py-3 whitespace-nowrap">Type</th>
                <th className="font-semibold py-3 text-right whitespace-nowrap">Interest</th>
                <th className="font-semibold py-3 text-right whitespace-nowrap">Principal</th>
                <th className="font-semibold py-3 text-right whitespace-nowrap">Total Due</th>
                <th className="font-semibold py-3 text-right whitespace-nowrap">Paid</th>
                <th className="font-semibold py-3 text-right whitespace-nowrap">Balance</th>
                <th className="font-semibold py-3 whitespace-nowrap text-center">Status</th>
                {hasPayAction && (
                  <th className="font-semibold py-3 text-right whitespace-nowrap min-w-[110px]">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const balance = Number(s.balance_amount || 0);
                const canPayRow = hasPayAction && balance > 0;
                const isPaid = s.status === "paid" || balance <= 0;

                return (
                  <tr
                    key={s.id}
                    className="border-t border-base-200 hover:bg-base-200/40 transition-colors"
                  >
                    <td className="text-xs text-base-content/50 font-mono whitespace-nowrap">
                      {s.schedule_no}
                    </td>
                    <td className="text-xs font-medium whitespace-nowrap">
                      {formatDate(s.due_date)}
                    </td>
                    <td className="text-xs whitespace-nowrap font-medium">
                      <span
                        className={`badge badge-sm font-medium ${
                          s.payment_type === "interest_and_principal"
                            ? "badge-primary badge-outline"
                            : "badge-ghost"
                        }`}
                      >
                        {formatPaymentType(s.payment_type)}
                      </span>
                    </td>
                    <td className="text-right text-xs whitespace-nowrap font-medium">
                      {formatCurrency(s.interest_amount)}
                    </td>
                    <td className="text-right text-xs whitespace-nowrap text-base-content/60">
                      {Number(s.principal_amount) > 0 ? (
                        formatCurrency(s.principal_amount)
                      ) : (
                        <span className="text-base-content/30">—</span>
                      )}
                    </td>
                    <td className="text-right text-xs font-bold whitespace-nowrap text-base-content">
                      {formatCurrency(s.total_due)}
                    </td>
                    <td className="text-right text-xs whitespace-nowrap">
                      {Number(s.paid_amount) > 0 ? (
                        <span className="text-success font-semibold">
                          {formatCurrency(s.paid_amount)}
                        </span>
                      ) : (
                        <span className="text-base-content/30">—</span>
                      )}
                    </td>
                    <td className="text-right text-xs font-bold whitespace-nowrap">
                      {balance > 0 ? (
                        <span className={s.status === "overdue" ? "text-error" : "text-warning"}>
                          {formatCurrency(balance)}
                        </span>
                      ) : (
                        <span className="text-success">Settled</span>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`badge gap-1.5 font-medium badge-sm ${
                          SCHEDULE_STATUS_STYLES[s.status] || "badge-ghost"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "Pending"}
                      </span>
                    </td>
                    {hasPayAction && (
                      <td className="text-right whitespace-nowrap py-2">
                        {canPayRow ? (
                          <button
                            type="button"
                            onClick={() =>
                              onPayDue({
                                amount: balance,
                                remarks: `Repayment for Schedule #${s.schedule_no}`,
                              })
                            }
                            className="btn btn-xs btn-primary btn-outline inline-flex flex-row flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap px-3 h-7 min-h-0 font-medium rounded-lg shadow-none"
                            title={`Pay due amount for Schedule #${s.schedule_no}`}
                          >
                            <IndianRupee size={12} className="shrink-0" />
                            <span className="leading-none">Pay Due</span>
                          </button>
                        ) : isPaid ? (
                          <span className="badge bg-success/25 text-success border border-success/30 px-2 py-1 badge-sm gap-1 text-[11px] font-medium">
                            <CheckCircle2 size={11} /> Settled
                          </span>
                        ) : (
                          <span className="text-[11px] text-base-content/30 font-medium">
                            —
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Regenerate Schedule Modal ──────────────────────────────────────── */}
      {showRegenModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RefreshCw size={16} className="text-warning" />
                Regenerate Repayment Schedule
              </h3>
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="btn btn-ghost btn-xs btn-square"
              >
                <X size={16} />
              </button>
            </div>

            {regenError && (
              <div className="alert alert-error text-xs py-2 mb-3">
                <AlertCircle size={14} />
                <span>{regenError}</span>
              </div>
            )}

            <form onSubmit={handleRegenerateSubmit} className="space-y-3">
              <p className="text-xs text-base-content/60">
                You can re-generate the periodic schedule for this loan. Any existing unpaid schedule will be replaced with the new installment breakdown.
              </p>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interest Frequency *
                  </span>
                </label>
                <select
                  value={regenForm.interest_frequency}
                  onChange={(e) =>
                    setRegenForm((prev) => ({
                      ...prev,
                      interest_frequency: e.target.value,
                    }))
                  }
                  className="select select-bordered select-sm rounded-lg w-full text-xs"
                >
                  <option value="monthly">Monthly (Recommended - 12 dues/year)</option>
                  <option value="quarterly">Quarterly (4 dues/year)</option>
                  <option value="half_yearly">Half-Yearly (2 dues/year)</option>
                  <option value="yearly">Yearly / Bullet (1 due/year)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">Tenure</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={regenForm.tenure}
                    onChange={(e) =>
                      setRegenForm((prev) => ({
                        ...prev,
                        tenure: e.target.value,
                      }))
                    }
                    className="input input-bordered input-sm rounded-lg text-xs"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">Unit</span>
                  </label>
                  <select
                    value={regenForm.tenure_type}
                    onChange={(e) =>
                      setRegenForm((prev) => ({
                        ...prev,
                        tenure_type: e.target.value,
                      }))
                    }
                    className="select select-bordered select-sm rounded-lg text-xs"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interest Rate (% per period)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={regenForm.interest_rate}
                  onChange={(e) =>
                    setRegenForm((prev) => ({
                      ...prev,
                      interest_rate: e.target.value,
                    }))
                  }
                  className="input input-bordered input-sm rounded-lg text-xs"
                  placeholder={loan?.interest_rate || "1.00"}
                />
              </div>

              <div className="modal-action mt-4">
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="btn btn-ghost btn-sm rounded-lg"
                  disabled={regenSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenSubmitting}
                  className="btn btn-warning btn-sm rounded-lg gap-1.5"
                >
                  {regenSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Regenerate Installments
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setShowRegenModal(false)}
          />
        </div>
      )}
    </div>
  );
}
