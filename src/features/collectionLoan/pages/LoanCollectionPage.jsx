import React, { useEffect, useState, useMemo, useRef } from "react";
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
  ChevronDown,
  Check,
  X,
  FileText,
  Coins,
  Receipt,
  RotateCcw,
  CheckCircle2,
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
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import {
  fetchPaymentsByLoan,
  recordInstallmentPayment,
  payLoanLumpSum,
  revertPaymentAction,
} from "../../../redux/loanPayments/loanPaymentSlice.js";
import LoanInstallmentTable from "../components/LoanInstallmentTable.jsx";
import PayInstallmentModal from "../components/PayInstallmentModal.jsx";
import ApplyPenaltyModal from "../components/ApplyPenaltyModal.jsx";
import LoanPaymentHistoryTable from "../../customerLoans/components/LoanPaymentHistoryTable.jsx";
import LoanLumpSumPaymentModal from "../../customerLoans/components/LoanLumpSumPaymentModal.jsx";
import RevertPaymentModal from "../../customerLoans/components/RevertPaymentModal.jsx";
import PaymentReceiptModal from "../../customerLoans/components/PaymentReceiptModal.jsx";
import { formatCurrency, formatLoanTenure } from "../utils/collectionHelpers.js";
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
  const {
    loanPayments = [],
    loanPaymentsLoading,
  } = useSelector((state) => state.loanPayments);
  const { company } = useSelector((state) => state.companyDetails);

  const [activeTab, setActiveTab] = useState("installments");
  const [selectedLoanId, setSelectedLoanId] = useState(loanId || "");
  const [loanSearch, setLoanSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Lump sum payment modal state
  const [lumpSumModalOpen, setLumpSumModalOpen] = useState(false);
  const [lumpSumSubmitting, setLumpSumSubmitting] = useState(false);

  // Payment reversal & receipt voucher modal state
  const [revertTarget, setRevertTarget] = useState(null);
  const [revertSubmitting, setRevertSubmitting] = useState(false);
  const [receiptModalPaymentId, setReceiptModalPaymentId] = useState(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const [payTarget, setPayTarget] = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [penaltyTarget, setPenaltyTarget] = useState(null);
  const [penaltyPreviewLoading, setPenaltyPreviewLoading] = useState(false);
  const [penaltySubmitting, setPenaltySubmitting] = useState(false);

  // Load customer loans and company details on mount
  useEffect(() => {
    dispatch(fetchCustomerLoans());
    dispatch(fetchCompanyDetails());
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

  // Find active selected loan object
  const selectedLoan = useMemo(() => {
    if (!selectedLoanId || !loans?.length) return null;
    return loans.find((l) => String(l.id) === String(selectedLoanId)) || null;
  }, [loans, selectedLoanId]);

  // Fetch loan installments, summary & payments when selectedLoanId changes
  useEffect(() => {
    if (!selectedLoanId || isNaN(Number(selectedLoanId))) return;

    dispatch(fetchInstallmentsByLoan(selectedLoanId));
    dispatch(fetchCurrentDue(selectedLoanId));
    dispatch(fetchLoanSummary(selectedLoanId));
    dispatch(fetchPaymentsByLoan(selectedLoanId));
  }, [dispatch, selectedLoanId]);

  const refetch = () => {
    if (!selectedLoanId || isNaN(Number(selectedLoanId))) return;
    dispatch(fetchInstallmentsByLoan(selectedLoanId));
    dispatch(fetchCurrentDue(selectedLoanId));
    dispatch(fetchLoanSummary(selectedLoanId));
    dispatch(fetchPaymentsByLoan(selectedLoanId));
    dispatch(fetchCustomerLoans());
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

      // Record official payment via /api/loan-payments
      const paymentPayload = {
        loan_id: selectedLoanId || payTarget?.loan_id,
        installment_id: id,
        payment_amount: Number(formData.payment_amount || formData.paid_amount),
        payment_date: formData.paid_date,
        payment_mode: formData.payment_mode || "cash",
        transaction_reference: formData.transaction_reference || undefined,
        remarks: formData.remarks || undefined,
      };

      const resultAction = await dispatch(recordInstallmentPayment(paymentPayload));
      if (recordInstallmentPayment.fulfilled.match(resultAction)) {
        refetch();
        return { success: true, data: resultAction.payload?.data || resultAction.payload };
      } else {
        const action = await dispatch(payInstallmentAction({ id, formData }));
        refetch();
        return { success: true, data: action.payload };
      }
    } catch (err) {
      return { success: false, error: err?.message || "Failed to record payment" };
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleLumpSumSubmit = async (payload) => {
    setLumpSumSubmitting(true);
    try {
      const res = await dispatch(payLoanLumpSum(payload)).unwrap();
      refetch();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setLumpSumSubmitting(false);
    }
  };

  const handleConfirmRevert = async ({ id, reason }) => {
    setRevertSubmitting(true);
    try {
      await dispatch(revertPaymentAction({ id, reason })).unwrap();
      setRevertTarget(null);
      refetch();
    } catch (err) {
      console.error("Payment reversal failed:", err);
    } finally {
      setRevertSubmitting(false);
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
    const q = loanSearch.toLowerCase().trim();
    return loans.filter(
      (l) =>
        l.loan_no?.toLowerCase().includes(q) ||
        l.customer_name?.toLowerCase().includes(q) ||
        l.customer_mobile?.toLowerCase().includes(q) ||
        l.mobile?.toLowerCase().includes(q) ||
        String(l.id).includes(q) ||
        String(l.loan_amount || "").includes(q) ||
        l.status?.toLowerCase().includes(q),
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
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <IndianRupee size={22} className="text-primary" />
            Loan Collection
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            {currentLoan?.loan_no ? `${currentLoan.loan_no} — ` : ""}
            {currentLoan?.customer_name || "Manage repayments & collections"}
          </p>
        </div>

        {/* Professional Searchable Loan Selector */}
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            disabled={loansLoading && loans.length === 0}
            className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border bg-base-100 text-left transition-all shadow-xs min-w-[260px] sm:min-w-[340px] max-w-[420px] ${
              dropdownOpen
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : "border-base-300 hover:border-base-content/30"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0">
                <FileText size={15} />
              </span>
              <div className="min-w-0">
                {currentLoan ? (
                  <div className="flex items-center gap-1.5 text-xs truncate">
                    <span className="font-semibold text-base-content shrink-0">
                      {currentLoan.loan_no || `#${currentLoan.id}`}
                    </span>
                    <span className="text-base-content/40">·</span>
                    <span className="text-base-content/80 truncate">
                      {currentLoan.customer_name || `Customer #${currentLoan.customer_id}`}
                    </span>
                    {currentLoan.loan_amount && (
                      <span className="text-[11px] font-medium text-primary shrink-0 hidden sm:inline">
                        (₹{Number(currentLoan.loan_amount).toLocaleString("en-IN")})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-base-content/50">
                    {loansLoading ? "Loading loans…" : "Select loan…"}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={15}
              className={`text-base-content/50 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {selectedLoanId && (
            <button
              onClick={() => navigate(`/loans/${selectedLoanId}`)}
              className="btn btn-ghost btn-sm btn-square rounded-xl border border-base-300"
              title="View full loan details"
            >
              <ExternalLink size={15} />
            </button>
          )}

          {/* Search & Select Popover */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-[420px] max-w-[460px] bg-base-100 border border-base-300 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-fade-in">
              {/* Search Header */}
              <div className="p-3 border-b border-base-200 bg-base-200/40">
                <div className="relative flex items-center">
                  <Search
                    size={14}
                    className="absolute left-3 text-base-content/40 pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                    placeholder="Search by loan #, customer, mobile, amount…"
                    className="input input-sm input-bordered w-full pl-9 pr-8 text-xs rounded-xl bg-base-100 focus:border-primary"
                  />
                  {loanSearch && (
                    <button
                      type="button"
                      onClick={() => setLoanSearch("")}
                      className="absolute right-2.5 text-base-content/40 hover:text-base-content"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between px-1 pt-2 text-[11px] text-base-content/50 font-medium">
                  <span>
                    {filteredLoansForPicker.length} loan{filteredLoansForPicker.length === 1 ? "" : "s"} found
                  </span>
                  {loanSearch && (
                    <button
                      type="button"
                      onClick={() => setLoanSearch("")}
                      className="text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Results List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-base-200/50 p-1.5">
                {filteredLoansForPicker.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <p className="text-xs text-base-content/50">
                      No loans matching "{loanSearch}"
                    </p>
                    {loanSearch && (
                      <button
                        type="button"
                        onClick={() => setLoanSearch("")}
                        className="btn btn-ghost btn-xs text-primary mt-2"
                      >
                        Reset search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredLoansForPicker.map((l) => {
                    const isSelected = String(l.id) === String(selectedLoanId);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          handleSelectLoan(l.id);
                          setDropdownOpen(false);
                          setLoanSearch("");
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? "bg-primary/10 border border-primary/20 text-primary font-medium"
                            : "hover:bg-base-200/70 text-base-content border border-transparent"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-base-content">
                              {l.loan_no || `#${l.id}`}
                            </span>
                            {l.status && (
                              <span
                                className={`badge badge-xs text-[10px] uppercase font-semibold ${
                                  l.status === "active"
                                    ? "badge-success/20 text-success"
                                    : l.status === "overdue" || l.status === "defaulted"
                                    ? "badge-error/20 text-error"
                                    : "badge-ghost"
                                }`}
                              >
                                {l.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-base-content/70 mt-0.5 truncate">
                            <span className="truncate">
                              {l.customer_name || `Customer #${l.customer_id}`}
                            </span>
                            {(l.customer_mobile || l.mobile) && (
                              <span className="text-base-content/40 text-[11px] shrink-0">
                                · {l.customer_mobile || l.mobile}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <div>
                            <div className="text-xs font-bold text-base-content">
                              ₹{Number(l.loan_amount || 0).toLocaleString("en-IN")}
                            </div>
                            {formatLoanTenure(l) && (
                              <div className="text-[10px] text-base-content/40 font-medium">
                                {formatLoanTenure(l)}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content shrink-0">
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
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

      {/* ── Navigation Tabs: Installment Schedule & Payment Ledger ───────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-base-200/80 border border-base-300/70 gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("installments")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "installments"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-100/60"
              }`}
            >
              <Calendar size={13} />
              <span>Installment Schedule</span>
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none ${
                  activeTab === "installments"
                    ? "bg-white/25 text-white"
                    : "bg-base-300 text-base-content/70"
                }`}
              >
                {installments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "payments"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-100/60"
              }`}
            >
              <Receipt size={13} />
              <span>Payment History</span>
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none ${
                  activeTab === "payments"
                    ? "bg-white/25 text-white"
                    : "bg-base-300 text-base-content/70"
                }`}
              >
                {loanPayments.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pay Lump Sum Action */}
          {canCollect && (summary?.total_balance > 0 || currentLoan?.status === "active") && (
            <button
              type="button"
              onClick={() => setLumpSumModalOpen(true)}
              className="btn btn-sm btn-success text-success-content rounded-xl gap-1.5 font-bold shadow-xs hover:shadow-sm"
              title="Pay lump sum across multiple installments"
            >
              <Coins size={14} />
              <span>Pay Lump Sum</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content: Installments Schedule */}
      {activeTab === "installments" && (
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
      )}

      {/* Tab Content: Payment History Ledger */}
      {activeTab === "payments" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="text-xs text-base-content/60 font-medium">
              Payment Transactions: <span className="text-primary font-bold">{loanPayments.length}</span> record{loanPayments.length !== 1 ? "s" : ""} on ledger
            </div>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
            <LoanPaymentHistoryTable
              payments={loanPayments}
              loading={loanPaymentsLoading}
              loan={selectedLoan}
              customer={selectedLoan?.customer || { name: selectedLoan?.customer_name, mobile: selectedLoan?.customer_mobile }}
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

      {/* Pay modal with Receipt & Success UI */}
      <PayInstallmentModal
        open={Boolean(payTarget)}
        installment={payTarget}
        loan={selectedLoan}
        company={company}
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

      {/* Lump Sum Payment Modal */}
      <LoanLumpSumPaymentModal
        open={lumpSumModalOpen}
        loan={selectedLoan}
        installments={installments}
        company={company}
        loading={lumpSumSubmitting}
        onClose={() => setLumpSumModalOpen(false)}
        onSubmit={handleLumpSumSubmit}
      />

      {/* Revert / Void Payment Modal */}
      <RevertPaymentModal
        open={Boolean(revertTarget)}
        payment={revertTarget}
        loading={revertSubmitting}
        onClose={() => setRevertTarget(null)}
        onConfirm={handleConfirmRevert}
      />

      {/* Payment Receipt Voucher Modal */}
      <PaymentReceiptModal
        open={Boolean(receiptModalPaymentId)}
        paymentId={receiptModalPaymentId}
        company={company}
        onClose={() => setReceiptModalPaymentId(null)}
      />
    </div>
  );
}
