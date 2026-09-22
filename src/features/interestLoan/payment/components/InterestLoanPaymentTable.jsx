import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Receipt,
  RotateCcw,
  User,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  sendWhatsAppPaymentReceipt,
  WhatsAppIcon,
} from "../../../customerLoans/utils/whatsappShare.js";
import {
  PAYMENT_MODES,
  PAYMENT_MODE_CONFIG,
  formatCurrency,
  formatDateTime,
} from "../utils/interestLoanPaymentHelpers.js";

export default function InterestLoanPaymentTable({
  payments = [],
  pagination = {},
  loading = false,
  filters = {},
  onFilterChange,
  onViewReceipt,
  onReversePayment,
  canDelete = false,
}) {
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
        id: p.loan_id,
        loan_no: p.loan_no,
        customer_name:
          p.customer_name ||
          `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        customer_mobile: p.customer_mobile,
        mobile: p.customer_mobile,
      },
      customer: {
        name:
          p.customer_name ||
          `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        mobile: p.customer_mobile,
      },
      company: company || {},
      payment: p,
      successData: {
        receiptNo: `RCP-${p.loan_id || ""}-${String(
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
  const modeOptions = ["all", ...PAYMENT_MODES];

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            placeholder="Search by loan #, customer, mobile, ref, cheque..."
            className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Payment Mode Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-base-content/40" />
            <select
              className="select select-bordered select-sm rounded-xl text-xs capitalize"
              value={filters.payment_mode || "all"}
              onChange={(e) =>
                onFilterChange({
                  payment_mode: e.target.value === "all" ? "" : e.target.value,
                  page: 1,
                })
              }
            >
              <option value="all">All Modes</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {PAYMENT_MODE_CONFIG[mode]?.label || mode}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <input
            type="date"
            title="From Date"
            className="input input-bordered input-sm rounded-xl text-xs"
            value={filters.from_date || ""}
            onChange={(e) =>
              onFilterChange({ from_date: e.target.value, page: 1 })
            }
          />

          {/* To Date */}
          <input
            type="date"
            title="To Date"
            className="input input-bordered input-sm rounded-xl text-xs"
            value={filters.to_date || ""}
            onChange={(e) =>
              onFilterChange({ to_date: e.target.value, page: 1 })
            }
          />

          {/* Reset Filters */}
          {(filters.search ||
            filters.payment_mode ||
            filters.from_date ||
            filters.to_date) && (
            <button
              onClick={() =>
                onFilterChange({
                  search: "",
                  payment_mode: "",
                  from_date: "",
                  to_date: "",
                  page: 1,
                })
              }
              className="btn btn-ghost btn-sm text-xs rounded-xl text-error hover:bg-error/10"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-sm w-full">
          <thead className="bg-base-200/50 text-base-content/70 border-b border-base-200 text-xs">
            <tr>
              <th className="whitespace-nowrap">Receipt Ref</th>
              <th className="whitespace-nowrap">Date & Time</th>
              <th className="min-w-[150px]">Customer</th>
              <th className="whitespace-nowrap min-w-[130px]">Loan Reference</th>
              <th className="text-right whitespace-nowrap min-w-[110px]">Amount Paid</th>
              <th className="min-w-[160px]">Settlement Split</th>
              <th className="whitespace-nowrap min-w-[130px]">Mode</th>
              <th className="whitespace-nowrap min-w-[110px]">Received By</th>
              <th className="text-right whitespace-nowrap min-w-[110px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-base-200 text-xs">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-base-content/50">
                  <Loader2 size={22} className="animate-spin inline mr-2 text-primary" />
                  <span>Loading payment records...</span>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-base-content/50">
                  <div className="max-w-xs mx-auto space-y-2">
                    <FileText size={32} className="mx-auto opacity-30" />
                    <p className="font-semibold text-sm text-base-content">
                      No payment records found
                    </p>
                    <p className="text-xs">
                      {filters.search || filters.payment_mode
                        ? "Try clearing filters to view available payments."
                        : "Payments collected on anytime interest loans will appear here."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const modeCfg =
                  PAYMENT_MODE_CONFIG[p.payment_mode] || PAYMENT_MODE_CONFIG.other;
                const ModeIcon = modeCfg.icon;

                return (
                  <tr key={p.id} className="hover:bg-base-200/40 transition-colors">
                    {/* Receipt ID */}
                    <td className="font-mono font-bold text-xs text-base-content">
                      #{String(p.id).padStart(6, "0")}
                      {p.payment_no ? (
                        <span className="text-[10px] text-base-content/40 block font-normal">
                          Installment #{p.payment_no}
                        </span>
                      ) : null}
                    </td>

                    {/* Date */}
                    <td className="text-xs whitespace-nowrap text-base-content/80">
                      {formatDateTime(p.payment_date)}
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="font-semibold text-base-content">
                        {p.customer_name ||
                          `${p.first_name || ""} ${p.last_name || ""}`.trim()}
                      </div>
                      <div className="text-[11px] text-base-content/50">
                        #{p.customer_no || "—"}{" "}
                        {p.customer_mobile && `• ${p.customer_mobile}`}
                      </div>
                    </td>

                    {/* Loan Ref Link */}
                    <td>
                      <Link
                        to={`/interest-loans/${p.loan_id}`}
                        className="font-mono font-bold text-primary hover:underline"
                        title="View loan details"
                      >
                        {p.loan_no || `Loan #${p.loan_id}`}
                      </Link>
                    </td>

                    {/* Amount Paid */}
                    <td className="text-right">
                      <span className="font-mono font-bold text-sm text-base-content">
                        {formatCurrency(p.payment_amount)}
                      </span>
                    </td>

                    {/* Split Breakdown */}
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Number(p.interest_amount || 0) > 0 && (
                          <span className="badge badge-xs badge-secondary/15 text-secondary border-secondary/30 font-medium">
                            Int: {formatCurrency(p.interest_amount)}
                          </span>
                        )}
                        {Number(p.principal_amount || 0) > 0 && (
                          <span className="badge badge-xs badge-success/15 text-success border-success/30 font-medium">
                            Prin: {formatCurrency(p.principal_amount)}
                          </span>
                        )}
                        {Number(p.interest_amount || 0) === 0 &&
                          Number(p.principal_amount || 0) === 0 && (
                            <span className="text-base-content/40 text-[11px]">
                              —
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td className="whitespace-nowrap">
                      <span
                        className={`badge badge-sm font-semibold gap-1.5 whitespace-nowrap inline-flex items-center shrink-0 ${modeCfg.badge}`}
                      >
                        <ModeIcon size={12} className="shrink-0" />
                        <span>{modeCfg.label}</span>
                      </span>
                      {p.transaction_reference && (
                        <span
                          className="text-[10px] text-base-content/50 block font-mono truncate max-w-[130px] mt-0.5"
                          title={p.transaction_reference}
                        >
                          Ref: {p.transaction_reference}
                        </span>
                      )}
                      {p.cheque_number && (
                        <span
                          className="text-[10px] text-base-content/50 block font-mono truncate max-w-[130px] mt-0.5"
                          title={p.cheque_number}
                        >
                          Chq: {p.cheque_number}
                        </span>
                      )}
                    </td>

                    {/* Received By */}
                    <td className="text-base-content/70">
                      {p.received_by_name || "Admin"}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleWhatsAppShare(p)}
                          className="btn btn-ghost btn-xs btn-square text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Share Official Receipt via WhatsApp"
                        >
                          <WhatsAppIcon size={14} />
                        </button>

                        <button
                          onClick={() => onViewReceipt(p)}
                          className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary hover:bg-primary/10"
                          title="View & Print Official Receipt"
                        >
                          <Receipt size={14} />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => onReversePayment(p)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error hover:bg-error/10"
                            title="Reverse / Void Payment"
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

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-2 text-xs">
          <span className="text-base-content/60">
            Showing Page <strong>{pagination.page}</strong> of{" "}
            <strong>{pagination.pages}</strong> ({pagination.total} total payments)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onFilterChange({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1 || loading}
              className="btn btn-outline btn-xs rounded-lg gap-1 border-base-300"
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <span className="px-2 font-mono font-bold text-xs text-base-content">
              {pagination.page} / {pagination.pages}
            </span>

            <button
              onClick={() => onFilterChange({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages || loading}
              className="btn btn-outline btn-xs rounded-lg gap-1 border-base-300"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
