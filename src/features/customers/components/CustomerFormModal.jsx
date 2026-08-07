import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  User,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";

const GENDER_OPTIONS = ["male", "female", "other"];
const STATUS_OPTIONS = ["active", "inactive", "blocked"];

const DOCUMENT_TYPES = [
  { key: "photo", label: "Photo" },
  { key: "aadhaar", label: "Aadhaar" },
  { key: "pan", label: "PAN" },
  { key: "driving_license", label: "Driving License" },
  { key: "voter_id", label: "Voter ID" },
  { key: "passport", label: "Passport" },
  { key: "ration_card", label: "Ration Card" },
  { key: "bank_passbook", label: "Bank Passbook" },
  { key: "salary_slip", label: "Salary Slip" },
  { key: "electricity_bill", label: "Electricity Bill" },
  { key: "gas_bill", label: "Gas Bill" },
  { key: "other", label: "Other" },
];

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

const emptyDocState = () =>
  Object.fromEntries(
    DOCUMENT_TYPES.map(({ key }) => [
      key,
      { file: null, document_number: "", existing: null },
    ]),
  );

const TABS = [
  { key: "details", label: "Customer Details", icon: User },
  { key: "documents", label: "Documents", icon: FileCheck2 },
];

/**
 * CustomerFormModal
 *
 * Single multipart submission handles BOTH customer fields and document
 * uploads in one request — works for create and edit.
 *
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create, {...customer, documents:[]} = edit
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with a FormData instance
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
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [docs, setDocs] = useState(emptyDocState());
  const fileInputRefs = useRef({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!open) return;
    setActiveTab("details");
    setFieldErrors({});

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

      // Pre-fill "existing" doc info so the Documents tab shows what's already uploaded
      const nextDocs = emptyDocState();

      if (initialData.photo && nextDocs["photo"]) {
        const photoUrl = initialData.photo;
        nextDocs["photo"] = {
          file: null,
          document_number: "",
          existing: {
            file_name: photoUrl.split("/").pop() || "photo.jpg",
            url: photoUrl,
            verified: 1,
          },
        };
      }

      (initialData.documents || []).forEach((d) => {
        if (nextDocs[d.document_type]) {
          const docUrl = d.file_name || d.url;
          nextDocs[d.document_type] = {
            file: null,
            document_number: d.document_number || "",
            existing: {
              file_name: docUrl ? docUrl.split("/").pop() : "document",
              url: docUrl,
              verified: d.verified,
            },
          };
        }
      });
      setDocs(nextDocs);
    } else {
      setForm(emptyForm);
      setDocs(emptyDocState());
    }
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleDocFile = (docType) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], file },
    }));
    e.target.value = "";
  };

  const handleDocNumberChange = (docType) => (e) => {
    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], document_number: e.target.value },
    }));
  };

  const clearDocFile = (docType) => {
    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], file: null },
    }));
  };

  const validateDetails = () => {
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
    if (form.reference_mobile && !/^\d{10}$/.test(form.reference_mobile.trim()))
      errors.reference_mobile = "Enter a valid 10-digit mobile";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToDocuments = () => {
    if (!validateDetails()) return;
    setActiveTab("documents");
  };

  const goToDetails = () => setActiveTab("details");

  const buildFormData = () => {
    const fd = new FormData();

    // Customer fields
    const payload = {
      ...form,
      pan_no: form.pan_no ? form.pan_no.toUpperCase() : "",
      monthly_income: form.monthly_income ? Number(form.monthly_income) : 0,
    };
    Object.entries(payload).forEach(([key, value]) => {
      fd.append(
        key,
        value === "" || value === null || value === undefined ? "" : value,
      );
    });

    // Document files + numbers — backend Multer expects fields named docType
    // e.g. "photo", "aadhaar", "pan", "voter_id", etc.
    Object.entries(docs).forEach(([docType, entry]) => {
      if (entry.file) {
        fd.append(docType, entry.file);
      }
      if (entry.document_number) {
        fd.append(`${docType}_number`, entry.document_number);
      }
    });

    return fd;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "details") {
      goToDocuments();
      return;
    }
    if (!validateDetails()) {
      setActiveTab("details");
      return;
    }
    onSubmit(buildFormData());
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  const uploadedCount = Object.values(docs).filter(
    (d) => d.file || d.existing,
  ).length;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
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

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-base-200">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isDone = tab.key === "details" && activeTab === "documents";
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  tab.key === "details" ? goToDetails() : goToDocuments()
                }
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/40 hover:text-base-content/70"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : isDone
                        ? "bg-success text-success-content"
                        : "bg-base-300 text-base-content/50"
                  }`}
                >
                  {isDone ? <CheckCircle2 size={11} /> : i + 1}
                </span>
                <Icon size={13} />
                {tab.label}
                {tab.key === "documents" && uploadedCount > 0 && (
                  <span className="badge badge-primary badge-xs font-bold">
                    {uploadedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mx-6 mt-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {/* ───────── TAB 1: Customer Details ───────── */}
            {activeTab === "details" && (
              <div className="space-y-5">
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={form.mobile}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          handleChange("mobile")(e);
                        }}
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={form.alternate_mobile}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          handleChange("alternate_mobile")(e);
                        }}
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        value={form.aadhaar_no}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          handleChange("aadhaar_no")(e);
                        }}
                        className={inputClass("aadhaar_no")}
                        placeholder="12-digit number"
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
                        <span className="label-text text-xs font-semibold">
                          City
                        </span>
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          handleChange("pincode")(e);
                        }}
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={form.reference_mobile}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          handleChange("reference_mobile")(e);
                        }}
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
              </div>
            )}

            {/* ───────── TAB 2: Documents ───────── */}
            {activeTab === "documents" && (
              <div className="space-y-1">
                <p className="text-xs text-base-content/50 mb-3">
                  Upload KYC documents now, or skip and add them later from the
                  customer's profile.
                </p>

                <div className="rounded-xl border border-base-300 divide-y divide-base-200 overflow-hidden">
                  {DOCUMENT_TYPES.map(({ key, label }) => {
                    const entry = docs[key];
                    const hasNew = Boolean(entry?.file);
                    const hasExisting = Boolean(entry?.existing);

                    // Check if file is viewable image
                    const isNewImage =
                      hasNew && entry.file.type.startsWith("image/");
                    const isExistingImage =
                      hasExisting &&
                      entry.existing?.file_name?.match(
                        /\.(jpeg|jpg|gif|png|webp)$/i,
                      );
                    const isViewable =
                      isNewImage || (isExistingImage && entry.existing?.url);

                    // Handle View Image action
                    const handleView = () => {
                      if (isNewImage) {
                        setPreviewImage({
                          src: URL.createObjectURL(entry.file),
                          title: `${label} - ${entry.file.name}`,
                        });
                      } else if (isExistingImage && entry.existing.url) {
                        setPreviewImage({
                          src: entry.existing.url,
                          title: `${label} - ${entry.existing.file_name}`,
                        });
                      }
                    };

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200/40 transition-colors"
                      >
                        {/* Document Label */}
                        <div className="w-36 shrink-0">
                          <span className="text-xs font-semibold text-base-content">
                            {label}
                          </span>
                        </div>

                        {/* Document Status / Details */}
                        <div className="flex-1 min-w-0 flex items-center gap-2 text-xs">
                          {hasNew ? (
                            <>
                              {isNewImage ? (
                                <div
                                  onClick={handleView}
                                  className="w-7 h-7 rounded object-cover cursor-pointer hover:opacity-80 border border-base-300 overflow-hidden shrink-0"
                                  title="Click to view"
                                >
                                  <img
                                    src={URL.createObjectURL(entry.file)}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <UploadCloud
                                  size={14}
                                  className="text-primary shrink-0"
                                />
                              )}

                              <span
                                onClick={isViewable ? handleView : undefined}
                                className={`truncate text-base-content/70 ${isViewable ? "cursor-pointer hover:underline hover:text-primary" : ""}`}
                              >
                                {entry.file.name}
                              </span>

                              <span className="badge badge-primary badge-xs font-medium shrink-0">
                                New
                              </span>
                            </>
                          ) : hasExisting ? (
                            <>
                              {isExistingImage && entry.existing.url ? (
                                <div
                                  onClick={handleView}
                                  className="w-7 h-7 rounded object-cover cursor-pointer hover:opacity-80 border border-base-300 overflow-hidden shrink-0"
                                  title="Click to view"
                                >
                                  <img
                                    src={entry.existing.url}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : entry.existing.verified ? (
                                <CheckCircle2
                                  size={14}
                                  className="text-success shrink-0"
                                />
                              ) : (
                                <AlertTriangle
                                  size={14}
                                  className="text-warning shrink-0"
                                />
                              )}

                              <span
                                onClick={isViewable ? handleView : undefined}
                                className={`truncate text-base-content/70 ${isViewable ? "cursor-pointer hover:underline hover:text-primary" : ""}`}
                              >
                                {entry.existing.file_name}
                              </span>

                              <span
                                className={`badge badge-xs font-medium shrink-0 ${
                                  entry.existing.verified
                                    ? "badge-success badge-outline"
                                    : "badge-warning badge-outline"
                                }`}
                              >
                                {entry.existing.verified
                                  ? "Verified"
                                  : "Pending"}
                              </span>
                            </>
                          ) : (
                            <span className="text-base-content/30 italic">
                              No file selected
                            </span>
                          )}
                        </div>

                        {/* Optional Document Number Input */}
                        <input
                          type="text"
                          value={entry?.document_number || ""}
                          onChange={handleDocNumberChange(key)}
                          placeholder="Doc no. (optional)"
                          className="input input-bordered input-xs rounded-lg w-32 shrink-0 hidden sm:block"
                        />

                        {/* Hidden File Input */}
                        <input
                          ref={(el) => (fileInputRefs.current[key] = el)}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleDocFile(key)}
                        />

                        {/* Action Buttons: View, Upload, Cancel */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* VIEW BUTTON */}
                          {isViewable && (
                            <button
                              type="button"
                              onClick={handleView}
                              className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10"
                              title="View image"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {/* UPLOAD / REPLACE BUTTON */}
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[key]?.click()}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:bg-base-200"
                            title={
                              hasNew || hasExisting
                                ? "Replace file"
                                : "Choose file"
                            }
                          >
                            <UploadCloud size={14} />
                          </button>

                          {/* CANCEL / REMOVE BUTTON */}
                          {(hasNew || hasExisting) && (
                            <button
                              type="button"
                              onClick={() => clearDocFile(key)}
                              className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                              title="Cancel / Remove file"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* High-Quality Image Preview & Viewer Modal */}
                {previewImage && (
                  <dialog className="modal modal-open bg-black/80 backdrop-blur-sm z-50">
                    <div className="relative max-w-4xl w-full bg-base-100 rounded-2xl shadow-2xl overflow-hidden p-4 flex flex-col items-center">
                      {/* Modal Header */}
                      <div className="w-full flex items-center justify-between pb-3 border-b border-base-200 mb-4">
                        <h3 className="text-sm font-bold text-base-content truncate pr-4">
                          {previewImage.title}
                        </h3>
                        <button
                          onClick={() => setPreviewImage(null)}
                          className="btn btn-sm btn-circle btn-ghost"
                          title="Close (ESC)"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* High-Quality Image Display */}
                      <div className="w-full max-h-[75vh] flex justify-center items-center bg-base-200/50 rounded-xl overflow-auto p-2">
                        <img
                          src={previewImage.src}
                          alt="High Quality Document"
                          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                        />
                      </div>

                      {/* Modal Footer / Cancel Action */}
                      <div className="w-full flex justify-end pt-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="btn btn-sm btn-ghost"
                        >
                          Cancel / Close
                        </button>
                      </div>
                    </div>

                    {/* Backdrop click to cancel */}
                    <form
                      method="dialog"
                      className="modal-backdrop"
                      onClick={() => setPreviewImage(null)}
                    >
                      <button>close</button>
                    </form>
                  </dialog>
                )}
              </div>
            )}
          </div>

          {/* Footer / navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-base-200 bg-base-100">
            <div>
              {activeTab === "documents" && (
                <button
                  type="button"
                  onClick={goToDetails}
                  className="btn btn-ghost btn-sm rounded-lg gap-1.5"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm rounded-lg"
              >
                Cancel
              </button>

              {activeTab === "details" ? (
                <button
                  type="submit"
                  className="btn btn-primary btn-sm rounded-lg gap-1.5"
                >
                  Next: Documents
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm rounded-lg gap-1.5"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {isEdit ? "Save Changes" : "Create Customer"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
