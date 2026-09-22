import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  CreditCard,
  Search,
  Check,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Split,
  Percent,
  TrendingDown,
  ArrowDownRight,
  Info,
  Printer,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
import {
  previewAllocation,
  createPayment,
  clearPreview,
} from "../../../../redux/interestLoan/payment/interestLoanPaymentSlice.js";
import { getAllInterestLoans } from "../../../../redux/interestLoan/loan/interestLoan.service.js";
import { fetchCompanyDetails } from "../../../../redux/companyDetails/companyDetailsSlice.js";
import { printInterestReceipt } from "../../../customerInterest/utils/printInterestReceipt.js";
import {
  sendWhatsAppPaymentReceipt,
  WhatsAppIcon,
} from "../../../customerLoans/utils/whatsappShare.js";
import {
  PAYMENT_MODES,
  PAYMENT_MODE_CONFIG,
  ALLOCATION_STRATEGIES,
  formatCurrency,
  formatDate,
  periodOutstanding,
  loanTotalOutstanding,
} from "../utils/interestLoanPaymentHelpers.js";

export default function InterestLoanPaymentFormModal({
  open,
  preselectedLoan = null,
  preselectedPeriod = null,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const company = useSelector((state) => state.companyDetails?.company);
  const { previewData, previewLoading, previewError, submitting, submitError } =
    useSelector((state) => state.interestLoanPayments || {});

  // Success screen state
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [loanId, setLoanId] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMode, setPaymentMode] = useState("cash");
  const [allocationStrategy, setAllocationStrategy] = useState("auto");
  const [interestAmount, setInterestAmount] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Search loans state (when opened standalone)
  const [loanList, setLoanList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoanList, setShowLoanList] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const loanDropdownRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loanDropdownRef.current &&
        !loanDropdownRef.current.contains(event.target)
      ) {
        setShowLoanList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch active loans with balance for standalone picker
  useEffect(() => {
    if (open && !preselectedLoan) {
      setLoadingLoans(true);
      getAllInterestLoans({ limit: 200, status: "active" })
        .then((res) => {
          const loans = res.data?.loans || res.loans || [];
          // Filter loans that have outstanding balance
          const withBalance = loans.filter(
            (l) =>
              Number(l.outstanding_principal || 0) +
                Number(l.outstanding_interest || 0) >
              0
          );
          setLoanList(withBalance.length > 0 ? withBalance : loans);
        })
        .catch(() => setLoanList([]))
        .finally(() => setLoadingLoans(false));
    }
  }, [open, preselectedLoan]);

  // Reset or initialize on open
  useEffect(() => {
    if (open) {
      if (!company) {
        dispatch(fetchCompanyDetails());
      }
      setSuccessData(null);
      dispatch(clearPreview());
      setFormErrors({});

      if (preselectedLoan) {
        setLoanId(preselectedLoan.id);
        setSelectedLoan(preselectedLoan);
      } else {
        setLoanId("");
        setSelectedLoan(null);
      }

      const periodDue = preselectedPeriod
        ? periodOutstanding(preselectedPeriod)
        : 0;

      setPaymentAmount(periodDue > 0 ? String(periodDue) : "");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMode("cash");
      setAllocationStrategy(preselectedPeriod ? "interest_only" : "auto");
      setInterestAmount(periodDue > 0 ? String(periodDue) : "");
      setPrincipalAmount("");
      setTransactionRef("");
      setChequeNumber("");
      setRemarks(
        preselectedPeriod
          ? `Interest for billing cycle ${preselectedPeriod.period_no || ""}`.trim()
          : ""
      );
      setSearchQuery("");
      setShowLoanList(false);
    } else {
      setSuccessData(null);
    }
  }, [open, preselectedLoan, preselectedPeriod, company, dispatch]);

  // Trigger allocation preview automatically when amount or strategy changes
  useEffect(() => {
    const loanValue = Number(loanId);
    const amt = parseFloat(paymentAmount);

    if (!loanId || !Number.isFinite(loanValue) || loanValue <= 0 || !Number.isFinite(amt) || amt <= 0) {
      dispatch(clearPreview());
      return;
    }

    const timer = setTimeout(() => {
      const payload = {
        loan_id: loanValue,
        payment_amount: amt,
        allocation_strategy: allocationStrategy,
      };

      const validPeriodId = Number(preselectedPeriod?.id);
      if (Number.isFinite(validPeriodId) && validPeriodId > 0) {
        payload.period_id = validPeriodId;
        payload.interest_period_id = validPeriodId;
      }

      if (allocationStrategy === "manual") {
        const intAmt = parseFloat(interestAmount) || 0;
        const princAmt = parseFloat(principalAmount) || 0;
        if (Math.abs(intAmt + princAmt - amt) <= 0.01) {
          payload.interest_amount = intAmt;
          payload.principal_amount = princAmt;
          dispatch(previewAllocation(payload));
          return;
        }

        dispatch(clearPreview());
        return;
      }

      dispatch(previewAllocation(payload));
    }, 450);

    return () => clearTimeout(timer);
  }, [loanId, paymentAmount, allocationStrategy, interestAmount, principalAmount, preselectedPeriod, dispatch]);

  if (!open) return null;

  // Filtered loan list for search
  const filteredLoans = loanList.filter((l) => {
    const term = searchQuery.toLowerCase();
    const loanNo = (l.loan_no || "").toLowerCase();
    const custNo = (l.customer_no || "").toLowerCase();
    const custName = (
      l.customer_name ||
      `${l.first_name || ""} ${l.last_name || ""}`
    ).toLowerCase();
    return (
      loanNo.includes(term) || custNo.includes(term) || custName.includes(term)
    );
  });

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setLoanId(loan.id);
    setShowLoanList(false);
    setSearchQuery("");
    setFormErrors((prev) => ({ ...prev, loanId: null }));
  };

  const validate = () => {
    const errors = {};
    if (!loanId) errors.loanId = "Please select an active interest loan";

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      errors.paymentAmount = "Please enter a valid payment amount greater than 0";
    }

    if (selectedLoan) {
      const maxPayable = loanTotalOutstanding(selectedLoan);
      if (maxPayable > 0 && amt > maxPayable + 0.01) {
        errors.paymentAmount = `Amount exceeds total outstanding balance (${formatCurrency(
          maxPayable
        )})`;
      }
    }

    if (preselectedPeriod && allocationStrategy === "interest_only") {
      const due = periodOutstanding(preselectedPeriod);
      if (due > 0 && amt > due + 0.01) {
        errors.paymentAmount = `Amount cannot exceed this billing cycle due (${formatCurrency(
          due
        )}) in interest-only mode`;
      }
    }

    if (allocationStrategy === "manual") {
      const iAmt = parseFloat(interestAmount) || 0;
      const pAmt = parseFloat(principalAmount) || 0;
      if (Math.abs(iAmt + pAmt - amt) > 0.01) {
        errors.manualSplit = "Sum of interest and principal must equal payment amount";
      }
    }

    if (paymentMode === "cheque" && !chequeNumber?.trim()) {
      errors.chequeNumber = "Cheque number is required for cheque payments";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const loanValue = Number(loanId);
    const amountValue = parseFloat(paymentAmount);
    if (!Number.isFinite(loanValue) || loanValue <= 0 || !Number.isFinite(amountValue) || amountValue <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        paymentAmount: "Please enter a valid payment amount and select a loan first.",
      }));
      return;
    }

    const payload = {
      loan_id: loanValue,
      payment_amount: amountValue,
      payment_date: paymentDate,
      payment_mode: paymentMode,
      allocation_strategy: allocationStrategy,
    };

    if (allocationStrategy === "manual") {
      payload.interest_amount = parseFloat(interestAmount) || 0;
      payload.principal_amount = parseFloat(principalAmount) || 0;
    }

    const validPeriodId = Number(preselectedPeriod?.id);
    if (Number.isFinite(validPeriodId) && validPeriodId > 0) {
      payload.period_id = validPeriodId;
      payload.interest_period_id = validPeriodId;
    }

    const trimmedReference = transactionRef?.trim();
    if (trimmedReference) {
      payload.transaction_reference = trimmedReference;
    }

    if (paymentMode === "cheque") {
      const trimmedCheque = chequeNumber?.trim();
      if (trimmedCheque) {
        payload.cheque_number = trimmedCheque;
      }
    }

    const trimmedRemarks = remarks?.trim();
    if (trimmedRemarks) {
      payload.remarks = trimmedRemarks;
    }

    const result = await dispatch(createPayment(payload));
    if (createPayment.fulfilled.match(result)) {
      const data =
        result.payload?.data || result.payload?.payment || result.payload;
      setSuccessData(data);
    }
  };

  const handleDone = () => {
    onSuccess?.(successData);
    onClose();
  };

  const handlePrint = () => {
    if (!successData) return;
    const targetLoan = selectedLoan || preselectedLoan || {};
    printInterestReceipt({
      loan: {
        id: targetLoan.id || successData.loan_id,
        loan_no: targetLoan.loan_no || successData.loan_no,
        interest_rate: targetLoan.interest_rate,
        interest_frequency: targetLoan.interest_frequency,
        customer_name:
          targetLoan.customer_name ||
          successData.customer_name ||
          `${targetLoan.first_name || ""} ${targetLoan.last_name || ""}`.trim(),
        customer_no: targetLoan.customer_no || successData.customer_no,
        customer_mobile:
          targetLoan.customer_mobile ||
          targetLoan.mobile ||
          successData.customer_mobile,
      },
      payment: successData,
      allocations: successData.allocations || [],
      customer: {
        customer_name:
          targetLoan.customer_name ||
          successData.customer_name ||
          `${targetLoan.first_name || ""} ${targetLoan.last_name || ""}`.trim(),
        customer_no: targetLoan.customer_no || successData.customer_no,
        mobile:
          targetLoan.customer_mobile ||
          targetLoan.mobile ||
          successData.customer_mobile,
      },
      company: company || {},
      remainingOutstanding:
        successData.outstanding_principal_after != null &&
        successData.outstanding_interest_after != null
          ? Number(successData.outstanding_principal_after) +
            Number(successData.outstanding_interest_after)
          : null,
    });
  };

  const handleWhatsApp = () => {
    if (!successData) return;
    const targetLoan = selectedLoan || preselectedLoan || {};
    const remainingBal =
      successData.outstanding_principal_after != null &&
      successData.outstanding_interest_after != null
        ? Number(successData.outstanding_principal_after) +
          Number(successData.outstanding_interest_after)
        : 0;

    sendWhatsAppPaymentReceipt({
      loan: {
        id: targetLoan.id || successData.loan_id,
        loan_no: targetLoan.loan_no || successData.loan_no,
        customer_name:
          targetLoan.customer_name ||
          successData.customer_name ||
          `${targetLoan.first_name || ""} ${targetLoan.last_name || ""}`.trim(),
        customer_mobile:
          targetLoan.customer_mobile ||
          targetLoan.mobile ||
          successData.customer_mobile,
        mobile:
          targetLoan.customer_mobile ||
          targetLoan.mobile ||
          successData.customer_mobile,
      },
      customer: {
        name:
          targetLoan.customer_name ||
          successData.customer_name ||
          `${targetLoan.first_name || ""} ${targetLoan.last_name || ""}`.trim(),
        mobile:
          targetLoan.customer_mobile ||
          targetLoan.mobile ||
          successData.customer_mobile,
      },
      company: company || {},
      payment: successData,
      successData: {
        receiptNo: `RCP-${targetLoan.id || successData.loan_id || ""}-${String(
          successData.payment_no || successData.id
        ).padStart(4, "0")}`,
        amountPaidNow: successData.payment_amount,
        paidDate: successData.payment_date,
        paymentMode: successData.payment_mode,
        transactionReference: successData.transaction_reference,
        remainingBalance: remainingBal,
        status: remainingBal <= 0 ? "settled" : "paid",
      },
    });
  };

  const totalOutstanding = loanTotalOutstanding(selectedLoan);
  const periodDue = preselectedPeriod ? periodOutstanding(preselectedPeriod) : 0;
  const activeLoan = selectedLoan || preselectedLoan || {};

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl p-0 overflow-hidden shadow-2xl rounded-2xl border border-base-300 bg-base-100">
        {/* ================= SUCCESS & INVOICE VIEW ================= */}
        {successData ? (
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes psm-circle-pop {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.08); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes psm-check-draw {
                from { stroke-dashoffset: 40; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes psm-ring-pulse {
                0% { transform: scale(0.9); opacity: 0.5; }
                100% { transform: scale(1.6); opacity: 0; }
              }
              .psm-circle {
                animation: psm-circle-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
              }
              .psm-check {
                stroke-dasharray: 40;
                stroke-dashoffset: 40;
                animation: psm-check-draw 0.4s 0.35s ease-out forwards;
              }
              .psm-ring {
                animation: psm-ring-pulse 1.1s 0.1s ease-out both;
              }
              @keyframes psm-fade-up {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .psm-fade-up {
                animation: psm-fade-up 0.4s 0.4s ease-out both;
              }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/15 text-success">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-base-content">
                    Payment Invoice & Confirmation
                  </h3>
                  <p className="text-xs text-base-content/50">
                    Official ledger receipt generated
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
                onClick={handleDone}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              {/* Animated Checkmark */}
              <div className="relative w-20 h-20 mx-auto my-1 flex items-center justify-center overflow-hidden">
                <span className="psm-ring absolute inset-0 rounded-full bg-success/30" />
                <div className="psm-circle relative w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
                  <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      className="stroke-success"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d="M12 20.5L17 25.5L28 14"
                      className="psm-check stroke-success"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              <div className="psm-fade-up space-y-4">
                <div>
                  <h3 className="font-black text-2xl text-base-content tracking-tight">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Receipt voucher issued for loan{" "}
                    <span className="font-mono font-bold text-primary">
                      {activeLoan.loan_no || successData.loan_no || `Loan #${successData.loan_id}`}
                    </span>{" "}
                    • {activeLoan.customer_name || successData.customer_name || "Valued Borrower"}
                  </p>
                </div>

                {/* Amount Hero Box */}
                <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center shadow-xs">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-success/80 mb-0.5">
                    Amount Received & Settled
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-success tracking-tight">
                    {formatCurrency(successData.payment_amount)}
                  </div>
                  <div className="text-[11px] text-base-content/70 mt-1 capitalize flex items-center justify-center gap-1.5 font-medium flex-wrap">
                    <span>
                      via{" "}
                      <strong className="text-base-content">
                        {PAYMENT_MODE_CONFIG[successData.payment_mode]?.label ||
                          successData.payment_mode}
                      </strong>
                    </span>
                    {successData.transaction_reference && (
                      <span className="font-mono">
                        · Ref: {successData.transaction_reference}
                      </span>
                    )}
                    {successData.cheque_number && (
                      <span className="font-mono">
                        · Chq: {successData.cheque_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="rounded-xl border border-base-300 bg-base-200/40 divide-y divide-base-200 text-left text-xs shadow-xs">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-base-content/50">Receipt Number:</span>
                    <span className="font-mono font-bold text-primary">
                      RCP-{activeLoan.id || successData.loan_id}-{String(successData.payment_no || successData.id).padStart(4, "0")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-base-content/50">Payment Date:</span>
                    <span className="font-medium text-base-content">
                      {formatDate(successData.payment_date)}
                    </span>
                  </div>
                  {preselectedPeriod && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-success/5">
                      <span className="text-base-content/60">Billing Cycle Settled:</span>
                      <span className="badge badge-success badge-sm font-semibold gap-1">
                        <CheckCircle2 size={11} />
                        Cycle #{preselectedPeriod.period_no} Settled
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-base-content/50">Payment Allocation:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Number(successData.interest_amount || 0) > 0 && (
                        <span className="badge badge-sm badge-secondary/15 text-secondary border border-secondary/30 font-semibold">
                          Interest: {formatCurrency(successData.interest_amount)}
                        </span>
                      )}
                      {Number(successData.principal_amount || 0) > 0 && (
                        <span className="badge badge-sm badge-success/15 text-success border border-success/30 font-semibold">
                          Principal: {formatCurrency(successData.principal_amount)}
                        </span>
                      )}
                      {Number(successData.interest_amount || 0) === 0 &&
                        Number(successData.principal_amount || 0) === 0 && (
                          <span className="font-mono font-semibold">
                            {formatCurrency(successData.payment_amount)}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-base-content/50">Remaining Balance:</span>
                    <div className="text-right">
                      <span
                        className={`font-bold font-mono ${
                          Number(successData.outstanding_principal_after || 0) +
                            Number(successData.outstanding_interest_after || 0) >
                          0
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {formatCurrency(
                          Number(successData.outstanding_principal_after || 0) +
                            Number(successData.outstanding_interest_after || 0)
                        )}
                      </span>
                      {Number(successData.outstanding_principal_after || 0) > 0 && (
                        <div className="text-[10px] text-base-content/50">
                          (Prin: {formatCurrency(successData.outstanding_principal_after)} | Int:{" "}
                          {formatCurrency(successData.outstanding_interest_after || 0)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* High Visibility Action Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn btn-sm rounded-xl flex-1 gap-1.5 border border-base-300 bg-base-100 hover:bg-primary/10 hover:border-primary/50 text-base-content hover:text-primary font-bold transition-all shadow-xs"
                    title="Print official receipt voucher"
                  >
                    <Printer size={15} />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="btn btn-sm rounded-xl flex-1 gap-1.5 border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-600 hover:border-emerald-600 text-emerald-700 hover:text-white font-bold transition-all shadow-xs"
                    title="Share invoice receipt via WhatsApp"
                  >
                    <WhatsAppIcon size={15} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDone}
                    className="btn btn-success btn-sm rounded-xl text-success-content flex-1 font-bold shadow-xs"
                  >
                    <Check size={15} />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                  <CreditCard size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-base text-base-content">
                    Collect Loan Payment
                  </h3>
                  <p className="text-xs text-base-content/50">
                    {preselectedPeriod
                      ? `Settle interest for billing cycle #${preselectedPeriod.period_no}`
                      : "Record payment with automatic FIFO interest & principal allocation"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
                onClick={onClose}
                disabled={submitting}
              >
                <X size={16} />
              </button>
            </div>

            {/* Global Submit Error Alert */}
            {submitError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Section 1: Loan Selection / Display */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1">
                  <span>Target Interest Loan</span>
                  <span className="text-error">*</span>
                </label>

                {preselectedLoan ? (
                  // Locked contextual loan display
                  <div className="p-3.5 rounded-xl bg-base-200/60 border border-base-300 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary">
                          {preselectedLoan.loan_no}
                        </span>
                        <span className="text-xs text-base-content/60">•</span>
                        <span className="text-xs font-medium text-base-content">
                          {preselectedLoan.customer_name ||
                            `${preselectedLoan.first_name || ""} ${
                              preselectedLoan.last_name || ""
                            }`.trim()}
                        </span>
                      </div>
                      <p className="text-[11px] text-base-content/50 mt-0.5">
                        Customer #{preselectedLoan.customer_no}
                      </p>
                    </div>
                    <span className="badge badge-sm badge-ghost text-[10px] font-sans">
                      Assigned
                    </span>
                  </div>
                ) : (
                  // Searchable loan dropdown
                  <div className="relative" ref={loanDropdownRef}>
                    <div
                      onClick={() => setShowLoanList(!showLoanList)}
                      className={`flex items-center justify-between w-full h-10 px-3.5 rounded-xl border bg-base-100 text-xs cursor-pointer transition-all ${
                        formErrors.loanId
                          ? "border-error text-error"
                          : "border-base-300 text-base-content hover:border-primary/50"
                      }`}
                    >
                      {selectedLoan ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">
                            {selectedLoan.loan_no}
                          </span>
                          <span className="text-base-content/40">•</span>
                          <span className="font-medium">
                            {selectedLoan.customer_name ||
                              `${selectedLoan.first_name || ""} ${
                                selectedLoan.last_name || ""
                              }`.trim()}
                          </span>
                          <span className="text-base-content/50 text-[11px]">
                            (Bal: {formatCurrency(totalOutstanding)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-base-content/40">
                          Select active loan by customer or loan #...
                        </span>
                      )}
                      <Search size={14} className="text-base-content/40" />
                    </div>

                    {showLoanList && (
                      <div className="absolute z-30 left-0 right-0 top-11 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-xl overflow-hidden text-xs">
                        <div className="p-2 border-b border-base-200">
                          <input
                            type="text"
                            placeholder="Search by loan #, customer name, mobile..."
                            className="input input-bordered input-xs w-full rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {loadingLoans ? (
                            <div className="p-4 text-center text-base-content/50">
                              <Loader2
                                size={16}
                                className="animate-spin inline mr-1.5"
                              />
                              Loading loans...
                            </div>
                          ) : filteredLoans.length === 0 ? (
                            <div className="p-4 text-center text-base-content/50">
                              No active loans with outstanding balance found
                            </div>
                          ) : (
                            filteredLoans.map((loan) => {
                              const bal =
                                parseFloat(loan.outstanding_principal || 0) +
                                parseFloat(loan.outstanding_interest || 0);
                              const isSel = selectedLoan?.id === loan.id;
                              return (
                                <div
                                  key={loan.id}
                                  onClick={() => handleSelectLoan(loan)}
                                  className={`px-3.5 py-2.5 cursor-pointer hover:bg-base-200 flex items-center justify-between ${
                                    isSel ? "bg-primary/10 font-semibold" : ""
                                  }`}
                                >
                                  <div>
                                    <div className="font-mono font-bold text-xs text-primary">
                                      {loan.loan_no}
                                    </div>
                                    <div className="text-[11px] text-base-content/70">
                                      {loan.customer_name ||
                                        `${loan.first_name || ""} ${
                                          loan.last_name || ""
                                        }`.trim()}{" "}
                                      • #{loan.customer_no}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[11px] font-bold text-base-content">
                                      {formatCurrency(bal)}
                                    </div>
                                    <div className="text-[10px] text-base-content/50">
                                      Balance Due
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formErrors.loanId && (
                  <span className="text-error text-[11px] block">
                    {formErrors.loanId}
                  </span>
                )}
              </div>

              {/* ================= DUE PAYMENT HERO BANNER ================= */}
              {preselectedPeriod && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-base-100 to-primary/5 border border-amber-500/30 shadow-xs text-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning badge-sm font-bold gap-1 px-2.5 py-2 rounded-lg text-warning-content">
                        <Calendar size={12} />
                        Billing Cycle #{preselectedPeriod.period_no}
                      </span>
                      <span className="badge badge-outline badge-sm text-[11px] text-base-content/70">
                        Scheduled Due
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentAmount(String(periodDue));
                        setInterestAmount(String(periodDue));
                      }}
                      className="btn btn-xs btn-warning font-bold gap-1 rounded-lg text-warning-content shadow-xs hover:scale-[1.02] transition-transform"
                      title="Prefill full due amount"
                    >
                      <IndianRupee size={11} />
                      Prefill Due ({formatCurrency(periodDue)})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-500/20">
                    <div>
                      <span className="text-[10px] text-base-content/50 uppercase tracking-wider block font-medium">
                        Due Date
                      </span>
                      <span className="font-semibold text-base-content">
                        {formatDate(preselectedPeriod.scheduled_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-base-content/50 uppercase tracking-wider block font-medium">
                        Billing Range
                      </span>
                      <span className="text-base-content/80 text-[11px]">
                        {formatDate(preselectedPeriod.period_start_date)} →{" "}
                        {formatDate(preselectedPeriod.period_end_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-base-content/50 uppercase tracking-wider block font-medium">
                        Opening Principal
                      </span>
                      <span className="font-mono text-base-content font-semibold">
                        {formatCurrency(preselectedPeriod.opening_principal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-base-content/50 uppercase tracking-wider block font-medium">
                        Interest Due
                      </span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {formatCurrency(periodDue)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-base-content/70 flex items-center gap-1.5 bg-base-200/60 p-2 rounded-xl border border-base-300/50">
                    <CheckCircle2 size={13} className="text-success shrink-0" />
                    <span>
                      Recording this payment will automatically allocate{" "}
                      <strong>{formatCurrency(periodDue)}</strong> to settle
                      Billing Cycle #{preselectedPeriod.period_no}.
                    </span>
                  </div>
                </div>
              )}

          {/* Selected Loan Financial Balance Strip */}
          {selectedLoan && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-base-200/50 border border-base-300 text-xs">
              <div>
                <span className="text-base-content/50 block text-[10px] font-medium uppercase tracking-wider">
                  Outstanding Principal
                </span>
                <span className="font-bold text-base-content font-mono">
                  {formatCurrency(selectedLoan.outstanding_principal)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block text-[10px] font-medium uppercase tracking-wider">
                  Outstanding Interest
                </span>
                <span className="font-bold text-secondary font-mono">
                  {formatCurrency(selectedLoan.outstanding_interest)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block text-[10px] font-medium uppercase tracking-wider">
                  Total Payable
                </span>
                <span className="font-bold text-primary font-mono text-sm">
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>
            </div>
          )}

          {/* Section 2: Amount & Allocation Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Amount */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Payment Amount (₹) <span className="text-error">*</span>
                </span>
                {(periodDue > 0 || totalOutstanding > 0) && (
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentAmount(
                        String(periodDue > 0 ? periodDue : totalOutstanding)
                      )
                    }
                    className="label-text-alt text-[11px] text-primary hover:underline font-semibold"
                  >
                    {periodDue > 0 ? "Pay Cycle Due" : "Pay Full Balance"}
                  </button>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 text-xs font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="e.g. 5000"
                  className={`input input-bordered input-sm w-full pl-7 rounded-lg text-xs font-mono font-bold ${
                    formErrors.paymentAmount ? "input-error" : ""
                  }`}
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setFormErrors((prev) => ({ ...prev, paymentAmount: null }));
                  }}
                />
              </div>
              {formErrors.paymentAmount && (
                <span className="text-error text-[11px] mt-1">
                  {formErrors.paymentAmount}
                </span>
              )}
            </div>

            {/* Allocation Strategy */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Allocation Strategy
                </span>
              </label>
              <select
                className="select select-bordered select-sm w-full rounded-lg text-xs"
                value={allocationStrategy}
                onChange={(e) => setAllocationStrategy(e.target.value)}
              >
                {Object.entries(ALLOCATION_STRATEGIES).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-base-content/50 mt-1 leading-tight">
                {ALLOCATION_STRATEGIES[allocationStrategy]?.desc}
              </span>
            </div>
          </div>

          {/* Manual Split Inputs (Only when strategy is 'manual') */}
          {allocationStrategy === "manual" && (
            <div className="p-3.5 rounded-xl bg-secondary/5 border border-secondary/20 space-y-2">
              <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                <Split size={14} /> Specify Manual Allocation Split
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-base-content/70 font-medium block">
                    Interest Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 2000"
                    className="input input-bordered input-xs w-full rounded-lg text-xs font-mono"
                    value={interestAmount}
                    onChange={(e) => setInterestAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-base-content/70 font-medium block">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 3000"
                    className="input input-bordered input-xs w-full rounded-lg text-xs font-mono"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                  />
                </div>
              </div>
              {formErrors.manualSplit && (
                <span className="text-error text-[11px] block">
                  {formErrors.manualSplit}
                </span>
              )}
            </div>
          )}

          {/* Allocation Live Preview Card */}
          {previewLoading ? (
            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300 flex items-center justify-center gap-2 text-xs text-base-content/60">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>Calculating payment allocation breakdown...</span>
            </div>
          ) : previewError ? (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs">
              {previewError}
            </div>
          ) : previewData ? (
            <div className="p-3.5 rounded-xl bg-base-200/60 border border-base-300 space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-base-300 pb-2">
                <span className="font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck size={13} className="text-primary" />
                  Estimated Allocation Breakdown
                </span>
                <span className="badge badge-xs badge-ghost text-[10px]">
                  Real-time Preview
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-base-content/50 block text-[10px]">
                    Interest Settled:
                  </span>
                  <span className="font-bold text-secondary font-mono">
                    {formatCurrency(
                      previewData.allocated_interest ??
                        previewData.allocation?.interest_amount ??
                        0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/50 block text-[10px]">
                    Principal Reduced:
                  </span>
                  <span className="font-bold text-success font-mono">
                    {formatCurrency(
                      previewData.allocated_principal ??
                        previewData.allocation?.principal_amount ??
                        0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/50 block text-[10px]">
                    Remaining Principal:
                  </span>
                  <span className="font-medium font-mono text-base-content">
                    {formatCurrency(
                      previewData.outstanding_principal_after ??
                        previewData.resulting_balances?.outstanding_principal ??
                        previewData.balances_after?.outstanding_principal ??
                        0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/50 block text-[10px]">
                    Remaining Interest:
                  </span>
                  <span className="font-medium font-mono text-base-content">
                    {formatCurrency(
                      previewData.outstanding_interest_after ??
                        previewData.resulting_balances?.outstanding_interest ??
                        previewData.balances_after?.outstanding_interest ??
                        0
                    )}
                  </span>
                </div>
              </div>

              {previewData.period_allocations?.length > 0 && (
                <div className="pt-2 border-t border-base-300 text-[11px] space-y-1">
                  <span className="text-base-content/60 font-semibold block">
                    Targeted Period Allocations:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {previewData.period_allocations.map((pa, idx) => (
                      <span
                        key={idx}
                        className="badge badge-sm badge-ghost text-[10px] font-mono gap-1"
                      >
                        Period #{pa.period_no}: {formatCurrency(pa.allocated_amount)}
                        <span className="opacity-60 capitalize">({pa.projected_period_status})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Section 3: Payment Method & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Mode */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">Payment Mode</span>
              </label>
              <select
                className="select select-bordered select-sm w-full rounded-lg text-xs capitalize"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {PAYMENT_MODE_CONFIG[mode]?.label || mode}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">Payment Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm w-full rounded-lg text-xs"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          {/* Cheque / Reference fields */}
          {(paymentMode === "cheque" ||
            paymentMode === "bank" ||
            paymentMode === "upi") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMode === "cheque" && (
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Cheque Number <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-849201"
                    className={`input input-bordered input-sm w-full rounded-lg text-xs ${
                      formErrors.chequeNumber ? "input-error" : ""
                    }`}
                    value={chequeNumber}
                    onChange={(e) => {
                      setChequeNumber(e.target.value);
                      setFormErrors((prev) => ({ ...prev, chequeNumber: null }));
                    }}
                  />
                  {formErrors.chequeNumber && (
                    <span className="text-error text-[11px] mt-1">
                      {formErrors.chequeNumber}
                    </span>
                  )}
                </div>
              )}

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">
                    Transaction Reference
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-RR-391048204"
                  className="input input-bordered input-sm w-full rounded-lg text-xs font-mono"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium text-base-content/70">
                Remarks / Notes (Optional)
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Paid in office cash counter with receipt acknowledgment"
              className="textarea textarea-bordered textarea-sm w-full rounded-lg text-xs resize-none"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-base-200">
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-xl text-xs"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm gap-1.5 rounded-xl text-xs shadow-sm"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm & Collect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </>
    )}
  </div>
</div>
);
}
