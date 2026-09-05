import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Percent,
  Receipt,
  CalendarClock,
  User,
  IndianRupee,
  ShieldAlert,
  Edit3,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  fetchInterestOnlyLoanById,
  editInterestOnlyLoan,
  editInterestOnlyLoanStatus,
  removeInterestOnlyLoan,
  clearSelectedInterestOnlyLoan,
  clearInterestOnlyLoanError,
} from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import { fetchActiveInterestOnlyLoanPlans } from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import { addInterestOnlyPayment } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import {
  fetchLoanSchedules,
  fetchPendingSchedules,
  fetchOverdueSchedules,
} from "../../../redux/interestOnlySchedule/interestOnlyScheduleSlice.js";
import { fetchInterestOnlyPayments } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import {
  STATUS_STYLES,
  FREQUENCY_LABELS,
  formatCurrency,
  formatDate,
} from "../utils/interestOnlyLoanHelpers.js";
import InterestOnlyScheduleTab from "../components/InterestOnlyScheduleTab.jsx";
import InterestOnlyPaymentsTab from "../components/InterestOnlyPaymentsTab.jsx";
import InterestOnlyPaymentModal from "../components/InterestOnlyPaymentModal.jsx";
import InterestOnlyLoanFormModal from "../components/InterestOnlyLoanFormModal.jsx";
import InterestOnlyLoanStatusModal from "../components/InterestOnlyLoanStatusModal.jsx";
import InterestOnlyLoanDeleteModal from "../components/InterestOnlyLoanDeleteModal.jsx";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value ?? <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );
}

const TABS = [
  { key: "overview", label: "Overview", icon: Percent },
  { key: "schedule", label: "Schedule", icon: CalendarClock },
  { key: "payments", label: "Payments", icon: Receipt },
];

export default function InterestOnlyLoanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
    PERMISSIONS.LOAN_VIEW,
  ]);
  const canEdit = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_EDIT,
    PERMISSIONS.LOAN_EDIT,
  ]);
  const canPay = can([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.LOAN_COLLECTION_CREATE,
  ]);
  const canDelete = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_DELETE,
    PERMISSIONS.LOAN_DELETE,
  ]);

  const { loan, loading, error } = useSelector(
    (state) => state.interestOnlyLoans || {},
  );
  const company = useSelector((state) => state.companyDetails?.company);
  const { customers = [] } = useSelector((state) => state.customers || {});
  const { activePlans = [] } = useSelector(
    (state) => state.interestLoanPlans || {},
  );

  const [activeTab, setActiveTab] = useState("overview");

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    defaultAmount: null,
    defaultRemarks: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView && id) {
      dispatch(fetchInterestOnlyLoanById(id));
      dispatch(fetchCompanyDetails());
      dispatch(fetchActiveInterestOnlyLoanPlans());
      dispatch(fetchCustomers());
    }
    return () => {
      dispatch(clearSelectedInterestOnlyLoan());
    };
  }, [dispatch, id, canView]);

  const handleRefreshAll = useCallback(() => {
    if (id) {
      dispatch(fetchInterestOnlyLoanById(id));
      dispatch(fetchLoanSchedules(id));
      dispatch(fetchPendingSchedules(id));
      dispatch(fetchOverdueSchedules(id));
      dispatch(fetchInterestOnlyPayments(id));
    }
  }, [dispatch, id]);

  const handleOpenPaymentModal = (config = {}) => {
    if (!canPay) return;
    setPaymentError(null);
    setPaymentModal({
      open: true,
      defaultAmount: config.amount ?? null,
      defaultRemarks: config.remarks ?? "",
      scheduleId: config.schedule_id ?? null,
      scheduleNo: config.schedule_no ?? null,
      scheduleDue: config.schedule_due ?? config.amount ?? null,
    });
  };

  const handleClosePaymentModal = () => {
    setPaymentModal({
      open: false,
      defaultAmount: null,
      defaultRemarks: "",
      scheduleId: null,
      scheduleNo: null,
      scheduleDue: null,
    });
    setPaymentError(null);
  };

  const handlePaymentSubmit = async (formData) => {
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const action = await dispatch(addInterestOnlyPayment(formData));
      if (addInterestOnlyPayment.fulfilled.match(action)) {
        handleRefreshAll();
        return { success: true, data: action.payload?.data || action.payload };
      } else {
        const errMsg = action.payload || "Failed to record payment";
        setPaymentError(errMsg);
        return { success: false, error: errMsg };
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleEditLoanSubmit = async (formData) => {
    setEditSubmitting(true);
    try {
      const action = await dispatch(
        editInterestOnlyLoan({ id: loan.id, data: formData }),
      );
      if (editInterestOnlyLoan.fulfilled.match(action)) {
        setEditModalOpen(false);
        handleRefreshAll();
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleStatusSubmit = async ({ id: targetId, data }) => {
    setStatusSubmitting(true);
    try {
      const action = await dispatch(
        editInterestOnlyLoanStatus({ id: targetId, data }),
      );
      if (editInterestOnlyLoanStatus.fulfilled.match(action)) {
        setStatusModalOpen(false);
        dispatch(fetchInterestOnlyLoanById(id));
      }
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!loan?.id) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeInterestOnlyLoan(loan.id));
      if (removeInterestOnlyLoan.fulfilled.match(action)) {
        setDeleteModalOpen(false);
        navigate("/interest-only-loans");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-sm text-base-content/60 max-w-sm">
          You do not possess the required permission to view customer
          interest-only loans.
        </p>
        <button
          onClick={() => navigate("/interest-only-loans")}
          className="btn btn-ghost btn-sm mt-2"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (loading && !loan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading loan…</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <p className="text-sm text-base-content/60">Loan not found.</p>
        <button
          onClick={() => navigate("/interest-only-loans")}
          className="btn btn-ghost btn-sm"
        >
          Back to list
        </button>
      </div>
    );
  }

  const outstandingInterest = Number(loan.outstanding_interest || 0);
  const outstandingPrincipal = Number(loan.outstanding_principal || 0);
  const outstandingTotal = Number(
    (outstandingInterest + outstandingPrincipal).toFixed(2),
  );
  const paidTotal =
    Number(loan.total_interest_paid || 0) +
    Number(loan.total_principal_paid || 0);
  const progressPct =
    loan.total_payable > 0
      ? Math.round((paidTotal / Number(loan.total_payable)) * 100)
      : 0;

  const isClosed = ["completed", "closed", "cancelled"].includes(loan.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/interest-only-loans")}
            className="btn btn-ghost btn-sm btn-square"
            title="Back to loans"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <Percent size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold font-mono">{loan.loan_no}</h1>
            <p className="text-xs text-base-content/50">
              {loan.customer_name || `Customer #${loan.customer_id}`} ·{" "}
              {formatCurrency(loan.principal_amount)} principal
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${
              STATUS_STYLES[loan.status] || "badge-ghost"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canPay && !isClosed && (
            <button
              onClick={() => handleOpenPaymentModal()}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <Receipt size={15} />
              Record Payment
            </button>
          )}

          {canEdit && !isClosed && (
            <button
              onClick={() => setEditModalOpen(true)}
              className="btn btn-outline btn-sm gap-1.5"
              title="Edit loan terms & recalculate schedule"
            >
              <Pencil size={15} />
              Edit Loan
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="btn btn-outline btn-sm gap-1.5"
            >
              <Edit3 size={15} />
              Status
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
              title="Delete loan"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "An error occurred."}
          </span>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          color="primary"
          label="Net Disbursed"
          value={formatCurrency(loan.net_disbursed_amount)}
        />
        <StatCard
          icon={Percent}
          color="info"
          label="Total Interest"
          value={formatCurrency(loan.total_interest)}
        />
        <StatCard
          icon={Receipt}
          color="success"
          label="Total Paid"
          value={formatCurrency(paidTotal)}
        />
        <StatCard
          icon={CalendarClock}
          color="error"
          label="Total Outstanding"
          value={formatCurrency(outstandingTotal)}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-base-300">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
              <Percent size={13} /> Loan Details
            </h3>
            <div className="divide-y divide-base-200">
              <InfoRow
                label="Principal Amount"
                value={formatCurrency(loan.principal_amount)}
              />
              <InfoRow
                label="Interest Rate"
                value={
                  loan.interest_type === "percentage"
                    ? `${loan.interest_rate}%`
                    : formatCurrency(loan.interest_rate)
                }
              />
              <InfoRow
                label="Interest Frequency"
                value={
                  FREQUENCY_LABELS[loan.interest_frequency] ||
                  loan.interest_frequency
                }
              />
              <InfoRow
                label="Tenure"
                value={`${loan.tenure} ${loan.tenure_type}`}
              />
              <InfoRow
                label="Total Interest"
                value={formatCurrency(loan.total_interest)}
              />
              <InfoRow
                label="Total Payable"
                value={formatCurrency(loan.total_payable)}
              />
              <InfoRow
                label="Commission"
                value={formatCurrency(loan.commission_amount)}
              />
              <InfoRow
                label="Net Disbursed"
                value={formatCurrency(loan.net_disbursed_amount)}
              />
              <InfoRow label="Start Date" value={formatDate(loan.start_date)} />
              <InfoRow label="End Date" value={formatDate(loan.end_date)} />
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
              <User size={13} /> Customer & Repayment
            </h3>
            <div className="divide-y divide-base-200 mb-4">
              <InfoRow
                label="Customer"
                value={loan.customer_name || `Customer #${loan.customer_id}`}
              />
              <InfoRow
                label="Interest Paid"
                value={formatCurrency(loan.total_interest_paid)}
              />
              <InfoRow
                label="Principal Paid"
                value={formatCurrency(loan.total_principal_paid)}
              />
              <InfoRow
                label="Outstanding Interest"
                value={formatCurrency(loan.outstanding_interest)}
              />
              <InfoRow
                label="Outstanding Principal"
                value={formatCurrency(loan.outstanding_principal)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Repayment Progress
                </span>
                <span className="font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-base-content/40">
                {formatCurrency(paidTotal)} collected of{" "}
                {formatCurrency(loan.total_payable)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <InterestOnlyScheduleTab
          loanId={loan.id}
          loan={loan}
          onPayDue={(dueInfo) => handleOpenPaymentModal(dueInfo)}
        />
      )}

      {activeTab === "payments" && (
        <InterestOnlyPaymentsTab
          loanId={loan.id}
          loan={loan}
          company={company}
          onRecordPayment={() => handleOpenPaymentModal()}
          onPaymentReversed={handleRefreshAll}
        />
      )}

      {/* Record Payment Modal */}
      {paymentModal.open && (
        <InterestOnlyPaymentModal
          open={paymentModal.open}
          loan={{
            ...loan,
            schedule_id: paymentModal.scheduleId,
            schedule_no: paymentModal.scheduleNo,
            schedule_due: paymentModal.scheduleDue,
          }}
          initialValues={{
            payment_amount: paymentModal.defaultAmount,
            schedule_id: paymentModal.scheduleId,
            schedule_no: paymentModal.scheduleNo,
            schedule_due: paymentModal.scheduleDue,
            remarks: paymentModal.defaultRemarks,
          }}
          company={company}
          defaultAmount={paymentModal.defaultAmount}
          defaultRemarks={paymentModal.defaultRemarks}
          loading={paymentSubmitting}
          error={paymentError}
          onClose={handleClosePaymentModal}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {/* Edit Loan Modal */}
      {editModalOpen && (
        <InterestOnlyLoanFormModal
          open={editModalOpen}
          initialData={loan}
          customers={Array.isArray(customers) ? customers : []}
          plans={Array.isArray(activePlans) ? activePlans : []}
          loading={editSubmitting}
          error={error}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditLoanSubmit}
        />
      )}

      {/* Status Modal */}
      {statusModalOpen && (
        <InterestOnlyLoanStatusModal
          open={statusModalOpen}
          loan={loan}
          loading={statusSubmitting}
          error={error}
          onClose={() => setStatusModalOpen(false)}
          onSubmit={handleStatusSubmit}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <InterestOnlyLoanDeleteModal
          open={deleteModalOpen}
          loan={loan}
          loading={deleteSubmitting}
          error={error}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3.5">
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
          colorMap[color] || colorMap.primary
        }`}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-base-content/50 truncate">{label}</div>
        <div className="text-base font-bold leading-tight truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
