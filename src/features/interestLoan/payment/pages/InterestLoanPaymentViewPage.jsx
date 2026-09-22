import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Printer,
  RotateCcw,
  Loader2,
  Calendar,
  User,
  CreditCard,
  Receipt,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  fetchPaymentById,
  reversePaymentThunk,
} from "../../../../redux/interestLoan/payment/interestLoanPaymentSlice.js";
import InterestLoanPaymentReverseModal from "../components/InterestLoanPaymentReverseModal.jsx";
import {
  PAYMENT_MODE_CONFIG,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../utils/interestLoanPaymentHelpers.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

export default function InterestLoanPaymentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();

  const canDelete = hasPermission(PERMISSIONS.INTEREST_ONLY_LOAN_DELETE);
  const { selectedPayment, loading, reversing, error } = useSelector(
    (state) => state.interestLoanPayments || {}
  );

  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPaymentById(id));
    }
  }, [id, dispatch]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmReverse = async (paymentId) => {
    const res = await dispatch(reversePaymentThunk(paymentId));
    if (reversePaymentThunk.fulfilled.match(res)) {
      setIsReverseModalOpen(false);
      navigate("/interest-loans/payments");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-base-content/60">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading payment receipt...</p>
      </div>
    );
  }

  if (error || !selectedPayment) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="alert alert-error text-sm rounded-2xl shadow-sm">
          <span>{error || "Payment receipt could not be found."}</span>
        </div>
        <button
          onClick={() => navigate("/interest-loans/payments")}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={14} />
          Back to Payments
        </button>
      </div>
    );
  }

  const payment = selectedPayment;
  const modeCfg =
    PAYMENT_MODE_CONFIG[payment.payment_mode] || PAYMENT_MODE_CONFIG.other;
  const ModeIcon = modeCfg.icon;
  const allocations = payment.allocations || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-base-200 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/interest-loans/payments")}
            className="btn btn-ghost btn-sm btn-square text-base-content/70"
            title="Back to Payments"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-bold text-sm text-base-content">
            Payment Receipt #{String(payment.id).padStart(6, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-base-content gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all"
          >
            <Printer size={14} className="text-base-content/70" />
            <span>Print Receipt</span>
          </button>

          {canDelete && (
            <button
              onClick={() => setIsReverseModalOpen(true)}
              className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-1.5 rounded-xl text-xs"
            >
              <RotateCcw size={14} />
              Reverse Payment
            </button>
          )}
        </div>
      </div>

      {/* Official Receipt Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b border-base-200 pb-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-base-content">
              LOAN PAYMENT RECEIPT
            </h2>
            <p className="text-xs font-mono text-primary font-bold mt-1">
              RECEIPT #{String(payment.id).padStart(6, "0")}
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
              Loan:{" "}
              <span className="font-bold text-base-content">
                {payment.loan_no || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-base-200/40 border border-base-300 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1">
              <User size={12} className="text-primary" /> Customer Details
            </span>
            <p className="font-bold text-sm text-base-content">
              {payment.customer_name ||
                `${payment.first_name || ""} ${payment.last_name || ""}`.trim()}
            </p>
            <p className="text-base-content/70">
              Customer No: <span className="font-mono">{payment.customer_no || "—"}</span>
            </p>
            <p className="text-base-content/70">
              Mobile: {payment.customer_mobile || "—"}
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

        {/* Amount Paid Banner */}
        <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <span className="text-3xl font-black text-primary tracking-tight">
              {formatCurrency(payment.payment_amount)}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="text-right">
              <span className="text-base-content/50 block text-[11px]">
                Interest Settled
              </span>
              <span className="font-bold text-secondary text-base">
                {formatCurrency(payment.interest_amount || 0)}
              </span>
            </div>
            <div className="text-right border-l border-base-300 pl-6">
              <span className="text-base-content/50 block text-[11px]">
                Principal Reduced
              </span>
              <span className="font-bold text-success text-base">
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
                    <th>Type</th>
                    <th>Period</th>
                    <th>Period Date Range</th>
                    <th className="text-right">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc, idx) => (
                    <tr key={alloc.allocation_id || idx} className="hover:bg-base-200/30">
                      <td className="font-mono text-base-content/50">{idx + 1}</td>
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
                      <td className="font-semibold">
                        {alloc.period_no ? `Period #${alloc.period_no}` : "Principal Balance"}
                      </td>
                      <td className="text-base-content/70">
                        {alloc.period_start_date && alloc.period_end_date
                          ? `${formatDate(alloc.period_start_date)} — ${formatDate(
                              alloc.period_end_date
                            )}`
                          : "Direct Reduction"}
                      </td>
                      <td className="text-right font-mono font-bold">
                        {formatCurrency(alloc.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reconciliation Balances Strip */}
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
            Transaction Ref: #{payment.id}
          </span>
        </div>
      </div>

      {/* Reverse Modal */}
      <InterestLoanPaymentReverseModal
        open={isReverseModalOpen}
        payment={payment}
        loading={reversing}
        onClose={() => setIsReverseModalOpen(false)}
        onConfirm={handleConfirmReverse}
      />
    </div>
  );
}
