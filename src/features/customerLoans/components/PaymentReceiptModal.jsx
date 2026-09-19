import React, { useEffect, useState } from "react";
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  Building,
  Loader2,
  FileText,
} from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";
import { getPaymentReceipt } from "../../../redux/loanPayments/loanPayment.service.js";
import { printOfficialPaymentReceipt } from "../utils/printLoanStatement.js";
import { sendWhatsAppPaymentReceipt } from "../utils/whatsappShare.js";

export default function PaymentReceiptModal({
  open,
  paymentId,
  onClose,
}) {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && paymentId) {
      let isMounted = true;
      setLoading(true);
      setError(null);

      getPaymentReceipt(paymentId)
        .then((res) => {
          if (!isMounted) return;
          const data = res?.data || res;
          setReceiptData(data);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Failed to load receipt:", err);
          setError(err.message || "Failed to load receipt voucher details");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setReceiptData(null);
      setError(null);
    }
  }, [open, paymentId]);

  if (!open) return null;

  const payment = receiptData?.payment || {};
  const company = receiptData?.company || {};
  const receiptNo = receiptData?.receipt_no || `RCP-${payment.id || ""}`;

  const handlePrint = () => {
    if (receiptData) {
      printOfficialPaymentReceipt(receiptData);
    }
  };

  const handleWhatsApp = () => {
    if (!receiptData || !receiptData.payment) return;
    sendWhatsAppPaymentReceipt({
      loan: receiptData.loan,
      customer: receiptData.customer,
      payment: receiptData.payment,
      company: receiptData.company,
      successData: {
        amountPaidNow: receiptData.payment.payment_amount,
        receiptNo: receiptData.receipt_no,
        paidDate: receiptData.payment.payment_date,
        remainingBalance: receiptData.payment.installment_balance_amount,
        status: receiptData.payment.installment_status,
        paymentMode: receiptData.payment.payment_mode,
        transactionReference: receiptData.payment.transaction_reference,
      },
    });
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg rounded-2xl border border-base-300 shadow-2xl p-6 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt size={17} />
            </span>
            <div>
              <h3 className="font-bold text-base text-base-content leading-tight">
                Payment Receipt Voucher
              </h3>
              <p className="text-[11px] text-base-content/50 font-medium tracking-wide">
                {receiptNo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Loading official voucher data…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs text-center space-y-2">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-xs"
            >
              Close
            </button>
          </div>
        )}

        {/* Receipt Content */}
        {!loading && !error && receiptData && (
          <div className="space-y-4">
            {/* Voucher Hero Card */}
            <div className="rounded-2xl bg-gradient-to-br from-success/15 via-base-200/50 to-base-200/20 border border-success/30 p-4 text-center">
              <div className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center justify-center gap-1">
                <CheckCircle2 size={13} />
                Payment Verified & Received
              </div>
              <div className="text-3xl font-black text-base-content tracking-tight mt-1">
                {formatCurrency(payment.payment_amount)}
              </div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="badge badge-sm badge-success uppercase font-bold text-[10px] tracking-wide">
                  {payment.payment_mode || "CASH"}
                </span>
                <span className="text-xs text-base-content/60 font-medium">
                  Payment #{payment.payment_no}
                </span>
              </div>
            </div>

            {/* Details Breakdown */}
            <div className="rounded-xl border border-base-200 bg-base-100 p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <Receipt size={13} className="text-primary" /> Receipt Voucher No.
                </span>
                <span className="font-bold text-base-content tracking-wide">
                  {receiptNo}
                </span>
              </div>

              <div className="flex justify-between items-center text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="opacity-50" /> Date & Time
                </span>
                <span className="font-semibold text-base-content">
                  {payment.payment_date
                    ? new Date(payment.payment_date).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between items-center text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="opacity-50" /> Customer Name
                </span>
                <span className="font-semibold text-base-content">
                  {payment.customer_name || "—"} ({payment.customer_no || "—"})
                </span>
              </div>

              <div className="flex justify-between items-center text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} className="opacity-50" /> Loan Account
                </span>
                <span className="font-semibold text-base-content tracking-wide">
                  {payment.loan_no || `LN-${payment.loan_id}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-base-content/70">
                <span>Installment Target</span>
                <span className="font-semibold text-base-content">
                  Installment #{payment.installment_no}
                </span>
              </div>

              {payment.transaction_reference && (
                <div className="flex justify-between items-center text-base-content/70">
                  <span>Transaction Reference</span>
                  <span className="font-semibold text-base-content tracking-wide">
                    {payment.transaction_reference}
                  </span>
                </div>
              )}

              {payment.cheque_number && (
                <div className="flex justify-between items-center text-base-content/70">
                  <span>Cheque Number</span>
                  <span className="font-semibold text-warning tracking-wide">
                    {payment.cheque_number}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-base-200 flex justify-between items-center">
                <span className="text-base-content/70">Installment Remaining Balance</span>
                <span className="font-bold text-base-content">
                  {formatCurrency(payment.installment_balance_amount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-base-content/70">
                <span>Received By</span>
                <span className="font-semibold text-base-content">
                  {payment.received_by_user || "Authorized Staff"}
                </span>
              </div>
            </div>

            {/* Company Info Footer Strip */}
            <div className="text-[10px] text-base-content/50 bg-base-200/50 rounded-lg p-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Building size={12} /> {company.company_name || "Loan Management System"}
              </span>
              <span>{company.phone || ""}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="btn btn-sm rounded-xl gap-1.5 border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-600 hover:border-emerald-600 text-emerald-700 hover:text-white font-bold transition-all shadow-2xs"
                title="Share voucher via WhatsApp"
              >
                <WhatsAppIcon size={15} className="shrink-0" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm rounded-xl gap-1.5 font-bold shadow-sm"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop bg-black/50 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}

function WhatsAppIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

