import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, HandCoins, Phone, Pencil, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatRate,
  FREQUENCY_CONFIG,
  LOAN_STATUS_CONFIG,
} from "../utils/interestLoanHelpers.js";

const InterestLoanTable = ({
  loans = [],
  loading = false,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm font-medium">Loading loans…</p>
      </div>
    );
  }

  if (!loans || loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <HandCoins size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content/70">
            No interest loans found
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Disburse your first anytime interest loan to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/40">
            <th className="font-semibold py-3 px-4">Loan No</th>
            <th className="font-semibold py-3 px-4">Customer</th>
            <th className="font-semibold py-3 px-4">Plan</th>
            <th className="font-semibold py-3 px-4 text-right">Principal</th>
            <th className="font-semibold py-3 px-4 text-right">Outstanding</th>
            <th className="font-semibold py-3 px-4 text-center">Rate / Cycle</th>
            <th className="font-semibold py-3 px-4">Start Date</th>
            <th className="font-semibold py-3 px-4">Next Due</th>
            <th className="font-semibold py-3 px-4 text-center">Status</th>
            <th className="font-semibold py-3 px-4 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const statusCfg =
              LOAN_STATUS_CONFIG[loan.status] || LOAN_STATUS_CONFIG.active;
            const freqCfg =
              FREQUENCY_CONFIG[loan.interest_frequency?.toLowerCase()] ||
              FREQUENCY_CONFIG.monthly;

            return (
              <tr
                key={loan.id}
                onClick={() => navigate(`/interest-loans/${loan.id}`)}
                className="hover:bg-base-200/50 cursor-pointer transition-colors border-b border-base-200"
              >
                {/* Loan No */}
                <td className="px-4 py-3 font-semibold text-primary font-mono text-xs">
                  {loan.loan_no}
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content text-sm">
                      {loan.customer_name ||
                        `${loan.first_name || ""} ${loan.last_name || ""}`.trim()}
                    </span>
                    {loan.customer_mobile && (
                      <span className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone size={11} className="opacity-70" />
                        {loan.customer_mobile}
                      </span>
                    )}
                  </div>
                </td>

                {/* Plan */}
                <td className="px-4 py-3">
                  <span className="font-medium text-base-content text-xs">
                    {loan.plan_name || "Custom Plan"}
                  </span>
                  {loan.plan_code && (
                    <span className="block text-[11px] text-base-content/40 font-mono">
                      {loan.plan_code}
                    </span>
                  )}
                </td>

                {/* Principal */}
                <td className="px-4 py-3 text-right font-medium text-base-content">
                  {formatCurrency(loan.principal_amount)}
                </td>

                {/* Outstanding */}
                <td className="px-4 py-3 text-right font-bold text-base-content">
                  {formatCurrency(loan.outstanding_principal)}
                </td>

                {/* Rate / Cycle */}
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-xs text-base-content">
                      {formatRate(loan.interest_rate, loan.interest_type)}
                    </span>
                    <span className={freqCfg.badge}>{freqCfg.label}</span>
                  </div>
                </td>

                {/* Start Date */}
                <td className="px-4 py-3 text-xs text-base-content/70">
                  {formatDate(loan.start_date)}
                </td>

                {/* Next Due Date */}
                <td className="px-4 py-3 text-xs">
                  {loan.next_interest_date ? (
                    <span className="font-medium text-base-content">
                      {formatDate(loan.next_interest_date)}
                    </span>
                  ) : (
                    <span className="text-base-content/40 italic">Settled</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span className={statusCfg.badge}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </td>

                {/* Actions */}
                <td
                  className="px-4 py-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => navigate(`/interest-loans/${loan.id}`)}
                      className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                      title="View details"
                    >
                      <Eye size={15} />
                    </button>
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(loan)}
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                        title="Edit loan"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(loan)}
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error"
                        title="Delete loan"
                      >
                        <Trash2 size={14} />
                      </button>
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
};

export default InterestLoanTable;
