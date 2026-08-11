import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Pencil,
  Trash2,
  Landmark,
  QrCode,
  IndianRupee,
  CircleDot,
  Eye,
} from "lucide-react";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  closed: "badge-error badge-outline",
};

const PURPOSE_LABELS = {
  business: "Business",
  collection: "Collection",
  loan_disbursement: "Loan Disbursement",
  expenses: "Expenses",
  salary: "Salary",
  savings: "Savings",
  other: "Other",
};

/**
 * CompanyBankCard
 * Props:
 * - bank (object)
 * - onEdit (fn) / onDelete (fn) / onMakePrimary (fn)
 * - settingPrimary (bool) : loading state while this card's "make primary" call is in flight
 */
export default function CompanyBankCard({
  bank,
  onEdit,
  onDelete,
  onMakePrimary,
  settingPrimary,
}) {
  const navigate = useNavigate();

  const maskedAccount = bank.account_number
    ? `••••${bank.account_number.slice(-4)}`
    : "—";

  const handleView = () => {
    navigate(`/bank-accounts/${bank.id}`);
  };

  return (
    <div
      className={`rounded-2xl border bg-base-100 overflow-hidden transition-all hover:shadow-lg ${
        bank.is_primary
          ? "border-primary/40 shadow-md shadow-primary/10"
          : "border-base-300"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 pt-5 cursor-pointer group"
        onClick={handleView}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-colors">
            <Landmark size={18} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                {bank.bank_name}
              </p>
              {Boolean(bank.is_primary) && (
                <span className="badge badge-primary badge-xs gap-1 font-bold shrink-0">
                  <Star size={9} className="fill-current" /> Primary
                </span>
              )}
            </div>
            <p className="text-[11px] text-base-content/40 truncate">
              {bank.branch_name || "No branch specified"}
            </p>
          </div>
        </div>

        <span
          className={`badge gap-1.5 font-medium badge-sm shrink-0 ${STATUS_STYLES[bank.status] || "badge-ghost"}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {bank.status?.charAt(0).toUpperCase() + bank.status?.slice(1)}
        </span>
      </div>

      {/* Account details */}
      <div
        className="px-5 py-4 space-y-2 cursor-pointer"
        onClick={handleView}
      >
        <div className="flex justify-between text-xs">
          <span className="text-base-content/40">Account Holder</span>
          <span className="font-medium text-right truncate max-w-[60%]">
            {bank.account_holder_name}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-base-content/40">Account No.</span>
          <span className="font-mono font-medium">{maskedAccount}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-base-content/40">Account Type</span>
          <span className="font-medium capitalize">
            {bank.account_type?.replace(/_/g, " ")}
          </span>
        </div>
        {bank.ifsc_code && (
          <div className="flex justify-between text-xs">
            <span className="text-base-content/40">IFSC</span>
            <span className="font-mono font-medium">{bank.ifsc_code}</span>
          </div>
        )}
        {bank.upi_id && (
          <div className="flex justify-between text-xs">
            <span className="text-base-content/40">UPI ID</span>
            <span className="font-medium">{bank.upi_id}</span>
          </div>
        )}
      </div>

      {/* Balance strip */}
      <div
        className="mx-5 rounded-xl bg-base-200/50 px-3.5 py-2.5 flex items-center justify-between cursor-pointer"
        onClick={handleView}
      >
        <span className="flex items-center gap-1.5 text-[11px] text-base-content/50 font-medium">
          <IndianRupee size={11} /> Current Balance
        </span>
        <span className="text-sm font-bold text-base-content">
          ₹
          {Number(bank.current_balance || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Purpose flags */}
      <div
        className="flex flex-wrap gap-1.5 px-5 mt-3 cursor-pointer"
        onClick={handleView}
      >
        <span className="badge badge-ghost badge-sm font-medium">
          {PURPOSE_LABELS[bank.account_purpose] || bank.account_purpose}
        </span>
        {Boolean(bank.is_collection_account) && (
          <span className="badge badge-info badge-outline badge-sm gap-1 font-medium">
            <CircleDot size={9} /> Collection
          </span>
        )}
        {Boolean(bank.is_disbursement_account) && (
          <span className="badge badge-success badge-outline badge-sm gap-1 font-medium">
            <CircleDot size={9} /> Disbursement
          </span>
        )}
        {bank.upi_qr_code && (
          <span className="badge badge-ghost badge-sm gap-1 font-medium">
            <QrCode size={10} /> QR
          </span>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3.5 mt-3 border-t border-base-200">
        {!bank.is_primary ? (
          <button
            type="button"
            onClick={() => onMakePrimary(bank)}
            disabled={settingPrimary}
            className="btn btn-ghost btn-xs rounded-lg gap-1.5 text-base-content/50 hover:text-primary"
          >
            {settingPrimary ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Star size={12} />
            )}
            Set as primary
          </button>
        ) : (
          <span className="text-[11px] text-base-content/30">
            Primary account
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10"
            onClick={handleView}
            title="View Details"
          >
            <Eye size={13} />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square"
            onClick={() => onEdit(bank)}
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
            onClick={() => onDelete(bank)}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
