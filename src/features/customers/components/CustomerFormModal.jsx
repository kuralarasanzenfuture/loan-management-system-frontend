import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const GENDER_OPTIONS = ["male", "female", "other"];
const STATUS_OPTIONS = ["active", "inactive", "blocked"];

const emptyForm = {
  first_name: "",
  last_name: "",
  father_name: "",
  mother_name: "",
  mobile: "",
  alternate_mobile: "",
  aadhaar_no: "",
  pan_no: "",
  dob: "",
  gender: "",
  occupation: "",
  monthly_income: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  reference_name: "",
  reference_mobile: "",
  remarks: "",
  status: "active",
};

/**
 * CustomerFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create, {...customer} = edit
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with form data
 */
export default function CustomerFormModal({
  open,
  initialData,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        father_name: initialData.father_name || "",
        mother_name: initialData.mother_name || "",
        mobile: initialData.mobile || "",
        alternate_mobile: initialData.alternate_mobile || "",
        aadhaar_no: initialData.aadhaar_no || "",
        pan_no: initialData.pan_no || "",
        dob: initialData.dob ? initialData.dob.slice(0, 10) : "",
        gender: initialData.gender || "",
        occupation: initialData.occupation || "",
        monthly_income: initialData.monthly_income || "",
        address: initialData.address || "",
        city: initialData.city || "",
        district: initialData.district || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
        reference_name: initialData.reference_name || "",
        reference_mobile: initialData.reference_mobile || "",
        remarks: initialData.remarks || "",
        status: initialData.status || "active",
      });
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.first_name.trim()) errors.first_name = "First name is required";
    if (!form.mobile.trim()) errors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim()))
      errors.mobile = "Enter a valid 10-digit mobile";
    if (form.alternate_mobile && !/^\d{10}$/.test(form.alternate_mobile.trim()))
      errors.alternate_mobile = "Enter a valid 10-digit mobile";
    if (form.aadhaar_no && !/^\d{12}$/.test(form.aadhaar_no.trim()))
      errors.aadhaar_no = "Aadhaar must be 12 digits";
    if (
      form.pan_no &&
      !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan_no.trim().toUpperCase())
    )
      errors.pan_no = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
      errors.pincode = "Pincode must be 6 digits";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      pan_no: form.pan_no ? form.pan_no.toUpperCase() : "",
      monthly_income: form.monthly_income ? Number(form.monthly_income) : 0,
    };
    // Strip empty optional strings to null so they don't clash with UNIQUE constraints
    [
      "last_name",
      "father_name",
      "mother_name",
      "alternate_mobile",
      "aadhaar_no",
      "pan_no",
      "dob",
      "gender",
      "occupation",
      "address",
      "city",
      "district",
      "state",
      "pincode",
      "reference_name",
      "reference_mobile",
      "remarks",
    ].forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    onSubmit(payload);
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
          <div>
            <h3 className="font-bold text-lg">
              {isEdit ? "Edit Customer" : "New Customer"}
            </h3>
            {isEdit && (
              <p className="text-xs text-base-content/40 mt-0.5">
                {initialData.customer_no}
              </p>
            )}
          </div>
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
          {/* Personal Info */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Personal Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    First Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={handleChange("first_name")}
                  className={inputClass("first_name")}
                  placeholder="Ravi"
                />
                <FieldError field="first_name" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={handleChange("last_name")}
                  className={inputClass("last_name")}
                  placeholder="Kumar"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Father's Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.father_name}
                  onChange={handleChange("father_name")}
                  className={inputClass("father_name")}
                  placeholder="Ramesh"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Mother's Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.mother_name}
                  onChange={handleChange("mother_name")}
                  className={inputClass("mother_name")}
                  placeholder="Lakshmi"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Date of Birth
                  </span>
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={handleChange("dob")}
                  className={inputClass("dob")}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Gender
                  </span>
                </label>
                <select
                  value={form.gender}
                  onChange={handleChange("gender")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g} className="capitalize">
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Occupation
                  </span>
                </label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={handleChange("occupation")}
                  className={inputClass("occupation")}
                  placeholder="Engineer"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Monthly Income
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthly_income}
                  onChange={handleChange("monthly_income")}
                  className={inputClass("monthly_income")}
                  placeholder="50000"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Contact
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Mobile *
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange("mobile")}
                  className={inputClass("mobile")}
                  placeholder="9876543210"
                />
                <FieldError field="mobile" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Alternate Mobile
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.alternate_mobile}
                  onChange={handleChange("alternate_mobile")}
                  className={inputClass("alternate_mobile")}
                  placeholder="9123456780"
                />
                <FieldError field="alternate_mobile" />
              </div>
            </div>
          </section>

          {/* Identity */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Identity
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Aadhaar Number
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={form.aadhaar_no}
                  onChange={handleChange("aadhaar_no")}
                  className={inputClass("aadhaar_no")}
                  placeholder="123456789012"
                />
                <FieldError field="aadhaar_no" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    PAN Number
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={form.pan_no}
                  onChange={handleChange("pan_no")}
                  className={`${inputClass("pan_no")} uppercase`}
                  placeholder="ABCDE1234F"
                />
                <FieldError field="pan_no" />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Address
            </h4>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Street Address
                </span>
              </label>
              <textarea
                value={form.address}
                onChange={handleChange("address")}
                rows={2}
                className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                placeholder="12, Anna Nagar"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">City</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange("city")}
                  className={inputClass("city")}
                  placeholder="Chennai"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    District
                  </span>
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={handleChange("district")}
                  className={inputClass("district")}
                  placeholder="Chennai"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    State
                  </span>
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={handleChange("state")}
                  className={inputClass("state")}
                  placeholder="Tamil Nadu"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Pincode
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange("pincode")}
                  className={inputClass("pincode")}
                  placeholder="600040"
                />
                <FieldError field="pincode" />
              </div>
            </div>
          </section>

          {/* Reference */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Reference
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Reference Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.reference_name}
                  onChange={handleChange("reference_name")}
                  className={inputClass("reference_name")}
                  placeholder="Suresh"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Reference Mobile
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.reference_mobile}
                  onChange={handleChange("reference_mobile")}
                  className={inputClass("reference_mobile")}
                  placeholder="9988776655"
                />
              </div>
            </div>
          </section>

          {/* Other */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Other
            </h4>
            <div className="grid grid-cols-2 gap-3">
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
                  placeholder="Good customer"
                />
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
              {isEdit ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
