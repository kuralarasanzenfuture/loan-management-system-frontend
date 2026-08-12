import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  Landmark,
  IndianRupee,
  QrCode,
  CircleDot,
  BadgeCheck,
  Copy,
  Check,
  X,
  Eye,
} from "lucide-react";
import {
  fetchCompanyBankById,
  editCompanyBank,
  removeCompanyBank,
  makePrimaryCompanyBank,
  clearSelectedCompanyBank,
  clearCompanyBankError,
} from "../../../redux/companyBanks/companyBankSlice.js";
import CompanyBankFormModal from "../components/CompanyBankFormModal.jsx";
import CompanyBankDeleteModal from "../components/CompanyBankDeleteModal.jsx";
import BankTransactionsPage from "../../bankTransactions/pages/BankTransactionsPage.jsx";

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

function InfoRow({ label, value, copyable, onCopy, copied }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm items-center">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right flex items-center gap-1.5 justify-end">
        {value || <span className="text-base-content/30">—</span>}
        {copyable && value && (
          <button
            type="button"
            onClick={onCopy}
            className="btn btn-ghost btn-xs btn-square"
            title="Copy"
          >
            {copied ? (
              <Check size={12} className="text-success" />
            ) : (
              <Copy size={12} className="text-base-content/40" />
            )}
          </button>
        )}
      </span>
    </div>
  );
}

export default function CompanyBankViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    companyBank: bank,
    loading,
    error,
  } = useSelector((state) => state.companyBanks);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    dispatch(fetchCompanyBankById(id));
    return () => dispatch(clearSelectedCompanyBank());
  }, [dispatch, id]);

  const handleCopy = (field, value) => {
    if (value) {
      navigator.clipboard?.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    }
  };

  const handleEditSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const action = await dispatch(editCompanyBank({ id, formData }));
      if (editCompanyBank.fulfilled.match(action)) {
        setEditModalOpen(false);
        dispatch(fetchCompanyBankById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMakePrimary = async () => {
    setSettingPrimary(true);
    try {
      const action = await dispatch(makePrimaryCompanyBank(id));
      if (makePrimaryCompanyBank.fulfilled.match(action)) {
        dispatch(fetchCompanyBankById(id));
      }
    } finally {
      setSettingPrimary(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCompanyBank(id));
      if (removeCompanyBank.fulfilled.match(action)) {
        navigate("/bank-accounts");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && !bank) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading bank account…</p>
      </div>
    );
  }

  if (!bank) return null;

  const bankLabel = `${bank.bank_name}${bank.account_number ? ` •••• ${bank.account_number.slice(-4)}` : ""}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/bank-accounts")}
            className="btn btn-ghost btn-sm btn-square"
            title="Back to bank accounts"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <Landmark size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{bank.bank_name}</h1>
              {Boolean(bank.is_primary) && (
                <span className="badge badge-primary badge-sm gap-1 font-bold">
                  <Star size={10} className="fill-current" /> Primary
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/40">
              {bank.branch_name || "No branch specified"}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[bank.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {bank.status?.charAt(0).toUpperCase() + bank.status?.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!bank.is_primary && (
            <button
              onClick={handleMakePrimary}
              disabled={settingPrimary}
              className="btn btn-outline btn-sm gap-1.5 border-base-300"
            >
              {settingPrimary ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Star size={14} />
              )}
              Set as Primary
            </button>
          )}
          <button
            onClick={() => {
              dispatch(clearCompanyBankError());
              setEditModalOpen(true);
            }}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Page Alert Error */}
      {error && !editModalOpen && !deleteModalOpen && (
        <div className="alert alert-error text-sm py-2.5 rounded-xl flex items-center justify-between">
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong."}
          </span>
          <button
            type="button"
            onClick={() => dispatch(clearCompanyBankError())}
            className="btn btn-ghost btn-xs btn-square"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Balance highlight strip */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
            <IndianRupee size={20} />
          </span>
          <div>
            <p className="text-[11px] text-base-content/50 font-medium">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-base-content">
              ₹
              {Number(bank.current_balance || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-base-content/50 font-medium">
            Opening Balance
          </p>
          <p className="text-lg font-semibold text-base-content/70">
            ₹
            {Number(bank.opening_balance || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      {/* <div className="tabs tabs-bordered mt-2">
        <button
          className={`tab tab-bordered ${activeTab === "details" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Account Details
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "transactions" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div> */}

      <div className="tabs tabs-bordered mt-2">
        <button
          className={`tab ${activeTab === "details"
              ? "tab-active text-primary !border-primary"
              : "text-base-content/40 hover:text-base-content/70"
            }`}
          onClick={() => setActiveTab("details")}
        >
          Account Details
        </button>

        <button
          className={`tab ${activeTab === "transactions"
              ? "tab-active text-primary !border-primary"
              : "text-base-content/40 hover:text-base-content/70"
            }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bank & Branch */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
                <Landmark size={13} /> Bank & Branch
              </h3>
              <div className="divide-y divide-base-200">
                <InfoRow label="Bank Name" value={bank.bank_name} />
                <InfoRow label="Bank Code" value={bank.bank_code} />
                <InfoRow label="Branch Name" value={bank.branch_name} />
                <InfoRow label="Branch Code" value={bank.branch_code} />
              </div>
            </div>

            {/* Account Details */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
                <BadgeCheck size={13} /> Account Details
              </h3>
              <div className="divide-y divide-base-200">
                <InfoRow
                  label="Account Holder"
                  value={bank.account_holder_name}
                />
                <InfoRow
                  label="Account Number"
                  value={bank.account_number}
                  copyable
                  copied={copiedField === "account_number"}
                  onCopy={() =>
                    handleCopy("account_number", bank.account_number)
                  }
                />
                <InfoRow
                  label="Account Type"
                  value={bank.account_type?.replace(/_/g, " ")}
                />
                <InfoRow
                  label="IFSC Code"
                  value={bank.ifsc_code}
                  copyable
                  copied={copiedField === "ifsc_code"}
                  onCopy={() => handleCopy("ifsc_code", bank.ifsc_code)}
                />
                <InfoRow label="MICR Code" value={bank.micr_code} />
                <InfoRow label="SWIFT Code" value={bank.swift_code} />
              </div>
            </div>

            {/* Digital Payment */}
            {(bank.upi_id || bank.upi_qr_code) && (
              <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
                  <QrCode size={13} /> Digital Payment
                </h3>
                <div className="flex items-center gap-5">
                  {bank.upi_qr_code && (
                    <div
                      onClick={() => setQrModalOpen(true)}
                      className="w-24 h-24 rounded-xl border border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group relative hover:border-primary/50 transition-colors"
                      title="Click to view QR code"
                    >
                      <img
                        src={bank.upi_qr_code}
                        alt="UPI QR"
                        className="w-full h-full object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye size={16} />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 divide-y divide-base-200">
                    <InfoRow
                      label="UPI ID"
                      value={bank.upi_id}
                      copyable
                      copied={copiedField === "upi_id"}
                      onCopy={() => handleCopy("upi_id", bank.upi_id)}
                    />
                  </div>
                </div>
              </div>
            )}

            {bank.remarks && (
              <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                  Remarks
                </h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {bank.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-3">
                Purpose & Flags
              </h3>
              <div className="space-y-2">
                <span className="badge badge-ghost badge-sm font-medium w-full justify-start py-3">
                  {PURPOSE_LABELS[bank.account_purpose] || bank.account_purpose}
                </span>
                {Boolean(bank.is_collection_account) && (
                  <span className="badge badge-info badge-outline badge-sm gap-1 font-medium w-full justify-start py-3">
                    <CircleDot size={10} /> Collection Account
                  </span>
                )}
                {Boolean(bank.is_disbursement_account) && (
                  <span className="badge badge-success badge-outline badge-sm gap-1 font-medium w-full justify-start py-3">
                    <CircleDot size={10} /> Disbursement Account
                  </span>
                )}
                {!bank.is_collection_account &&
                  !bank.is_disbursement_account && (
                    <p className="text-xs text-base-content/30 py-2">
                      No additional flags set.
                    </p>
                  )}
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
                Timeline
              </h3>
              <div className="divide-y divide-base-200">
                <InfoRow
                  label="Opened"
                  value={
                    bank.opened_date
                      ? new Date(bank.opened_date).toLocaleDateString()
                      : null
                  }
                />
                <InfoRow
                  label="Closed"
                  value={
                    bank.closed_date
                      ? new Date(bank.closed_date).toLocaleDateString()
                      : null
                  }
                />
                <InfoRow
                  label="Created"
                  value={
                    bank.created_at
                      ? new Date(bank.created_at).toLocaleString()
                      : null
                  }
                />
                <InfoRow
                  label="Updated"
                  value={
                    bank.updated_at
                      ? new Date(bank.updated_at).toLocaleString()
                      : null
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="mt-4">
          <BankTransactionsPage bankId={bank.id} bankLabel={bankLabel} />
        </div>
      )}

      {/* QR Code Full Modal */}
      {qrModalOpen && bank.upi_qr_code && (
        <dialog className="modal modal-open bg-black/80 backdrop-blur-sm z-50">
          <div className="relative max-w-sm w-full bg-base-100 rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-base-200 mb-3">
              <h3 className="text-sm font-bold text-base-content flex items-center gap-1.5">
                <QrCode size={16} className="text-primary" />
                UPI QR Code
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>
            <div className="w-full bg-white p-4 rounded-xl shadow-inner flex justify-center items-center">
              <img
                src={bank.upi_qr_code}
                alt="UPI QR Code"
                className="max-w-full max-h-72 object-contain"
              />
            </div>
            {bank.upi_id && (
              <p className="text-xs font-mono font-medium text-base-content/70 mt-3 bg-base-200 px-3 py-1 rounded-lg">
                {bank.upi_id}
              </p>
            )}
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setQrModalOpen(false)}
          >
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Edit modal */}
      <CompanyBankFormModal
        open={editModalOpen}
        initialData={bank}
        companyId={bank.company_id}
        loading={formSubmitting}
        error={editModalOpen ? error : null}
        onClose={() => {
          setEditModalOpen(false);
          dispatch(clearCompanyBankError());
        }}
        onSubmit={handleEditSubmit}
      />

      {/* Delete modal */}
      <CompanyBankDeleteModal
        open={deleteModalOpen}
        bank={bank}
        loading={deleteSubmitting}
        error={deleteModalOpen ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
