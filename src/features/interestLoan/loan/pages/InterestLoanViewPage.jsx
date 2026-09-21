import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Phone,
  User,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  fetchInterestLoanById,
  clearSelectedInterestLoan,
  removeInterestLoan,
} from "../../../../redux/interestLoan/loan/interestLoanSlice.js";
import InterestPeriodScheduleTable from "../../period/components/InterestPeriodScheduleTable.jsx";
import InterestLoanFormModal from "../components/InterestLoanFormModal.jsx";
import InterestLoanDeleteModal from "../components/InterestLoanDeleteModal.jsx";
import {
  formatCurrency,
  formatDate,
  formatRate,
  FREQUENCY_CONFIG,
  LOAN_STATUS_CONFIG,
} from "../utils/interestLoanHelpers.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

const InterestLoanViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Permissions ──────────────────────────────────────────────────────────
  const { can } = usePermissions();
  const canEdit = can(PERMISSIONS.INTEREST_ONLY_LOAN_EDIT);
  const canDelete = can(PERMISSIONS.INTEREST_ONLY_LOAN_DELETE);

  const { loan, loading, error } = useSelector(
    (state) => state.interestLoans || {},
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInterestLoanById(id));
    }
    return () => {
      dispatch(clearSelectedInterestLoan());
    };
  }, [id, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!loan) return;
    setDeleteSubmitting(true);
    try {
      await dispatch(removeInterestLoan(loan.id)).unwrap();
      navigate("/interest-loans");
    } catch (err) {
      console.error("Failed to delete loan:", err);
    } finally {
      setDeleteSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading && !loan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm font-medium">Loading loan details…</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="alert alert-error text-sm rounded-2xl shadow-sm">
          <span>{error || "The requested interest loan could not be found."}</span>
        </div>
        <button
          onClick={() => navigate("/interest-loans")}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={14} />
          Back to Interest Loans
        </button>
      </div>
    );
  }

  const statusCfg =
    LOAN_STATUS_CONFIG[loan.status] || LOAN_STATUS_CONFIG.active;
  const freqCfg =
    FREQUENCY_CONFIG[loan.interest_frequency?.toLowerCase()] ||
    FREQUENCY_CONFIG.monthly;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-base-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/interest-loans")}
            className="btn btn-ghost btn-sm btn-square text-base-content/70"
            title="Back to loans"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-base-content font-mono">
                {loan.loan_no}
              </h1>
              <span className={statusCfg.badge}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-base-content/50 mt-0.5">
              Disbursed on {formatDate(loan.start_date)} • Created by{" "}
              {loan.created_by_name || "Admin"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-outline btn-sm gap-1.5 rounded-xl border-base-300 hover:bg-base-200"
            >
              <Pencil size={14} />
              Edit Loan
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-1.5 rounded-xl"
            >
              <Trash2 size={14} />
              Delete Loan
            </button>
          )}
        </div>
      </div>

      {/* Financial KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Principal Disbursed */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <DollarSign size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Disbursed Principal</div>
            <div className="text-xl font-bold leading-tight text-base-content">
              {formatCurrency(loan.principal_amount)}
            </div>
          </div>
        </div>

        {/* Outstanding Principal */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-warning/10 text-warning shrink-0">
            <TrendingUp size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Outstanding Principal</div>
            <div className="text-xl font-bold leading-tight text-warning">
              {formatCurrency(loan.outstanding_principal)}
            </div>
          </div>
        </div>

        {/* Interest Rate & Frequency */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/10 text-secondary shrink-0">
            <Percent size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Interest Rate</div>
            <div className="text-xl font-bold leading-tight text-base-content flex items-center gap-2">
              {formatRate(loan.interest_rate, loan.interest_type)}
              <span className={freqCfg.badge}>{freqCfg.label}</span>
            </div>
          </div>
        </div>

        {/* Total Interest Collected */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Interest Collected</div>
            <div className="text-xl font-bold leading-tight text-success">
              {formatCurrency(loan.total_interest_paid)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Plan Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Information Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-2 border-b border-base-200 pb-2.5">
            <User size={14} className="text-primary" />
            Customer Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-base-content/50 block font-medium">Name</span>
              <span className="font-semibold text-base-content text-sm">
                {loan.customer_name ||
                  `${loan.first_name || ""} ${loan.last_name || ""}`.trim()}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Customer No</span>
              <span className="font-mono text-base-content font-semibold">
                {loan.customer_no || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Mobile</span>
              <span className="text-base-content font-medium flex items-center gap-1">
                <Phone size={11} className="opacity-70" />
                {loan.customer_mobile || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Remarks</span>
              <span className="text-base-content/70 italic">
                {loan.remarks || "No remarks provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Snapshot Terms Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-2 border-b border-base-200 pb-2.5">
            <Layers size={14} className="text-primary" />
            Plan Terms Snapshot
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-base-content/50 block font-medium">Scheme</span>
              <span className="font-semibold text-base-content text-sm">
                {loan.plan_name || "Custom Anytime Plan"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Plan Code</span>
              <span className="font-mono text-base-content font-semibold">
                {loan.plan_code || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Principal Basis</span>
              <span className="text-base-content capitalize font-medium">
                {loan.principal_basis?.replace("_", " ") || "Outstanding Principal"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium">Next Due Date</span>
              <span className="text-base-content font-medium">
                {loan.next_interest_date ? formatDate(loan.next_interest_date) : "Settled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Periodic Billing Schedule Section */}
      <div className="space-y-3">
        <InterestPeriodScheduleTable
          periods={loan.periods || []}
          loanId={loan.id}
          onSyncComplete={() => dispatch(fetchInterestLoanById(id))}
        />
      </div>

      {/* Edit Modal */}
      <InterestLoanFormModal
        isOpen={isEditModalOpen}
        initialData={loan}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => dispatch(fetchInterestLoanById(id))}
      />

      {/* Delete Modal */}
      <InterestLoanDeleteModal
        open={isDeleteModalOpen}
        loan={loan}
        loading={deleteSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default InterestLoanViewPage;
