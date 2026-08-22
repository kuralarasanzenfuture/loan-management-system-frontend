import React, { useEffect } from "react";
import {
  X,
  Calendar,
  CreditCard,
  Hash,
  Receipt,
  AlertTriangle,
} from "lucide-react";

/**
 * PaymentSuccessModal
 * Shown after a payment is successfully recorded. Animated checkmark +
 * large amount + a receipt-style breakdown of the details, instead of a
 * plain toast message.
 *
 * Props:
 * - open (bool)
 * - data (object | null):
 *     {
 *       amount,                 // number — the amount actually paid
 *       installmentNo,          // number|string, optional
 *       paymentDate,            // string (YYYY-MM-DD), optional
 *       paymentMode,            // string, optional — 'cash' | 'bank' | 'upi' | ...
 *       transactionReference,   // string, optional
 *       penaltyAmount,          // number, optional — shown as a separate line if > 0
 *       remainingBalance,       // number, optional
 *       status,                 // string, optional — 'paid' | 'partial' | ...
 *     }
 * - onClose (fn)
 * - autoCloseMs (number)   : default 5000; pass 0 to disable auto-close
 * - formatCurrency (fn)    : your existing currency formatter
 */
export default function PaymentSuccessModal({
  open,
  data,
  onClose,
  autoCloseMs = 5000,
  formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`,
}) {
  useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  if (!open || !data) return null;

  const PAYMENT_MODE_LABELS = {
    cash: "Cash",
    bank: "Bank Transfer",
    upi: "UPI",
    cheque: "Cheque",
    other: "Other",
  };

  const rows = [
    data.installmentNo != null && {
      icon: Hash,
      label: "Installment",
      value: `#${data.installmentNo}`,
    },
    data.paymentDate && {
      icon: Calendar,
      label: "Payment Date",
      value: new Date(data.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    data.paymentMode && {
      icon: CreditCard,
      label: "Payment Mode",
      value: PAYMENT_MODE_LABELS[data.paymentMode] || data.paymentMode,
    },
    data.transactionReference && {
      icon: Receipt,
      label: "Reference",
      value: data.transactionReference,
    },
  ].filter(Boolean);

  return (
    <div className="modal modal-open">
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
        .psm-fade-up {
          animation: psm-fade-up 0.4s 0.5s ease-out both;
        }
        @keyframes psm-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="modal-box max-w-sm rounded-2xl text-center relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Animated checkmark */}
        <div className="relative w-20 h-20 mx-auto mt-2 mb-4">
          <span className="psm-ring absolute inset-0 rounded-full bg-success/30" />
          <div className="psm-circle relative w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
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

        <div className="psm-fade-up">
          <h3 className="font-bold text-lg">Payment Successful!</h3>
          <p className="text-xs text-base-content/50 mt-0.5">
            {data.status === "paid"
              ? "Installment fully paid"
              : "Payment recorded"}
          </p>

          {/* Amount */}
          <div className="my-5">
            <div className="text-[11px] uppercase tracking-wider text-base-content/40 mb-1">
              Amount Paid
            </div>
            <div className="text-3xl font-bold text-success">
              {formatCurrency(data.amount)}
            </div>
          </div>

          {data.penaltyAmount > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-warning mb-4">
              <AlertTriangle size={12} />
              Includes penalty of {formatCurrency(data.penaltyAmount)}
            </div>
          )}

          {/* Details */}
          {rows.length > 0 && (
            <div className="rounded-xl border border-base-300 divide-y divide-base-200 text-left mb-4">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2 text-base-content/50">
                    <row.icon size={13} />
                    {row.label}
                  </span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {data.remainingBalance != null && (
            <div className="flex items-center justify-between px-1 mb-5 text-sm">
              <span className="text-base-content/50">Remaining Balance</span>
              <span
                className={`font-semibold ${data.remainingBalance > 0 ? "text-error" : "text-success"}`}
              >
                {formatCurrency(data.remainingBalance)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn btn-success btn-sm w-full rounded-lg text-success-content"
          >
            Done
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
