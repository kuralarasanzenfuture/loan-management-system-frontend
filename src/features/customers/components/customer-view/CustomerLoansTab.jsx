import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  HandCoins,
  Percent,
  ExternalLink,
  Receipt,
  Plus,
  Calendar,
  Wallet,
  Clock,
} from "lucide-react";
import { fetchInstallmentsByLoan } from "../../../../redux/installments/installmentSlice.js";
import { formatCurrency } from "../../../customerLoans/utils/loanCalculations.js";

const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
  cancelled: "badge-ghost",
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
 * - loans (array) : EMI loans belonging to this customer
 * - interestLoans (array) : Interest-only loans belonging to this customer
 * - loading (bool)
 * - onOpenCreateInterestLoan (fn) : callback to launch New Interest Loan modal
 */
export default function CustomerLoansTab({
  loans = [],
  interestLoans = [],
  loading = false,
  onOpenCreateLoan,
  onOpenCreateInterestLoan,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("all"); // "all" | "regular" | "interest_only"
  const [expandedId, setExpandedId] = useState(null);
  const [installmentsByLoan, setInstallmentsByLoan] = useState({});
  const [loadingLoanId, setLoadingLoanId] = useState(null);

  const toggleExpand = async (loanKey, loan) => {
    if (expandedId === loanKey) {
      setExpandedId(null);
      return;
    }
    setExpandedId(loanKey);

    // Fetch installments only for regular EMI loans if not yet fetched
    if (loan.loan_type === "regular" && !installmentsByLoan[loan.id]) {
      setLoadingLoanId(loan.id);
      try {
        const action = await dispatch(fetchInstallmentsByLoan(loan.id));
        const payload = action.payload;
        const inner = payload?.data ?? payload;
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

  const regularList = useMemo(
    () => (loans || []).map((l) => ({ ...l, loan_type: "regular" })),
    [loans],
  );

  const interestList = useMemo(
    () =>
      (interestLoans || []).map((l) => ({
        ...l,
        loan_type: "interest_only",
      })),
    [interestLoans],
  );

  const displayedLoans = useMemo(() => {
    let list = [];
    if (filterType === "regular") {
      list = regularList;
    } else if (filterType === "interest_only") {
      list = interestList;
    } else {
      list = [...regularList, ...interestList];
    }
    return list.sort(
      (a, b) => new Date(b.created_at || b.start_date || 0) - new Date(a.created_at || a.start_date || 0),
    );
  }, [regularList, interestList, filterType]);

  const totalAllCount = regularList.length + interestList.length;

  if (loading && totalAllCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2 rounded-2xl border border-base-300 bg-base-100">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loans…</p>
      </div>
    );
  }

  if (!loading && totalAllCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-6">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-base-300 text-base-content/40">
          <HandCoins size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content">No loans issued yet</p>
          <p className="text-xs text-base-content/50 mt-1 max-w-sm">
            This customer has no active or past loans. You can issue a new standard EMI loan or an interest-only loan.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          {onOpenCreateLoan && (
            <button
              onClick={onOpenCreateLoan}
              className="btn btn-outline btn-sm rounded-xl gap-1.5 shadow-xs"
            >
              <HandCoins size={14} />
              <span>Create EMI Loan</span>
            </button>
          )}
          {onOpenCreateInterestLoan && (
            <button
              onClick={onOpenCreateInterestLoan}
              className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm"
            >
              <Percent size={14} />
              <span>Create Interest Loan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter and Action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-base-100 p-3 rounded-2xl border border-base-300 shadow-xs">
        <div className="join bg-base-200/80 p-0.5 sm:p-1 rounded-xl border border-base-300/80">
          {[
            { key: "all", label: `All Loans (${totalAllCount})` },
            { key: "regular", label: `EMI Loans (${regularList.length})` },
            { key: "interest_only", label: `Interest-Only (${interestList.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`join-item btn btn-xs sm:btn-sm rounded-lg border-none px-3 font-medium transition-all ${
                filterType === tab.key
                  ? "btn-primary shadow-xs font-semibold"
                  : "btn-ghost text-base-content/70 hover:text-base-content"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenCreateLoan && (
            <button
              onClick={onOpenCreateLoan}
              className="btn btn-outline btn-sm rounded-xl gap-1.5 shadow-xs border-base-300 hover:border-primary"
            >
              <HandCoins size={14} />
              <span>New EMI Loan</span>
            </button>
          )}

          {onOpenCreateInterestLoan && (
            <button
              onClick={onOpenCreateInterestLoan}
              className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm"
            >
              <Percent size={14} />
              <span>New Interest Loan</span>
            </button>
          )}
        </div>
      </div>

      {displayedLoans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-6">
          <p className="text-sm font-medium text-base-content/70">
            No {filterType === "interest_only" ? "interest-only" : "regular EMI"} loans found
          </p>
          <p className="text-xs text-base-content/40">
            Try switching the filter above or create a new loan.
          </p>
          {filterType === "regular" && onOpenCreateLoan && (
            <button
              onClick={onOpenCreateLoan}
              className="btn btn-outline btn-sm rounded-xl gap-1.5 mt-2"
            >
              <HandCoins size={14} />
              <span>Issue EMI Loan</span>
            </button>
          )}
          {filterType === "interest_only" && onOpenCreateInterestLoan && (
            <button
              onClick={onOpenCreateInterestLoan}
              className="btn btn-outline btn-sm rounded-xl gap-1.5 mt-2"
            >
              <Percent size={14} />
              <span>Issue Interest Loan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLoans.map((loan) => {
            const isInterest = loan.loan_type === "interest_only";
            const loanKey = `${loan.loan_type}-${loan.id}`;
            const isExpanded = expandedId === loanKey;

            if (isInterest) {
              return (
                <div
                  key={loanKey}
                  className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-xs hover:border-primary/30 transition-all"
                >
                  {/* Loan summary row */}
                  <div
                    onClick={() => toggleExpand(loanKey, loan)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-base-200/40 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0 border border-info/20">
                      <Percent size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate text-base-content">
                          {loan.loan_no || `Interest Loan #${loan.id}`}
                        </p>
                        <span className="badge badge-sm badge-info badge-outline font-medium">
                          Interest-Only
                        </span>
                        <span
                          className={`badge gap-1 font-medium badge-sm ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-base-content/50 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{loan.plan_name || "Interest Plan"}</span>
                        <span>·</span>
                        <span className="capitalize">{loan.interest_frequency || "Monthly"} @ {loan.interest_rate ?? loan.interest_value}%</span>
                        {loan.start_date && (
                          <>
                            <span>·</span>
                            <span>Started {new Date(loan.start_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <span className="text-sm font-bold text-base-content">
                        {formatCurrency(loan.principal_amount)}
                      </span>
                      <span className="text-[11px] text-base-content/60 font-medium">
                        Interest: {formatCurrency(loan.interest_amount_per_period || loan.monthly_interest)} / {loan.interest_frequency || "mo"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/interest-only-loans/${loan.id}`);
                      }}
                      className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/60 hover:text-primary"
                      title="Open full interest loan page"
                    >
                      <ExternalLink size={14} />
                    </button>

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-base-content/40 shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-base-content/40 shrink-0" />
                    )}
                  </div>

                  {/* Expanded: Interest Loan Details Card */}
                  {isExpanded && (
                    <div className="border-t border-base-200 bg-base-200/20 p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                        <div className="bg-base-100 p-3 rounded-xl border border-base-200">
                          <span className="text-base-content/50 block text-[11px]">Principal Amount</span>
                          <span className="font-bold text-sm text-base-content mt-0.5 block">
                            {formatCurrency(loan.principal_amount)}
                          </span>
                        </div>
                        <div className="bg-base-100 p-3 rounded-xl border border-base-200">
                          <span className="text-base-content/50 block text-[11px]">Interest Rate</span>
                          <span className="font-bold text-sm text-base-content mt-0.5 block capitalize">
                            {loan.interest_rate ?? loan.interest_value}% ({loan.interest_frequency || "Monthly"})
                          </span>
                        </div>
                        <div className="bg-base-100 p-3 rounded-xl border border-base-200">
                          <span className="text-base-content/50 block text-[11px]">Total Interest Paid</span>
                          <span className="font-bold text-sm text-success mt-0.5 block">
                            {formatCurrency(loan.total_interest_paid || 0)}
                          </span>
                        </div>
                        <div className="bg-base-100 p-3 rounded-xl border border-base-200">
                          <span className="text-base-content/50 block text-[11px]">Outstanding Principal</span>
                          <span className="font-bold text-sm text-base-content mt-0.5 block">
                            {formatCurrency(loan.outstanding_principal || loan.principal_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-base-200/60">
                        <div className="text-xs text-base-content/60">
                          {loan.end_date && <span>Maturity: {new Date(loan.end_date).toLocaleDateString()}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/interest-only-loans/${loan.id}`)}
                          className="btn btn-sm btn-outline rounded-xl gap-1.5 text-xs font-semibold"
                        >
                          <ExternalLink size={13} />
                          <span>View Full Loan & Collections</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Standard EMI Loan
            const installments = installmentsByLoan[loan.id] || [];
            const isLoadingInstallments = loadingLoanId === loan.id;
            const paidCount = installments.filter((i) => i.status === "paid").length;

            return (
              <div
                key={loanKey}
                className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-xs hover:border-primary/30 transition-all"
              >
                {/* Loan summary row */}
                <div
                  onClick={() => toggleExpand(loanKey, loan)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-base-200/40 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                    <HandCoins size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate text-base-content">
                        {loan.loan_no || `Loan #${loan.id}`}
                      </p>
                      <span className="badge badge-sm badge-ghost font-medium">
                        EMI
                      </span>
                      <span
                        className={`badge gap-1 font-medium badge-sm ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/50 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{loan.plan_name || `Plan #${loan.loan_plan_id}`}</span>
                      <span>·</span>
                      <span>Started {loan.start_date ? new Date(loan.start_date).toLocaleDateString() : "—"}</span>
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-base-content">
                      {formatCurrency(loan.loan_amount)}
                    </span>
                    <span className="text-[11px] text-base-content/60 font-medium">
                      Installment {formatCurrency(loan.installment_amount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/loans/${loan.id}`);
                    }}
                    className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/60 hover:text-primary"
                    title="Open full loan view"
                  >
                    <ExternalLink size={14} />
                  </button>

                  {isExpanded ? (
                    <ChevronUp size={18} className="text-base-content/40 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-base-content/40 shrink-0" />
                  )}
                </div>

                {/* Expanded: installment history */}
                {isExpanded && (
                  <div className="border-t border-base-200 bg-base-200/20">
                    <div className="flex items-center justify-between px-5 py-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
                        <Receipt size={13} /> Installment History
                      </h4>
                      {installments.length > 0 && (
                        <span className="text-[11px] text-base-content/50 font-medium">
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
                              <tr key={inst.id} className="border-t border-base-200">
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
      )}
    </div>
  );
}
