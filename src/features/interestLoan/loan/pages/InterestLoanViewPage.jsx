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
  Receipt,
  CreditCard,
} from "lucide-react";
import {
  fetchInterestLoanById,
  clearSelectedInterestLoan,
  removeInterestLoan,
} from "../../../../redux/interestLoan/loan/interestLoanSlice.js";
import {
  fetchPaymentsByLoan,
  reversePaymentThunk,
  clearLoanPayments,
} from "../../../../redux/interestLoan/payment/interestLoanPaymentSlice.js";
import InterestPeriodScheduleTable from "../../period/components/InterestPeriodScheduleTable.jsx";
import InterestLoanFormModal from "../components/InterestLoanFormModal.jsx";
import InterestLoanDeleteModal from "../components/InterestLoanDeleteModal.jsx";
import InterestLoanPaymentsTab from "../components/InterestLoanPaymentsTab.jsx";
import InterestLoanPaymentFormModal from "../../payment/components/InterestLoanPaymentFormModal.jsx";
import InterestLoanPaymentReceiptModal from "../../payment/components/InterestLoanPaymentReceiptModal.jsx";
import InterestLoanPaymentReverseModal from "../../payment/components/InterestLoanPaymentReverseModal.jsx";
import { loanTotalOutstanding } from "../../payment/utils/interestLoanPaymentHelpers.js";
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
  const canCollect = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_PAY,
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.INTEREST_ONLY_LOAN_CREATE,
  ]);
  const canReverse = can([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_DELETE,
    PERMISSIONS.INTEREST_ONLY_LOAN_DELETE,
  ]);

  const { loan, loading, error } = useSelector(
    (state) => state.interestLoans || {},
  );
  const { loanPayments = [], loanPaymentsLoading, reversing } = useSelector(
    (state) => state.interestLoanPayments || {}
  );

  const [activeTab, setActiveTab] = useState("schedule");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Payment modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState(null);
  const [selectedReversePayment, setSelectedReversePayment] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchInterestLoanById(id));
      dispatch(fetchPaymentsByLoan(id));
    }
    return () => {
      dispatch(clearSelectedInterestLoan());
      dispatch(clearLoanPayments());
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

  const refreshLoanAndPayments = () => {
    dispatch(fetchInterestLoanById(id));
    dispatch(fetchPaymentsByLoan(id));
  };

  const openCollect = (period = null) => {
    setSelectedPeriod(period);
    setIsCollectModalOpen(true);
  };

  const closeCollect = () => {
    setIsCollectModalOpen(false);
    setSelectedPeriod(null);
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
  const totalDue = loanTotalOutstanding(loan);
  const historyPayments =
    loanPayments.length > 0
      ? loanPayments
      : loan.payments || loan.payment_history || [];

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
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                {loan.loan_no}
              </h1>
              <span className={statusCfg.badge}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-base-content/50 mt-0.5 font-medium">
              Disbursed on {formatDate(loan.start_date)} • Created by{" "}
              {loan.created_by_name || "Admin"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {canCollect && totalDue > 0 && (
              <button
                onClick={() => openCollect(null)}
                className="btn btn-primary btn-sm gap-1.5 rounded-xl shadow-xs text-xs font-bold"
              >
                <CreditCard size={14} />
                Collect Payment
              </button>
            )}

          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-base-content gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              <Pencil size={14} className="text-base-content/70" />
              <span>Edit Loan</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-1.5 rounded-xl text-xs font-semibold"
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
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <DollarSign size={20} />
          </span>
          <div>
            <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">Disbursed Principal</div>
            <div className="text-2xl font-black tracking-tight leading-tight text-base-content tabular-nums">
              {formatCurrency(loan.principal_amount)}
            </div>
          </div>
        </div>

        {/* Outstanding Principal */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <TrendingUp size={20} />
          </span>
          <div>
            <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">Outstanding Principal</div>
            <div className="text-2xl font-black tracking-tight leading-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCurrency(loan.outstanding_principal)}
            </div>
          </div>
        </div>

        {/* Interest Rate & Frequency */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/10 text-secondary shrink-0">
            <Percent size={20} />
          </span>
          <div>
            <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">Interest Rate</div>
            <div className="text-2xl font-black tracking-tight leading-tight text-base-content flex items-center gap-2 tabular-nums">
              {formatRate(loan.interest_rate, loan.interest_type)}
              <span className={freqCfg.badge}>{freqCfg.label}</span>
            </div>
          </div>
        </div>

        {/* Total Interest Collected */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">Interest Collected</div>
            <div className="text-2xl font-black tracking-tight leading-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(loan.total_interest_paid)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Plan Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Information Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-2 border-b border-base-200 pb-2.5">
            <User size={14} className="text-primary" />
            Customer Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Name</span>
              <span className="font-bold text-base-content text-sm">
                {loan.customer_name ||
                  `${loan.first_name || ""} ${loan.last_name || ""}`.trim()}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Customer No</span>
              <span className="font-bold text-base-content text-sm tracking-wide">
                {loan.customer_no || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Mobile</span>
              <span className="text-base-content font-bold text-sm flex items-center gap-1.5 tabular-nums">
                <Phone size={12} className="opacity-60 text-primary" />
                {loan.customer_mobile || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Remarks</span>
              <span className="text-base-content/80 text-xs leading-relaxed">
                {loan.remarks || "No remarks provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Snapshot Terms Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-2 border-b border-base-200 pb-2.5">
            <Layers size={14} className="text-primary" />
            Plan Terms Snapshot
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Scheme</span>
              <span className="font-bold text-base-content text-sm">
                {loan.plan_name || "Custom Anytime Plan"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Plan Code</span>
              <span className="font-bold text-base-content text-sm tracking-wide">
                {loan.plan_code || "—"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Principal Basis</span>
              <span className="text-base-content capitalize font-bold text-sm">
                {loan.principal_basis?.replace("_", " ") || "Outstanding Principal"}
              </span>
            </div>
            <div>
              <span className="text-base-content/50 block font-medium mb-0.5">Next Due Date</span>
              <span className="text-base-content font-bold text-sm tabular-nums">
                {loan.next_interest_date ? formatDate(loan.next_interest_date) : "Settled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Section: Billing Schedule vs Payments History */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 border-b border-base-300">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${
              activeTab === "schedule"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-base-content/50 hover:text-base-content/80 hover:border-base-content/20"
            }`}
          >
            <Calendar size={14} />
            <span>Billing Schedule</span>
            <span
              className={`badge badge-xs px-1.5 py-0.5 font-bold ${
                activeTab === "schedule"
                  ? "badge-primary text-primary-content"
                  : "badge-ghost"
              }`}
            >
              {loan.periods?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${
              activeTab === "payments"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-base-content/50 hover:text-base-content/80 hover:border-base-content/20"
            }`}
          >
            <Receipt size={14} />
            <span>Payments History</span>
            <span
              className={`badge badge-xs px-1.5 py-0.5 font-bold ${
                activeTab === "payments"
                  ? "badge-primary text-primary-content"
                  : "badge-ghost"
              }`}
            >
              {historyPayments.length}
            </span>
          </button>
        </div>

        {activeTab === "schedule" ? (
          <InterestPeriodScheduleTable
            periods={loan.periods || []}
            loanId={loan.id}
            canCollect={canCollect}
            onPayPeriod={(period) => openCollect(period)}
            onSyncComplete={refreshLoanAndPayments}
          />
        ) : (
          <InterestLoanPaymentsTab
            loan={loan}
            payments={historyPayments}
            loading={loanPaymentsLoading}
            canCollect={canCollect}
            canReverse={canReverse}
            canCollectNow={totalDue > 0}
            onCollect={() => openCollect(null)}
            onViewReceipt={setSelectedReceiptPayment}
            onReverse={setSelectedReversePayment}
          />
        )}
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

      {/* Collect Payment Modal */}
      <InterestLoanPaymentFormModal
        open={isCollectModalOpen}
        preselectedLoan={loan}
        preselectedPeriod={selectedPeriod}
        onClose={closeCollect}
        onSuccess={refreshLoanAndPayments}
      />

      {/* Payment Receipt Modal */}
      <InterestLoanPaymentReceiptModal
        open={Boolean(selectedReceiptPayment)}
        payment={selectedReceiptPayment}
        loan={loan}
        onClose={() => setSelectedReceiptPayment(null)}
      />

      {/* Payment Reverse Modal */}
      <InterestLoanPaymentReverseModal
        open={Boolean(selectedReversePayment)}
        payment={selectedReversePayment}
        loading={reversing}
        onClose={() => setSelectedReversePayment(null)}
        onConfirm={async (paymentId) => {
          const res = await dispatch(reversePaymentThunk(paymentId));
          if (reversePaymentThunk.fulfilled.match(res)) {
            setSelectedReversePayment(null);
            refreshLoanAndPayments();
          }
        }}
      />
    </div>
  );
};

export default InterestLoanViewPage;
