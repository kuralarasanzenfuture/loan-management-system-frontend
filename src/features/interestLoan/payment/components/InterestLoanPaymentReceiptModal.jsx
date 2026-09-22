import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  Printer,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  PAYMENT_MODE_CONFIG,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../utils/interestLoanPaymentHelpers.js";
import { printInterestReceipt } from "../../../customerInterest/utils/printInterestReceipt.js";
import {
  sendWhatsAppPaymentReceipt,
  WhatsAppIcon,
} from "../../../customerLoans/utils/whatsappShare.js";
import { fetchCompanyDetails } from "../../../../redux/companyDetails/companyDetailsSlice.js";

export default function InterestLoanPaymentReceiptModal({
  open,
  payment,
  loan = null,
  onClose,
}) {
  const dispatch = useDispatch();
  const receiptRef = useRef(null);
  const company = useSelector((state) => state.companyDetails?.company);
  const reduxLoan = useSelector((state) => state.interestLoans?.loan);

  useEffect(() => {
    if (open && !company) {
      dispatch(fetchCompanyDetails());
    }
  }, [open, company, dispatch]);

  if (!open || !payment) return null;

  const activeLoan = loan || reduxLoan || {};

  const customerName =
    payment.customer_name ||
    activeLoan.customer_name ||
    `${payment.first_name || activeLoan.first_name || ""} ${payment.last_name || activeLoan.last_name || ""}`.trim() ||
    "Valued Customer";

  const customerNo =
    payment.customer_no ||
    activeLoan.customer_no ||
    "—";

  const customerMobile =
    payment.customer_mobile ||
    payment.mobile ||
    payment.phone ||
    payment.customer_phone ||
    activeLoan.customer_mobile ||
    activeLoan.mobile ||
    activeLoan.phone ||
    activeLoan.customer_phone ||
    "—";

  const loanNo =
    payment.loan_no ||
    activeLoan.loan_no ||
    (payment.loan_id ? `INTL-${String(payment.loan_id).padStart(6, "0")}` : "—");

  const modeCfg =
    PAYMENT_MODE_CONFIG[payment.payment_mode] || PAYMENT_MODE_CONFIG.other;
  const ModeIcon = modeCfg.icon;

  const handlePrint = () => {
    printInterestReceipt({
      loan: {
        id: payment.loan_id || activeLoan.id,
        loan_no: loanNo,
        interest_rate: payment.interest_rate || activeLoan.interest_rate,
        interest_frequency:
          payment.interest_frequency || activeLoan.interest_frequency,
        customer_name: customerName,
        customer_no: customerNo,
        customer_mobile: customerMobile,
      },
      payment: payment,
      allocations: payment.allocations || [],
      customer: {
        customer_name: customerName,
        customer_no: customerNo,
        mobile: customerMobile,
      },
      company: company || {},
      remainingOutstanding:
        payment.outstanding_principal_after != null &&
        payment.outstanding_interest_after != null
          ? Number(payment.outstanding_principal_after) +
            Number(payment.outstanding_interest_after)
          : null,
    });
  };

  const handleWhatsApp = () => {
    sendWhatsAppPaymentReceipt({
      loan: {
        id: payment.loan_id || activeLoan.id,
        loan_no: loanNo,
        customer_name: customerName,
        customer_mobile: customerMobile,
        mobile: customerMobile,
      },
      customer: {
        name: customerName,
        mobile: customerMobile,
      },
      company: company || {},
      payment: payment,
      successData: {
        receiptNo: `RCP-${String(payment.id).padStart(6, "0")}`,
        amountPaidNow: payment.payment_amount,
        paidDate: payment.payment_date,
        paymentMode: payment.payment_mode,
        transactionReference: payment.transaction_reference,
        remainingBalance:
          payment.outstanding_principal_after != null &&
          payment.outstanding_interest_after != null
            ? Number(payment.outstanding_principal_after) +
              Number(payment.outstanding_interest_after)
            : 0,
        status:
          Number(payment.outstanding_principal_after || 0) +
            Number(payment.outstanding_interest_after || 0) <=
          0
            ? "settled"
            : "paid",
      },
    });
  };

  const allocations = payment.allocations || [];

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl p-0 overflow-hidden shadow-2xl rounded-2xl border border-base-300 bg-base-100 print:shadow-none print:border-none print:max-w-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/50 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              <Receipt size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-base text-base-content">
                Payment Receipt
              </h3>
              <p className="text-xs text-base-content/50">
                Official acknowledgment of loan transaction
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="btn btn-sm rounded-xl gap-1.5 border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-600 hover:border-emerald-600 text-emerald-700 hover:text-white font-bold transition-all text-xs"
              title="Share receipt via WhatsApp"
            >
              <WhatsAppIcon size={14} />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-base-content gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              <Printer size={14} className="text-base-content/70" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div
          ref={receiptRef}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-8"
        >
          {/* Company & Receipt Header */}
          <div className="flex items-start justify-between border-b border-base-200 pb-5">
            <div>
              <h2 className="text-xl font-black tracking-tight text-base-content">
                LOAN PAYMENT RECEIPT
              </h2>
              <p className="text-xs font-mono text-primary font-bold mt-1">
                RECEIPT #{payment.id ? String(payment.id).padStart(6, "0") : "—"}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-base-content/60">
                <Calendar size={13} />
                <span>Date: {formatDateTime(payment.payment_date)}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs font-bold border border-success/20">
                <CheckCircle2 size={14} />
                <span>PAYMENT CONFIRMED</span>
              </div>
              <div className="text-xs text-base-content/50 mt-2 font-mono">
                Loan Ref:{" "}
                <span className="font-bold text-base-content">
                  {loanNo}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Loan Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-base-200/40 border border-base-300 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1">
                <User size={12} className="text-primary" /> Customer Details
              </span>
              <p className="font-bold text-sm text-base-content">
                {customerName}
              </p>
              <p className="text-base-content/70">
                Customer No: <span className="font-mono font-medium text-base-content">{customerNo}</span>
              </p>
              <p className="text-base-content/70">
                Mobile: <span className="font-mono font-medium text-base-content">{customerMobile}</span>
              </p>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-base-300 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1">
                <CreditCard size={12} className="text-primary" /> Payment Method
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`badge badge-sm font-semibold gap-1 ${modeCfg.badge}`}>
                  <ModeIcon size={12} />
                  {modeCfg.label}
                </span>
              </div>
              {payment.transaction_reference && (
                <p className="text-base-content/70">
                  Ref: <span className="font-mono">{payment.transaction_reference}</span>
                </p>
              )}
              {payment.cheque_number && (
                <p className="text-base-content/70">
                  Cheque No: <span className="font-mono">{payment.cheque_number}</span>
                </p>
              )}
              <p className="text-base-content/50 text-[11px]">
                Processed by: {payment.received_by_name || "System"}
              </p>
            </div>
          </div>

          {/* Payment Amount Highlight Banner */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <span className="text-3xl font-black text-primary tracking-tight">
                {formatCurrency(payment.payment_amount)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-base-content/50 block text-[11px]">
                  Interest Settled
                </span>
                <span className="font-bold text-secondary text-sm">
                  {formatCurrency(payment.interest_amount || 0)}
                </span>
              </div>
              <div className="text-right border-l border-base-300 pl-4">
                <span className="text-base-content/50 block text-[11px]">
                  Principal Reduced
                </span>
                <span className="font-bold text-success text-sm">
                  {formatCurrency(payment.principal_amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          {allocations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Line-Item Allocation Breakdown
              </h4>
              <div className="overflow-x-auto rounded-xl border border-base-300">
                <table className="table table-xs w-full">
                  <thead className="bg-base-200/60 text-base-content/60">
                    <tr>
                      <th>#</th>
                      <th>Allocation Type</th>
                      <th>Target Period</th>
                      <th>Period Dates</th>
                      <th className="text-right">Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((alloc, idx) => (
                      <tr key={alloc.allocation_id || idx} className="hover:bg-base-200/30">
                        <td className="font-mono text-[11px] text-base-content/50">
                          {idx + 1}
                        </td>
                        <td>
                          <span
                            className={`badge badge-xs font-semibold uppercase text-[10px] ${
                              alloc.allocation_type === "principal"
                                ? "badge-success/15 text-success border-success/30"
                                : "badge-secondary/15 text-secondary border-secondary/30"
                            }`}
                          >
                            {alloc.allocation_type}
                          </span>
                        </td>
                        <td className="font-semibold text-xs">
                          {alloc.period_no ? `Period #${alloc.period_no}` : "Principal Balance"}
                        </td>
                        <td className="text-xs text-base-content/70">
                          {alloc.period_start_date && alloc.period_end_date
                            ? `${formatDate(alloc.period_start_date)} — ${formatDate(
                                alloc.period_end_date
                              )}`
                            : "Direct Reduction"}
                        </td>
                        <td className="text-right font-mono font-bold text-xs">
                          {formatCurrency(alloc.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Balance Impact Matrix */}
          <div className="p-4 rounded-xl bg-base-200/40 border border-base-300 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              Account Balance Reconciliation
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-base-content/50 block text-[11px]">
                  Principal (Before)
                </span>
                <span className="font-mono font-medium">
                  {formatCurrency(payment.outstanding_principal_before)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block text-[11px]">
                  Principal (After)
                </span>
                <span className="font-mono font-bold text-success">
                  {formatCurrency(payment.outstanding_principal_after)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block text-[11px]">
                  Interest (Before)
                </span>
                <span className="font-mono font-medium">
                  {formatCurrency(payment.outstanding_interest_before)}
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block text-[11px]">
                  Interest (After)
                </span>
                <span className="font-mono font-bold text-secondary">
                  {formatCurrency(payment.outstanding_interest_after)}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {payment.remarks && (
            <div className="text-xs text-base-content/70 italic border-t border-base-200 pt-3">
              Remarks: {payment.remarks}
            </div>
          )}

          {/* Receipt Footer */}
          <div className="border-t border-base-200 pt-4 flex items-center justify-between text-[11px] text-base-content/40">
            <span>Generated electronically • Valid without physical signature</span>
            <span className="font-mono font-bold">
              Transaction ID: #{payment.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
