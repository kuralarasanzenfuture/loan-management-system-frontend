import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  HandCoins,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { fetchInstallmentsByLoan } from "../../../../redux/installments/installmentSlice.js";
import { formatCurrency } from "../../../customerLoans/utils/loanCalculations.js";

const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
};

const INSTALLMENT_STATUS_STYLES = {
  paid: "badge-success badge-outline",
  pending: "badge-ghost",
  overdue: "badge-error badge-outline",
  partial: "badge-warning badge-outline",
};

/**
 * CustomerLoansTab
 * Props:
 * - loans (array) : loans belonging to this customer
 * - loading (bool)
 */
export default function CustomerLoansTab({ loans, loading }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [installmentsByLoan, setInstallmentsByLoan] = useState({});
  const [loadingLoanId, setLoadingLoanId] = useState(null);

  const toggleExpand = async (loan) => {
    if (expandedId === loan.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(loan.id);

    // Fetch installments only the first time this loan is expanded
    if (!installmentsByLoan[loan.id]) {
      setLoadingLoanId(loan.id);
      try {
        const action = await dispatch(fetchInstallmentsByLoan(loan.id));
        const payload = action.payload;
        const inner = payload?.data ?? payload;
        // API shape: { data: { loan, summary, installments[] } }
        const data = Array.isArray(inner)
          ? inner
          : Array.isArray(inner?.installments)
            ? inner.installments
            : [];
        setInstallmentsByLoan((prev) => ({ ...prev, [loan.id]: data }));
      } finally {
        setLoadingLoanId(null);
      }
    }
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2 rounded-2xl border border-base-300 bg-base-100">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loans…</p>
      </div>
    );
  }

  if (!loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-base-300 bg-base-100">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <HandCoins size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">No loans yet</p>
        <p className="text-xs text-base-content/40">
          Loans issued to this customer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => {
        const isExpanded = expandedId === loan.id;
        const installments = installmentsByLoan[loan.id] || [];
        const isLoadingInstallments = loadingLoanId === loan.id;

        const paidCount = installments.filter(
          (i) => i.status === "paid",
        ).length;

        return (
          <div
            key={loan.id}
            className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden"
          >
            {/* Loan summary row */}
            <button
              type="button"
              onClick={() => toggleExpand(loan)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-base-200/40 transition-colors text-left"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <HandCoins size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {loan.loan_no || `Loan #${loan.id}`}
                  </p>
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {loan.status?.charAt(0).toUpperCase() +
                      loan.status?.slice(1)}
                  </span>
                </div>
                <p className="text-[11px] text-base-content/40 mt-0.5">
                  {loan.plan_name || `Plan #${loan.loan_plan_id}`} · Started{" "}
                  {loan.start_date
                    ? new Date(loan.start_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end shrink-0">
                <span className="text-sm font-bold text-base-content">
                  {formatCurrency(loan.loan_amount)}
                </span>
                <span className="text-[11px] text-base-content/40">
                  Installment {formatCurrency(loan.installment_amount)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/loans/${loan.id}`);
                }}
                className="btn btn-ghost btn-xs btn-square shrink-0"
                title="Open full loan view"
              >
                <ExternalLink size={14} />
              </button>

              {isExpanded ? (
                <ChevronUp
                  size={18}
                  className="text-base-content/40 shrink-0"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="text-base-content/40 shrink-0"
                />
              )}
            </button>

            {/* Expanded: installment history */}
            {isExpanded && (
              <div className="border-t border-base-200 bg-base-200/20">
                <div className="flex items-center justify-between px-5 py-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
                    <Receipt size={13} /> Installment History
                  </h4>
                  {installments.length > 0 && (
                    <span className="text-[11px] text-base-content/40">
                      {paidCount}/{installments.length} paid
                    </span>
                  )}
                </div>

                {isLoadingInstallments ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-base-content/40">
                    <span className="loading loading-spinner loading-sm" />
                    <span className="text-xs">Loading installments…</span>
                  </div>
                ) : installments.length === 0 ? (
                  <p className="text-xs text-base-content/40 text-center py-8">
                    No installment schedule found for this loan.
                  </p>
                ) : (
                  <div className="overflow-x-auto pb-1">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-base-content/40">
                          <th className="font-medium">#</th>
                          <th className="font-medium">Due Date</th>
                          <th className="font-medium">Amount</th>
                          <th className="font-medium">Paid</th>
                          <th className="font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((inst) => (
                          <tr
                            key={inst.id}
                            className="border-t border-base-200"
                          >
                            <td className="text-xs text-base-content/40">
                              {inst.installment_no ?? "—"}
                            </td>
                            <td className="text-xs">
                              {inst.due_date
                                ? new Date(inst.due_date).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="text-xs font-semibold">
                              {formatCurrency(inst.amount)}
                            </td>
                            <td className="text-xs">
                              {inst.paid_amount ? (
                                <span className="text-success font-semibold">
                                  {formatCurrency(inst.paid_amount)}
                                </span>
                              ) : (
                                <span className="text-base-content/30">—</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge badge-xs font-medium ${
                                  INSTALLMENT_STATUS_STYLES[inst.status] ||
                                  "badge-ghost"
                                }`}
                              >
                                {inst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
