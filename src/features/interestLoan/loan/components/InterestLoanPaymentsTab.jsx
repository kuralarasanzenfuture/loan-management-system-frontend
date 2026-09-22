import React from "react";
import { useSelector } from "react-redux";
import { CreditCard, Receipt, RotateCcw, FileText } from "lucide-react";
import {
  sendWhatsAppPaymentReceipt,
  WhatsAppIcon,
} from "../../../customerLoans/utils/whatsappShare.js";
import {
  PAYMENT_MODE_CONFIG,
  formatCurrency,
  formatDateTime,
} from "../../payment/utils/interestLoanPaymentHelpers.js";
import { formatCurrency as formatLoanCurrency } from "../utils/interestLoanHelpers.js";

const money = (value) => formatCurrency(value) || formatLoanCurrency(value);

const InterestLoanPaymentsTab = ({
  loan = null,
  payments = [],
  loading = false,
  canCollect = false,
  canReverse = false,
  canCollectNow = false,
  onCollect,
  onViewReceipt,
  onReverse,
}) => {
  const company = useSelector((state) => state.companyDetails?.company);

  const handleWhatsAppShare = (p) => {
    const remainingBal =
      p.outstanding_principal_after != null &&
      p.outstanding_interest_after != null
        ? Number(p.outstanding_principal_after) +
          Number(p.outstanding_interest_after)
        : 0;

    sendWhatsAppPaymentReceipt({
      loan: {
        id: p.loan_id || loan?.id,
        loan_no: p.loan_no || loan?.loan_no,
        customer_name:
          p.customer_name ||
          loan?.customer_name ||
          `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        customer_mobile:
          p.customer_mobile || loan?.customer_mobile || loan?.mobile,
        mobile: p.customer_mobile || loan?.customer_mobile || loan?.mobile,
      },
      customer: {
        name:
          p.customer_name ||
          loan?.customer_name ||
          `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        mobile: p.customer_mobile || loan?.customer_mobile || loan?.mobile,
      },
      company: company || {},
      payment: p,
      successData: {
        receiptNo: `RCP-${p.loan_id || loan?.id || ""}-${String(
          p.payment_no || p.id
        ).padStart(4, "0")}`,
        amountPaidNow: p.payment_amount,
        paidDate: p.payment_date,
        paymentMode: p.payment_mode,
        transactionReference: p.transaction_reference,
        remainingBalance: remainingBal,
        status: remainingBal <= 0 ? "settled" : "paid",
      },
    });
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-base-content/60 font-medium">
          Payment Transactions:{" "}
          <span className="text-primary font-bold">{payments.length}</span>{" "}
          record{payments.length !== 1 ? "s" : ""} on ledger
        </p>
        {canCollect && canCollectNow && (
          <button
            type="button"
            onClick={onCollect}
            className="btn btn-outline btn-success btn-xs gap-1"
          >
            <CreditCard size={12} />
            Collect Payment
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-sm w-full text-xs">
          <thead className="bg-base-200/50 text-base-content/70">
            <tr>
              <th>Receipt Ref</th>
              <th>Date & Time</th>
              <th className="text-right">Amount Paid</th>
              <th>Allocation Split</th>
              <th>Mode</th>
              <th>Received By</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-base-content/50">
                  Loading payment history...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-base-content/50">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-base-content/70">
                    No payments recorded yet for this loan.
                  </p>
                  <p className="text-xs mt-1">
                    Collect interest or principal from the billing schedule or
                    the Collect Payment action.
                  </p>
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const modeCfg =
                  PAYMENT_MODE_CONFIG[p.payment_mode] ||
                  PAYMENT_MODE_CONFIG.other;
                const ModeIcon = modeCfg.icon;
                return (
                  <tr key={p.id} className="hover:bg-base-200/40 transition-colors">
                    <td className="font-bold text-base-content tracking-wide">
                      {p.payment_no ? `#${p.payment_no}` : `#${String(p.id).padStart(6, "0")}`}
                    </td>
                    <td className="text-xs font-semibold text-base-content tabular-nums">{formatDateTime(p.payment_date)}</td>
                    <td className="text-right font-bold tabular-nums text-base-content">
                      {money(p.payment_amount)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Number(p.interest_amount || 0) > 0 && (
                          <span className="badge badge-xs badge-outline text-secondary border-secondary/30">
                            Int: {money(p.interest_amount)}
                          </span>
                        )}
                        {Number(p.principal_amount || 0) > 0 && (
                          <span className="badge badge-xs badge-outline text-success border-success/30">
                            Prin: {money(p.principal_amount)}
                          </span>
                        )}
                        {Number(p.interest_amount || 0) === 0 &&
                          Number(p.principal_amount || 0) === 0 && (
                            <span className="text-base-content/40">—</span>
                          )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`badge badge-sm font-semibold gap-1.5 whitespace-nowrap inline-flex items-center shrink-0 ${modeCfg.badge}`}
                      >
                        <ModeIcon size={12} className="shrink-0" />
                        <span>{modeCfg.label}</span>
                      </span>
                    </td>
                    <td className="text-base-content/70">
                      {p.received_by_name || "Admin"}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(p)}
                          className="btn btn-ghost btn-xs btn-square text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Share Receipt on WhatsApp"
                        >
                          <WhatsAppIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewReceipt?.(p)}
                          className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                          title="View & Print Receipt"
                        >
                          <Receipt size={14} />
                        </button>
                        {canReverse && (
                          <button
                            type="button"
                            onClick={() => onReverse?.(p)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error"
                            title="Reverse Payment"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterestLoanPaymentsTab;
