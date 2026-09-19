import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  HandCoins,
  Receipt,
  Landmark,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Printer,
  ChevronDown,
  FileText,
  Calendar,
  Coins,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import {
  fetchCustomerLoanById,
  clearSelectedCustomerLoan,
  editCustomerLoan,
  clearCustomerLoanError,
} from "../../../redux/customerLoans/customerLoanSlice.js";
import {
  fetchInstallmentsByLoan,
  clearInstallmentError,
} from "../../../redux/installments/installmentSlice.js";
import { applyPenalty } from "../../../redux/installments/installment.service.js";
import {
  recordInstallmentPayment,
  payLoanLumpSum,
  fetchPaymentsByLoan,
  revertLoanPayment,
  clearPaymentError,
} from "../../../redux/loanPayments/loanPaymentSlice.js";
import { fetchLoanPlanAndPenalityById } from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import { fetchLoanPlanAndPenalities } from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import InstallmentTable from "../components/InstallmentTable.jsx";
import InstallmentPaymentModal from "../components/InstallmentPaymentModal.jsx";
import LoanPaymentHistoryTable from "../components/LoanPaymentHistoryTable.jsx";
import PaymentReceiptModal from "../components/PaymentReceiptModal.jsx";
import LoanLumpSumPaymentModal from "../components/LoanLumpSumPaymentModal.jsx";
import RevertPaymentModal from "../components/RevertPaymentModal.jsx";
import CustomerLoanFormModal from "../components/CustomerLoanFormModal.jsx";
import { formatCurrency } from "../utils/loanCalculations.js";
import { printLoanStatement, printOfficialPaymentReceipt } from "../utils/printLoanStatement.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
};

export default function LoanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.LOAN_APPLICATION_VIEW) || can(PERMISSIONS.LOAN_VIEW);
  const canEdit = can(PERMISSIONS.LOAN_APPLICATION_EDIT) || can(PERMISSIONS.LOAN_EDIT);
  const canCollect =
    can(PERMISSIONS.LOAN_COLLECTION_CREATE) ||
    can(PERMISSIONS.LOAN_COLLECTION_VIEW) ||
    can(PERMISSIONS.LOAN_VIEW);

  const {
    customerLoan: loan,
    loading: loanLoading,
    error: loanError,
  } = useSelector((state) => state.customerLoans);
  const {
    installments,
    loading: installmentsLoading,
    error: installmentError,
  } = useSelector((state) => state.installments);
  const {
    loanPayments,
    loanPaymentsLoading,
    error: paymentError,
  } = useSelector((state) => state.loanPayments);
  const { loanPlanAndPenality: plan, loading: planLoading } = useSelector(
    (state) => state.loanPlanAndPenalities,
  );
  const { customers } = useSelector((state) => state.customers);
  const { loanPlanAndPenalities: plans } = useSelector(
    (state) => state.loanPlanAndPenalities,
  );
  const { company } = useSelector((state) => state.companyDetails);

  const [activeTab, setActiveTab] = useState("overview");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Lump sum payment modal state
  const [lumpSumModalOpen, setLumpSumModalOpen] = useState(false);
  const [lumpSumSubmitting, setLumpSumSubmitting] = useState(false);

  // Voucher receipt modal state
  const [receiptModalPaymentId, setReceiptModalPaymentId] = useState(null);

  // Revert payment modal state
  const [revertTarget, setRevertTarget] = useState(null);
  const [revertSubmitting, setRevertSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerLoanById(id));
    dispatch(fetchInstallmentsByLoan(id));
    dispatch(fetchPaymentsByLoan(id));
    dispatch(fetchCustomers());
    dispatch(fetchLoanPlanAndPenalities());
    dispatch(fetchCompanyDetails());
    return () => {
      dispatch(clearSelectedCustomerLoan());
    };
  }, [dispatch, id]);

  // Fetch plan details once we know which plan this loan uses (for the Plan tab)
  useEffect(() => {
    if (loan?.loan_plan_id) {
      dispatch(fetchLoanPlanAndPenalityById(loan.loan_plan_id));
    }
  }, [dispatch, loan?.loan_plan_id]);

  // Find linked customer profile
  const customer = useMemo(() => {
    if (!customers || !loan?.customer_id) return null;
    return customers.find((c) => c.id === loan.customer_id) || null;
  }, [customers, loan?.customer_id]);

  const installmentSummary = useMemo(() => {
    const safeInstallments = Array.isArray(installments) ? installments : [];
    const total = safeInstallments.length;
    const paid = safeInstallments.filter((i) => i.status === "paid").length;
    const overdue = safeInstallments.filter((i) => i.status === "overdue").length;
    const paidAmount = safeInstallments.reduce(
      (sum, i) => sum + (Number(i.paid_amount) || 0),
      0,
    );
    const totalAmount = safeInstallments.reduce(
      (sum, i) => sum + (Number(i.total_due) || Number(i.principal_amount) || 0),
      0,
    );
    return {
      total,
      paid,
      overdue,
      paidAmount,
      totalAmount,
      outstanding: Math.max(0, totalAmount - paidAmount),
    };
  }, [installments]);

  const tabs = useMemo(() => [
    { key: "overview", label: "Overview", icon: HandCoins },
    { key: "installments", label: "Installments", icon: Receipt },
    {
      key: "payments",
      label: "Payment History",
      icon: CreditCard,
      count: loanPayments?.length || 0,
    },
    { key: "plan", label: "Plan Details", icon: Landmark },
  ], [loanPayments?.length]);

  const handleOpenPayment = (installment) => {
    dispatch(clearInstallmentError());
    dispatch(clearPaymentError());
    setPaymentTarget(installment);
  };

  const handleClosePayment = () => {
    setPaymentTarget(null);
    dispatch(clearInstallmentError());
    dispatch(clearPaymentError());
  };

  const handlePaymentSubmit = async (formData) => {
    if (!canCollect) return { success: false, error: "Unauthorized" };
    setPaymentSubmitting(true);
    try {
      // 1. Sync penalty on installment if penalty was customized
      if (
        formData.penalty_amount !== undefined &&
        paymentTarget &&
        Number(formData.penalty_amount) !== Number(paymentTarget.penalty_amount || 0)
      ) {
        try {
          await applyPenalty(paymentTarget.id, {
            penalty_amount: Number(formData.penalty_amount),
          });
        } catch (penErr) {
          console.warn("Could not sync penalty before recording payment:", penErr);
        }
      }

      // 2. Dispatch official recordInstallmentPayment API
      const action = await dispatch(
        recordInstallmentPayment({
          installment_id: paymentTarget.id,
          loan_id: Number(id),
          payment_amount: Number(formData.payment_amount),
          payment_mode: formData.payment_mode || "cash",
          payment_date: formData.payment_date,
          transaction_reference: formData.transaction_reference,
          cheque_number: formData.cheque_number,
          remarks: formData.remarks,
        })
      );

      if (recordInstallmentPayment.fulfilled.match(action)) {
        dispatch(fetchInstallmentsByLoan(id));
        dispatch(fetchCustomerLoanById(id));
        dispatch(fetchPaymentsByLoan(id));
        return { success: true, ...action.payload };
      } else {
        return { success: false, error: action.payload };
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleLumpSumSubmit = async (formData) => {
    if (!canCollect) return { success: false, error: "Unauthorized" };
    setLumpSumSubmitting(true);
    try {
      const action = await dispatch(
        payLoanLumpSum({
          loan_id: Number(id),
          ...formData,
        })
      );
      if (payLoanLumpSum.fulfilled.match(action)) {
        dispatch(fetchInstallmentsByLoan(id));
        dispatch(fetchCustomerLoanById(id));
        dispatch(fetchPaymentsByLoan(id));
        return { success: true, ...action.payload };
      } else {
        return { success: false, error: action.payload };
      }
    } finally {
      setLumpSumSubmitting(false);
    }
  };

  const handleRevertConfirm = async () => {
    if (!revertTarget) return;
    setRevertSubmitting(true);
    try {
      const action = await dispatch(revertLoanPayment(revertTarget.id));
      if (revertLoanPayment.fulfilled.match(action)) {
        setRevertTarget(null);
        dispatch(fetchInstallmentsByLoan(id));
        dispatch(fetchCustomerLoanById(id));
        dispatch(fetchPaymentsByLoan(id));
      }
    } finally {
      setRevertSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!canEdit) return;
    setEditSubmitting(true);
    try {
      const action = await dispatch(
        editCustomerLoan({ id: loan.id, formData })
      );
      if (editCustomerLoan.fulfilled.match(action)) {
        setEditModalOpen(false);
        dispatch(fetchCustomerLoanById(id));
        dispatch(fetchInstallmentsByLoan(id));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // Professional print handler with mode option
  const handlePrint = (mode = "statement") => {
    printLoanStatement({
      loan,
      installments,
      company,
      customer,
      plan,
      mode,
    });
  };

  if (loanLoading && !loan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loan details…</p>
      </div>
    );
  }

  if (!loan) return null;

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value ?? <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Native Print Styling Support ────────────────────────────────────────── */}
      <style>{`
        @media print {
          nav, header, aside, .btn, .tabs, .no-print, #collect-loan-btn, #edit-loan-btn {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <HandCoins size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">
              {loan.loan_no || `Loan #${loan.id}`}
            </h1>
            <p className="text-xs text-base-content/40">
              {formatCurrency(loan.loan_amount)} principal
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
          </span>
        </div>

        {/* Action Buttons: Print, Collect, Edit */}
        <div className="flex items-center gap-2">
          
          {/* ── Professional Print Dropdown ─────────────────────────────────── */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              type="button"
              className="btn btn-sm gap-1.5 border border-base-300 bg-base-100 hover:bg-primary/10 hover:border-primary/50 text-base-content hover:text-primary transition-all shadow-xs font-semibold"
              title="Print Loan Documents"
            >
              <Printer size={15} className="text-primary" />
              <span>Print</span>
              <ChevronDown size={13} className="opacity-60" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-30 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-72 border border-base-300 text-xs mt-1 space-y-1"
            >
              <li className="menu-title px-3 py-1.5 text-[10px] uppercase font-bold text-base-content/40 tracking-wider">
                Select Print Document
              </li>
              <li>
                <button
                  onClick={() => handlePrint("statement")}
                  className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <FileText size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-base-content">Full Statement (All Data)</div>
                    <div className="text-[11px] text-base-content/50">Complete passbook with all installments</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePrint("paid")}
                  className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-base-content">Paid Receipts Only (Paid Data)</div>
                    <div className="text-[11px] text-base-content/50">Only cleared installments & payments</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePrint("pending")}
                  className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <Clock size={16} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-base-content">Outstanding Dues Only (Pending)</div>
                    <div className="text-[11px] text-base-content/50">Unpaid installments & overdue notice</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePrint("summary")}
                  className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <Receipt size={16} className="text-info mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-base-content">Loan Summary Slip (No Table)</div>
                    <div className="text-[11px] text-base-content/50">1-page balance certificate & stats</div>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {canCollect && (
            <button
              id="pay-loan-lump-sum-btn"
              onClick={() => setLumpSumModalOpen(true)}
              className="btn btn-outline btn-success btn-sm gap-1.5"
              disabled={installmentSummary.outstanding <= 0}
              title="Auto-allocate lump sum payment across installments"
            >
              <Coins size={15} />
              <span>Pay Lump Sum</span>
            </button>
          )}

          {canCollect && (
            <button
              id="collect-loan-btn"
              onClick={() => navigate(`/loan-collections/${loan.id}`)}
              className="btn btn-outline btn-primary btn-sm gap-1.5"
            >
              <IndianRupee size={15} />
              Collect
            </button>
          )}

          {canEdit && (
            <button
              id="edit-loan-btn"
              onClick={() => setEditModalOpen(true)}
              className="btn btn-primary btn-sm gap-1.5 shadow-sm"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={HandCoins}
          color="primary"
          label="Net Disbursed"
          value={formatCurrency(loan.net_disbursed_amount)}
        />
        <StatCard
          icon={Receipt}
          color="info"
          label="Installment"
          value={formatCurrency(loan.installment_amount)}
        />
        <StatCard
          icon={CheckCircle2}
          color="success"
          label="Paid"
          value={`${installmentSummary.paid}/${installmentSummary.total}`}
        />
        <StatCard
          icon={AlertTriangle}
          color="error"
          label="Overdue"
          value={installmentSummary.overdue}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-base-300">
        {tabs.map((tab) => {
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
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`badge badge-xs px-1.5 py-0.5 font-bold ${
                    isActive ? "badge-primary text-primary-content" : "badge-ghost"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
                <HandCoins size={13} /> Loan Details
              </h3>
              <button
                onClick={() => handlePrint("summary")}
                className="btn btn-ghost btn-xs text-primary gap-1"
                title="Print loan summary"
              >
                <Printer size={12} />
                <span>Print Slip</span>
              </button>
            </div>
            <div className="divide-y divide-base-200">
              <InfoRow label="Loan Number" value={loan.loan_no} />
              <InfoRow
                label="Loan Amount"
                value={formatCurrency(loan.loan_amount)}
              />
              <InfoRow
                label="Commission"
                value={formatCurrency(loan.commission_amount)}
              />
              <InfoRow
                label="Net Disbursed"
                value={formatCurrency(loan.net_disbursed_amount)}
              />
              <InfoRow
                label="Installment Amount"
                value={formatCurrency(loan.installment_amount)}
              />
              <InfoRow
                label="Total Repayment"
                value={formatCurrency(loan.total_repayment)}
              />
              <InfoRow
                label="Start Date"
                value={
                  loan.start_date
                    ? new Date(loan.start_date).toLocaleDateString()
                    : null
                }
              />
              <InfoRow
                label="End Date"
                value={
                  loan.end_date
                    ? new Date(loan.end_date).toLocaleDateString()
                    : null
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
              <User size={13} /> Customer & Repayment Progress
            </h3>
            <div className="divide-y divide-base-200 mb-4">
              <InfoRow
                label="Customer"
                value={customer?.customer_name || loan.customer_name || `Customer #${loan.customer_id}`}
              />
              <InfoRow
                label="Customer Code"
                value={customer?.customer_no || loan.customer_no || "—"}
              />
              <InfoRow
                label="Contact Mobile"
                value={customer?.mobile || loan.customer_mobile || "—"}
              />
              <InfoRow
                label="Loan Plan"
                value={loan.plan_name || `Plan #${loan.loan_plan_id}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Repayment Progress
                </span>
                <span className="font-bold text-primary">
                  {installmentSummary.totalAmount
                    ? Math.round(
                        (installmentSummary.paidAmount /
                          installmentSummary.totalAmount) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${
                      installmentSummary.totalAmount
                        ? (installmentSummary.paidAmount /
                            installmentSummary.totalAmount) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-base-content/40">
                {formatCurrency(installmentSummary.paidAmount)} collected of{" "}
                {formatCurrency(installmentSummary.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "installments" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="text-xs text-base-content/60 font-medium">
              Installments Timeline: <span className="text-success font-semibold">{installmentSummary.paid}</span> of {installmentSummary.total} cleared
              {installmentSummary.overdue > 0 && (
                <span className="text-error font-semibold ml-1.5">({installmentSummary.overdue} overdue)</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePrint("statement")}
                className="btn btn-ghost btn-xs gap-1 text-base-content/70 hover:text-primary"
                title="Print all installments statement"
              >
                <Printer size={12} />
                <span>Print All</span>
              </button>
              <button
                onClick={() => handlePrint("paid")}
                className="btn btn-xs gap-1 text-success border border-base-300 bg-base-100 hover:border-success hover:bg-success/10 transition-all font-semibold"
                title="Print only cleared paid installments"
                disabled={installmentSummary.paid === 0}
              >
                <CheckCircle2 size={12} />
                <span>Print Paid ({installmentSummary.paid})</span>
              </button>
              <button
                onClick={() => handlePrint("pending")}
                className="btn btn-xs gap-1 text-warning border border-base-300 bg-base-100 hover:border-warning hover:bg-warning/10 transition-all font-semibold"
                title="Print pending and overdue installments"
                disabled={installmentSummary.total - installmentSummary.paid === 0}
              >
                <Clock size={12} />
                <span>Print Dues ({installmentSummary.total - installmentSummary.paid})</span>
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
            <InstallmentTable
              installments={installments}
              loading={installmentsLoading}
              onRecordPayment={handleOpenPayment}
            />
          </div>
        </div>
      )}

      {/* ── Payments History Tab ────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="text-xs text-base-content/60 font-medium">
              Payment Transactions: <span className="text-primary font-bold">{loanPayments.length}</span> record{loanPayments.length !== 1 ? "s" : ""} on ledger
            </div>
            <div className="flex items-center gap-1.5">
              {canCollect && installmentSummary.outstanding > 0 && (
                <button
                  onClick={() => setLumpSumModalOpen(true)}
                  className="btn btn-outline btn-success btn-xs gap-1"
                  title="Pay lump sum across installments"
                >
                  <Coins size={12} />
                  <span>Pay Lump Sum</span>
                </button>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
            <LoanPaymentHistoryTable
              payments={loanPayments}
              loading={loanPaymentsLoading}
              loan={loan}
              customer={customer}
              company={company}
              onPrintReceipt={(payment) => {
                setReceiptModalPaymentId(payment.id);
              }}
              onViewReceipt={(payment) => {
                setReceiptModalPaymentId(payment.id);
              }}
              onRevertPayment={(payment) => {
                setRevertTarget(payment);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "plan" && (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          {planLoading && !plan ? (
            <div className="flex items-center justify-center py-12 text-base-content/40 gap-2">
              <span className="loading loading-spinner loading-sm" />
              <span className="text-sm">Loading plan…</span>
            </div>
          ) : plan ? (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-base-200">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Landmark size={18} />
                </span>
                <div>
                  <p className="font-bold text-sm">{plan.plan_name}</p>
                  <p className="text-[11px] text-base-content/40">
                    {plan.plan_code}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6">
                <div className="divide-y divide-base-200">
                  <InfoRow
                    label="Collection Frequency"
                    value={plan.collection_frequency}
                  />
                  <InfoRow
                    label="Tenure"
                    value={`${plan.tenure} ${plan.tenure_type}`}
                  />
                  <InfoRow
                    label="Commission"
                    value={
                      plan.commission_type === "percentage"
                        ? `${plan.commission_value}%`
                        : formatCurrency(plan.commission_value)
                    }
                  />
                </div>
                <div className="divide-y divide-base-200">
                  <InfoRow label="Grace Days" value={plan.grace_days ?? 0} />
                  <InfoRow
                    label="Penalty"
                    value={
                      plan.penalty_value != null
                        ? plan.penalty_type === "percentage"
                          ? `${plan.penalty_value}%`
                          : formatCurrency(plan.penalty_value)
                        : "Not set"
                    }
                  />
                  <InfoRow
                    label="Max Penalty"
                    value={
                      plan.max_penalty != null
                        ? formatCurrency(plan.max_penalty)
                        : "No cap"
                    }
                  />
                </div>
              </div>
              {plan.description && (
                <div className="mt-4 pt-4 border-t border-base-200">
                  <p className="text-xs text-base-content/40 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-base-content/70 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-base-content/40 text-center py-8">
              Plan details unavailable.
            </p>
          )}
        </div>
      )}

      {/* Payment modal with Receipt & Success UI */}
      <InstallmentPaymentModal
        open={Boolean(paymentTarget)}
        installment={paymentTarget}
        loan={loan}
        customer={customer}
        company={company}
        loading={paymentSubmitting}
        error={paymentTarget ? (paymentError || installmentError) : null}
        onClose={handleClosePayment}
        onSubmit={handlePaymentSubmit}
      />

      {/* Official Voucher Receipt Modal */}
      <PaymentReceiptModal
        open={Boolean(receiptModalPaymentId)}
        paymentId={receiptModalPaymentId}
        onClose={() => setReceiptModalPaymentId(null)}
      />

      {/* Lump Sum Auto-Allocated Payment Modal */}
      <LoanLumpSumPaymentModal
        open={lumpSumModalOpen}
        loan={loan}
        installments={installments}
        loading={lumpSumSubmitting}
        error={paymentError}
        onClose={() => setLumpSumModalOpen(false)}
        onSubmit={handleLumpSumSubmit}
      />

      {/* Revert Payment Modal */}
      <RevertPaymentModal
        open={Boolean(revertTarget)}
        payment={revertTarget}
        loading={revertSubmitting}
        error={paymentError}
        onClose={() => setRevertTarget(null)}
        onConfirm={handleRevertConfirm}
      />

      {/* Inline Edit Loan Modal */}
      {editModalOpen && (
        <CustomerLoanFormModal
          open={editModalOpen}
          initialData={loan}
          customers={customers || []}
          plans={plans || []}
          loading={editSubmitting}
          error={loanError}
          onClose={() => {
            setEditModalOpen(false);
            dispatch(clearCustomerLoanError());
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3.5">
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-xl bg-${color}/10 text-${color} shrink-0`}
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
