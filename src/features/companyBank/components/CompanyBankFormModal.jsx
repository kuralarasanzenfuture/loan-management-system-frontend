import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Landmark, UploadCloud, QrCode } from "lucide-react";

const ACCOUNT_TYPES = [
  "savings",
  "current",
  "cash_credit",
  "overdraft",
  "other",
];
const ACCOUNT_PURPOSES = [
  "business",
  "collection",
  "loan_disbursement",
  "expenses",
  "salary",
  "savings",
  "other",
];
const STATUS_OPTIONS = ["active", "inactive", "closed"];

const emptyForm = {
  bank_name: "",
  bank_code: "",
  branch_name: "",
  branch_code: "",
  account_holder_name: "",
  account_number: "",
  account_type: "current",
  ifsc_code: "",
  micr_code: "",
  swift_code: "",
  opening_balance: "",
  current_balance: "",
  upi_id: "",
  account_purpose: "business",
  is_collection_account: false,
  is_disbursement_account: false,
  status: "active",
  opened_date: "",
  remarks: "",
};

/**
 * CompanyBankFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null = create, {...bank} = edit
 * - companyId (number)         : required on create
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with a FormData instance
 */
export default function CompanyBankFormModal({
  open,
  initialData,
  companyId,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [qrFile, setQrFile] = useState(null);
  const qrInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        bank_name: initialData.bank_name || "",
        bank_code: initialData.bank_code || "",
        branch_name: initialData.branch_name || "",
        branch_code: initialData.branch_code || "",
        account_holder_name: initialData.account_holder_name || "",
        account_number: initialData.account_number || "",
        account_type: initialData.account_type || "current",
        ifsc_code: initialData.ifsc_code || "",
        micr_code: initialData.micr_code || "",
        swift_code: initialData.swift_code || "",
        opening_balance: initialData.opening_balance ?? "",
        current_balance: initialData.current_balance ?? "",
        upi_id: initialData.upi_id || "",
        account_purpose: initialData.account_purpose || "business",
        is_collection_account: Boolean(initialData.is_collection_account),
        is_disbursement_account: Boolean(initialData.is_disbursement_account),
        status: initialData.status || "active",
        opened_date: initialData.opened_date
          ? initialData.opened_date.slice(0, 10)
          : "",
        remarks: initialData.remarks || "",
      });
    } else {
      setForm(emptyForm);
    }
    setQrFile(null);
    setFieldErrors({});
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleCheckbox = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setQrFile(file);
    e.target.value = "";
  };

  const validate = () => {
    const errors = {};
    if (!form.bank_name.trim()) errors.bank_name = "Bank name is required";
    if (!form.account_holder_name.trim())
      errors.account_holder_name = "Account holder name is required";
    if (!form.account_number.trim())
      errors.account_number = "Account number is required";
    else if (!/^\d{6,20}$/.test(form.account_number.trim()))
      errors.account_number = "Enter a valid account number";
    if (
      form.ifsc_code &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.trim().toUpperCase())
    )
      errors.ifsc_code = "Enter a valid IFSC code (e.g. HDFC0001234)";
    if (
      form.upi_id &&
      !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(form.upi_id.trim())
    )
      errors.upi_id = "Enter a valid UPI ID (e.g. name@bank)";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    if (!isEdit) fd.append("company_id", companyId);

    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        fd.append(key, value ? "1" : "0");
      } else if (key === "ifsc_code") {
        fd.append(key, value ? value.toUpperCase() : "");
      } else {
        fd.append(key, value === "" || value === null ? "" : value);
      }
    });

    if (qrFile) fd.append("upi_qr_code", qrFile);

    onSubmit(fd);
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Landmark size={18} className="text-primary" />
            {isEdit ? "Edit Bank Account" : "New Bank Account"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Bank Info */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Bank Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Bank Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={handleChange("bank_name")}
                  className={inputClass("bank_name")}
                  placeholder="HDFC Bank"
                />
                <FieldError field="bank_name" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Bank Code
                  </span>
                </label>
                <input
                  type="text"
                  value={form.bank_code}
                  onChange={handleChange("bank_code")}
                  className={inputClass("bank_code")}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Branch Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.branch_name}
                  onChange={handleChange("branch_name")}
                  className={inputClass("branch_name")}
                  placeholder="Anna Nagar"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Branch Code
                  </span>
                </label>
                <input
                  type="text"
                  value={form.branch_code}
                  onChange={handleChange("branch_code")}
                  className={inputClass("branch_code")}
                />
              </div>
            </div>
          </section>

          {/* Account Details */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Account Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Account Holder Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.account_holder_name}
                  onChange={handleChange("account_holder_name")}
                  className={inputClass("account_holder_name")}
                  placeholder="Meridian Lending Pvt Ltd"
                />
                <FieldError field="account_holder_name" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Account Number *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.account_number}
                  onChange={handleChange("account_number")}
                  className={inputClass("account_number")}
                  placeholder="50100123456789"
                />
                <FieldError field="account_number" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Account Type
                  </span>
                </label>
                <select
                  value={form.account_type}
                  onChange={handleChange("account_type")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    IFSC Code
                  </span>
                </label>
                <input
                  type="text"
                  value={form.ifsc_code}
                  onChange={handleChange("ifsc_code")}
                  className={`${inputClass("ifsc_code")} uppercase`}
                  placeholder="HDFC0001234"
                />
                <FieldError field="ifsc_code" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    MICR Code
                  </span>
                </label>
                <input
                  type="text"
                  value={form.micr_code}
                  onChange={handleChange("micr_code")}
                  className={inputClass("micr_code")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    SWIFT Code
                  </span>
                </label>
                <input
                  type="text"
                  value={form.swift_code}
                  onChange={handleChange("swift_code")}
                  className={inputClass("swift_code")}
                  placeholder="For international transfers"
                />
              </div>
            </div>
          </section>

          {/* Balance */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Balance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Opening Balance (₹)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.opening_balance}
                  onChange={handleChange("opening_balance")}
                  className={inputClass("opening_balance")}
                  placeholder="0.00"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Current Balance (₹)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.current_balance}
                  onChange={handleChange("current_balance")}
                  className={inputClass("current_balance")}
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Digital Payment */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Digital Payment
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    UPI ID
                  </span>
                </label>
                <input
                  type="text"
                  value={form.upi_id}
                  onChange={handleChange("upi_id")}
                  className={inputClass("upi_id")}
                  placeholder="meridian@hdfcbank"
                />
                <FieldError field="upi_id" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    UPI QR Code
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg border border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden shrink-0">
                    {qrFile ? (
                      <img
                        src={URL.createObjectURL(qrFile)}
                        alt="QR"
                        className="w-full h-full object-contain"
                      />
                    ) : initialData?.upi_qr_code ? (
                      <img
                        src={initialData.upi_qr_code}
                        alt="QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode size={16} className="text-base-content/30" />
                    )}
                  </div>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrChange}
                  />
                  <button
                    type="button"
                    onClick={() => qrInputRef.current?.click()}
                    className="btn btn-ghost btn-xs rounded-lg gap-1.5"
                  >
                    <UploadCloud size={12} /> Upload
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Purpose & Flags */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Purpose
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Account Purpose
                  </span>
                </label>
                <select
                  value={form.account_purpose}
                  onChange={handleChange("account_purpose")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {ACCOUNT_PURPOSES.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Status
                  </span>
                </label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.is_collection_account}
                  onChange={handleCheckbox("is_collection_account")}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                Collection Account
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.is_disbursement_account}
                  onChange={handleCheckbox("is_disbursement_account")}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                Disbursement Account
              </label>
            </div>
          </section>

          {/* Other */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Other
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Opened Date
                  </span>
                </label>
                <input
                  type="date"
                  value={form.opened_date}
                  onChange={handleChange("opened_date")}
                  className={inputClass("opened_date")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Remarks
                  </span>
                </label>
                <textarea
                  value={form.remarks}
                  onChange={handleChange("remarks")}
                  rows={2}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="modal-action mt-6 sticky bottom-0 bg-base-100 pt-3 -mb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Bank Account"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
