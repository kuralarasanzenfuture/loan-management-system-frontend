import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IndianRupee,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Landmark,
  Search,
  ExternalLink,
  Wallet,
} from "lucide-react";
import {
  fetchInstallmentsByLoan,
  fetchCurrentDue,
  fetchLoanSummary,
  payInstallmentAction,
  applyPenaltyAction,
  fetchPenalty,
  clearInstallmentError,
  clearPenalty,
} from "../../../redux/installments/installmentSlice.js";
import { fetchCustomerLoans } from "../../../redux/customerLoans/customerLoanSlice.js";
import LoanInstallmentTable from "../components/LoanInstallmentTable.jsx";
import PayInstallmentModal from "../components/PayInstallmentModal.jsx";
import ApplyPenaltyModal from "../components/ApplyPenaltyModal.jsx";
import { formatCurrency } from "../utils/collectionHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

export default function LoanCollectionPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.LOAN_COLLECTION_VIEW) || can(PERMISSIONS.COLLECTION_VIEW);
  const canCollect =
    can(PERMISSIONS.LOAN_COLLECTION_CREATE) ||
    can(PERMISSIONS.COLLECTION_CREATE) ||
    can(PERMISSIONS.LOAN_COLLECTION_VIEW) ||
    canView;
  const canApplyPenalty =
    can(PERMISSIONS.LOAN_COLLECTION_EDIT) ||
    can(PERMISSIONS.LOAN_EDIT) ||
    can(PERMISSIONS.LOAN_APPROVAL_ACTION) ||
    canCollect;

  const {
    installments,
    loanMeta,
    summary,
    currentDue,
    penalty,
    loading: installmentsLoading,
    error,
  } = useSelector((state) => state.installments);

  const { customerLoans: loans = [], loading: loansLoading } = useSelector(
    (state) => state.customerLoans,
  );

  const [selectedLoanId, setSelectedLoanId] = useState(loanId || "");
  const [loanSearch, setLoanSearch] = useState("");

  const [payTarget, setPayTarget] = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [penaltyTarget, setPenaltyTarget] = useState(null);
  const [penaltyPreviewLoading, setPenaltyPreviewLoading] = useState(false);
  const [penaltySubmitting, setPenaltySubmitting] = useState(false);

  // Load customer loans on mount for the loan picker
  useEffect(() => {
    dispatch(fetchCustomerLoans());
  }, [dispatch]);

  // Sync selectedLoanId when URL param changes
  useEffect(() => {
    if (loanId) {
      setSelectedLoanId(loanId);
    }
  }, [loanId]);

  // Auto-select first loan if no loanId is provided in URL and loans are loaded
  useEffect(() => {
    if (!selectedLoanId && loans.length > 0) {
      const activeLoan = loans.find((l) => l.status === "active") || loans[0];
      if (activeLoan?.id) {
        setSelectedLoanId(String(activeLoan.id));
      }
    }
  }, [loans, selectedLoanId]);

  // Fetch loan installments & due when selectedLoanId changes
  useEffect(() => {
    if (!selectedLoanId || isNaN(Number(selectedLoanId))) return;

    dispatch(fetchInstallmentsByLoan(selectedLoanId));
    dispatch(fetchCurrentDue(selectedLoanId));
    dispatch(fetchLoanSummary(selectedLoanId));
  }, [dispatch, selectedLoanId]);

  const refetch = () => {
    if (!selectedLoanId || isNaN(Number(selectedLoanId))) return;
    dispatch(fetchInstallmentsByLoan(selectedLoanId));
    dispatch(fetchCurrentDue(selectedLoanId));
    dispatch(fetchLoanSummary(selectedLoanId));
  };

  const handleSelectLoan = (newId) => {
    if (!newId) return;
    setSelectedLoanId(newId);
    navigate(`/loan-collections/${newId}`, { replace: true });
  };

  const handlePaySubmit = async ({ id, formData, penaltyAmount }) => {
    setPaySubmitting(true);
    try {
      if (penaltyAmount && Number(penaltyAmount) > 0) {
        try {
          await dispatch(
            applyPenaltyAction({
              id,
              formData: { penalty_amount: Number(penaltyAmount) },
            }),
          );
        } catch (penErr) {
          console.warn("Penalty application notice:", penErr);
        }
      }

      const action = await dispatch(payInstallmentAction({ id, formData }));
      if (payInstallmentAction.fulfilled.match(action)) {
        setPayTarget(null);
        refetch();
      }
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleOpenPenalty = (installment) => {
    dispatch(clearInstallmentError());
    dispatch(clearPenalty());
    setPenaltyTarget(installment);
  };

  const handleCalculatePenalty = async (id) => {
    setPenaltyPreviewLoading(true);
    try {
      await dispatch(fetchPenalty(id));
    } finally {
      setPenaltyPreviewLoading(false);
    }
  };

  const handlePenaltySubmit = async ({ id, formData }) => {
    setPenaltySubmitting(true);
    try {
      const action = await dispatch(applyPenaltyAction({ id, formData }));
      if (applyPenaltyAction.fulfilled.match(action)) {
        setPenaltyTarget(null);
        refetch();
      }
    } finally {
      setPenaltySubmitting(false);
    }
  };

  const filteredLoansForPicker = useMemo(() => {
    if (!loanSearch.trim()) return loans;
    const q = loanSearch.toLowerCase();
    return loans.filter(
      (l) =>
        l.loan_no?.toLowerCase().includes(q) ||
        l.customer_name?.toLowerCase().includes(q) ||
        String(l.id).includes(q),
    );
  }, [loans, loanSearch]);

  const currentLoan = useMemo(() => {
    return loans.find((l) => String(l.id) === String(selectedLoanId)) || loanMeta;
  }, [loans, selectedLoanId, loanMeta]);

  return (
    <div className="space-y-6">
      {/* Header & Loan Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IndianRupee size={22} className="text-primary" />
            Loan Collection
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            {currentLoan?.loan_no ? `${currentLoan.loan_no} — ` : ""}
            {currentLoan?.customer_name || "Manage repayments & collections"}
          </p>
        </div>

        {/* Loan Picker Dropdown / Switcher */}
        <div className="flex items-center gap-2">
          <div className="form-control min-w-[240px]">
            <select
              value={selectedLoanId}
              onChange={(e) => handleSelectLoan(e.target.value)}
              className="select select-bordered select-sm rounded-xl w-full"
              disabled={loansLoading && loans.length === 0}
            >
              {loans.length === 0 ? (
                <option value="">No loans available</option>
              ) : (
                loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.loan_no || `#${l.id}`} - {l.customer_name || `Customer #${l.customer_id}`} (₹{Number(l.loan_amount || 0).toLocaleString("en-IN")})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedLoanId && (
            <button
              onClick={() => navigate(`/loans/${selectedLoanId}`)}
              className="btn btn-ghost btn-sm btn-square rounded-xl"
              title="View full loan details"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50 flex items-center gap-1">
            <Calendar size={12} className="text-primary" /> Today's Due / Next EMI
          </div>
          <div className="text-lg font-semibold leading-tight text-primary mt-1">
            {currentDue ? formatCurrency(currentDue.balance_amount || currentDue.total_due) : "₹0.00"}
          </div>
          {currentDue?.due_date && (
            <div className="text-[11px] text-base-content/40 mt-1">
              Due on {new Date(currentDue.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50 flex items-center gap-1">
            <AlertTriangle size={12} className="text-error" /> Overdue Amount
          </div>
          <div className="text-lg font-semibold leading-tight text-error mt-1">
            {formatCurrency(summary?.overdue_amount || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {summary?.overdue_count ? `${summary.overdue_count} overdue installment(s)` : "No overdue"}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50 flex items-center gap-1">
            <TrendingUp size={12} className="text-success" /> Total Collected
          </div>
          <div className="text-lg font-semibold leading-tight text-success mt-1">
            {formatCurrency(summary?.total_paid || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {summary?.paid_count || 0} of {summary?.installment_count || installments.length || 0} paid
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50 flex items-center gap-1">
            <Wallet size={12} /> Outstanding Balance
          </div>
          <div className="text-lg font-semibold leading-tight text-base-content mt-1">
            {formatCurrency(summary?.total_balance || (currentLoan ? Number(currentLoan.total_repayment || currentLoan.loan_amount || 0) : 0))}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            Total Due: {formatCurrency(summary?.total_due || 0)}
          </div>
        </div>
      </div>

      {/* Installments table */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
        <LoanInstallmentTable
          installments={installments}
          loading={installmentsLoading}
          canCollect={canCollect}
          canApplyPenalty={canApplyPenalty}
          onPay={(inst) => {
            if (!canCollect) return;
            dispatch(clearInstallmentError());
            setPayTarget(inst);
          }}
          onApplyPenalty={(inst) => {
            if (!canApplyPenalty) return;
            handleOpenPenalty(inst);
          }}
        />
      </div>

      {/* Pay modal */}
      <PayInstallmentModal
        open={Boolean(payTarget)}
        installment={payTarget}
        loading={paySubmitting}
        error={payTarget ? error : null}
        onClose={() => setPayTarget(null)}
        onSubmit={handlePaySubmit}
      />

      {/* Penalty modal */}
      <ApplyPenaltyModal
        open={Boolean(penaltyTarget)}
        installment={penaltyTarget}
        penaltyPreview={penalty}
        previewLoading={penaltyPreviewLoading}
        loading={penaltySubmitting}
        error={penaltyTarget ? error : null}
        onOpenCalculate={handleCalculatePenalty}
        onClose={() => setPenaltyTarget(null)}
        onSubmit={handlePenaltySubmit}
      />
    </div>
  );
}
