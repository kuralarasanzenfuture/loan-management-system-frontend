import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  FileText,
  Phone,
  MapPin,
  Clock,
  Palette,
  Share2,
  Loader2,
  Save,
} from "lucide-react";
import {
  addCompanyDetails,
  editCompanyDetails,
  clearCompanyDetailsError,
} from "../../../redux/companyDetails/companyDetailsSlice.js";
import BrandingUploadTile from "../components/BrandingUploadTile.jsx";

const BUSINESS_TYPES = [
  "proprietorship",
  "partnership",
  "llp",
  "private_limited",
  "public_limited",
  "trust",
  "society",
  "other",
];

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  company_name: "",
  legal_name: "",
  trade_name: "",
  business_type: "proprietorship",
  business_description: "",
  establishment_date: "",
  gst_number: "",
  pan_number: "",
  phone: "",
  alternate_phone: "",
  email: "",
  alternate_email: "",
  website: "",
  address_line_1: "",
  address_line_2: "",
  landmark: "",
  city: "",
  taluk: "",
  district: "",
  state: "",
  state_code: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
  business_start_time: "",
  business_end_time: "",
  working_days: [],
  weekly_off_day: "",
  timezone: "Asia/Kolkata",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  whatsapp_number: "",
  status: "active",
};

const TABS = [
  { key: "basic", label: "Basic Info", icon: Building2 },
  { key: "registration", label: "Registration", icon: FileText },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "address", label: "Address", icon: MapPin },
  { key: "hours", label: "Business Hours", icon: Clock },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "social", label: "Social", icon: Share2 },
];

/**
 * CompanyDetailsFormPage
 * Props:
 * - initialData (object|null) : null = create (first-time setup), {...record} = edit
 */
export default function CompanyDetailsFormPage({ initialData, onCancel }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.companyDetails);

  const isEdit = Boolean(initialData?.id);
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [images, setImages] = useState({
    logo: null,
    favicon: null,
    stamp_image: null,
    signature_image: null,
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        company_name: initialData.company_name || "",
        legal_name: initialData.legal_name || "",
        trade_name: initialData.trade_name || "",
        business_type: initialData.business_type || "proprietorship",
        business_description: initialData.business_description || "",
        establishment_date: initialData.establishment_date
          ? initialData.establishment_date.slice(0, 10)
          : "",
        gst_number: initialData.gst_number || "",
        pan_number: initialData.pan_number || "",
        phone: initialData.phone || "",
        alternate_phone: initialData.alternate_phone || "",
        email: initialData.email || "",
        alternate_email: initialData.alternate_email || "",
        website: initialData.website || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        landmark: initialData.landmark || "",
        city: initialData.city || "",
        taluk: initialData.taluk || "",
        district: initialData.district || "",
        state: initialData.state || "",
        state_code: initialData.state_code || "",
        country: initialData.country || "India",
        pincode: initialData.pincode || "",
        latitude: initialData.latitude ?? "",
        longitude: initialData.longitude ?? "",
        business_start_time: initialData.business_start_time || "",
        business_end_time: initialData.business_end_time || "",
        working_days: initialData.working_days
          ? initialData.working_days.split(",").map((d) => d.trim())
          : [],
        weekly_off_day: initialData.weekly_off_day || "",
        timezone: initialData.timezone || "Asia/Kolkata",
        facebook_url: initialData.facebook_url || "",
        instagram_url: initialData.instagram_url || "",
        youtube_url: initialData.youtube_url || "",
        whatsapp_number: initialData.whatsapp_number || "",
        status: initialData.status || "active",
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const handleImageChange = (key) => (file) => {
    setImages((prev) => ({ ...prev, [key]: file }));
  };

  const handleImageClear = (key) => {
    setImages((prev) => ({ ...prev, [key]: null }));
    // Also signal removal of an existing image on edit, if backend needs it
    setForm((prev) => ({ ...prev, [`remove_${key}`]: true }));
  };

  const existingImageUrls = useMemo(
    () => ({
      logo: initialData?.logo || null,
      favicon: initialData?.favicon || null,
      stamp_image: initialData?.stamp_image || null,
      signature_image: initialData?.signature_image || null,
    }),
    [initialData],
  );

  const validate = () => {
    const errors = {};
    if (!form.company_name.trim())
      errors.company_name = "Company name is required";
    if (
      form.gst_number &&
      !/^[0-9A-Z]{15}$/.test(form.gst_number.trim().toUpperCase())
    )
      errors.gst_number = "Enter a valid 15-character GST number";
    if (
      form.pan_number &&
      !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan_number.trim().toUpperCase())
    )
      errors.pan_number = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      errors.email = "Enter a valid email";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
      errors.pincode = "Pincode must be 6 digits";
    setFieldErrors(errors);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const tabForField = {
    company_name: "basic",
    gst_number: "registration",
    pan_number: "registration",
    email: "contact",
    pincode: "address",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors } = validate();
    if (!valid) {
      const firstErrorField = Object.keys(errors)[0];
      setActiveTab(tabForField[firstErrorField] || "basic");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "working_days") {
        fd.append(key, value.join(","));
      } else if (key.startsWith("remove_")) {
        return; // handled separately below
      } else {
        fd.append(key, value === "" || value === null ? "" : value);
      }
    });
    if (form.gst_number) fd.set("gst_number", form.gst_number.toUpperCase());
    if (form.pan_number) fd.set("pan_number", form.pan_number.toUpperCase());

    Object.entries(images).forEach(([key, file]) => {
      if (file) fd.append(key, file);
    });
    Object.keys(form)
      .filter((k) => k.startsWith("remove_"))
      .forEach((k) => {
        if (form[k]) fd.append(k, "true");
      });

    const action = isEdit
      ? await dispatch(editCompanyDetails({ id: initialData.id, formData: fd }))
      : await dispatch(addCompanyDetails(fd));

    const wasFulfilled = isEdit
      ? editCompanyDetails.fulfilled.match(action)
      : addCompanyDetails.fulfilled.match(action);

    if (wasFulfilled) {
      if (onCancel) {
        onCancel(); // Return to view mode (inline edit)
      } else {
        navigate("/companies-details");
      }
    }
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            {isEdit ? "Edit Company Details" : "Company Setup"}
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            This information appears on invoices, receipts, and borrower-facing
            documents.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 border-b border-base-200 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/40 hover:text-base-content/70"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[62vh] overflow-y-auto">
            {/* Basic Info */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Company Name *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={handleChange("company_name")}
                    className={inputClass("company_name")}
                    placeholder="Meridian Lending Pvt Ltd"
                  />
                  <FieldError field="company_name" />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Legal Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.legal_name}
                    onChange={handleChange("legal_name")}
                    className={inputClass("legal_name")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Trade Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.trade_name}
                    onChange={handleChange("trade_name")}
                    className={inputClass("trade_name")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Business Type
                    </span>
                  </label>
                  <select
                    value={form.business_type}
                    onChange={handleChange("business_type")}
                    className="select select-bordered select-sm rounded-lg w-full capitalize"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Establishment Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.establishment_date}
                    onChange={handleChange("establishment_date")}
                    className={inputClass("establishment_date")}
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-control col-span-2">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Business Description
                    </span>
                  </label>
                  <textarea
                    value={form.business_description}
                    onChange={handleChange("business_description")}
                    rows={3}
                    className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                  />
                </div>
              </div>
            )}

            {/* Registration */}
            {activeTab === "registration" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      GST Number
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={form.gst_number}
                    onChange={handleChange("gst_number")}
                    className={`${inputClass("gst_number")} uppercase`}
                    placeholder="29ABCDE1234F1Z5"
                  />
                  <FieldError field="gst_number" />
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
                    value={form.pan_number}
                    onChange={handleChange("pan_number")}
                    className={`${inputClass("pan_number")} uppercase`}
                    placeholder="ABCDE1234F"
                  />
                  <FieldError field="pan_number" />
                </div>
              </div>
            )}

            {/* Contact */}
            {activeTab === "contact" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className={inputClass("phone")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Alternate Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.alternate_phone}
                    onChange={handleChange("alternate_phone")}
                    className={inputClass("alternate_phone")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className={inputClass("email")}
                  />
                  <FieldError field="email" />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Alternate Email
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.alternate_email}
                    onChange={handleChange("alternate_email")}
                    className={inputClass("alternate_email")}
                  />
                </div>
                <div className="form-control col-span-2">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Website
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={handleChange("website")}
                    className={inputClass("website")}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}

            {/* Address */}
            {activeTab === "address" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control col-span-2">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Address Line 1
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.address_line_1}
                    onChange={handleChange("address_line_1")}
                    className={inputClass("address_line_1")}
                  />
                </div>
                <div className="form-control col-span-2">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Address Line 2
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.address_line_2}
                    onChange={handleChange("address_line_2")}
                    className={inputClass("address_line_2")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Landmark
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={handleChange("landmark")}
                    className={inputClass("landmark")}
                  />
                </div>
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
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Taluk
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.taluk}
                    onChange={handleChange("taluk")}
                    className={inputClass("taluk")}
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
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      State Code
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.state_code}
                    onChange={handleChange("state_code")}
                    className={inputClass("state_code")}
                    placeholder="29"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Country
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={handleChange("country")}
                    className={inputClass("country")}
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
                  />
                  <FieldError field="pincode" />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Latitude
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.latitude}
                    onChange={handleChange("latitude")}
                    className={inputClass("latitude")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Longitude
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.longitude}
                    onChange={handleChange("longitude")}
                    className={inputClass("longitude")}
                  />
                </div>
              </div>
            )}

            {/* Business Hours */}
            {activeTab === "hours" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-xs font-semibold">
                        Opening Time
                      </span>
                    </label>
                    <input
                      type="time"
                      value={form.business_start_time}
                      onChange={handleChange("business_start_time")}
                      className={inputClass("business_start_time")}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-xs font-semibold">
                        Closing Time
                      </span>
                    </label>
                    <input
                      type="time"
                      value={form.business_end_time}
                      onChange={handleChange("business_end_time")}
                      className={inputClass("business_end_time")}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Working Days
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          form.working_days.includes(day)
                            ? "bg-primary text-primary-content border-primary"
                            : "border-base-300 text-base-content/60 hover:bg-base-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-xs font-semibold">
                        Weekly Off Day
                      </span>
                    </label>
                    <select
                      value={form.weekly_off_day}
                      onChange={handleChange("weekly_off_day")}
                      className="select select-bordered select-sm rounded-lg w-full"
                    >
                      <option value="">None</option>
                      {WEEK_DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-xs font-semibold">
                        Timezone
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.timezone}
                      onChange={handleChange("timezone")}
                      className={inputClass("timezone")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === "branding" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <BrandingUploadTile
                  label="Logo"
                  hint="PNG/SVG, transparent bg"
                  file={images.logo}
                  existingUrl={existingImageUrls.logo}
                  onChange={handleImageChange("logo")}
                  onClear={() => handleImageClear("logo")}
                />
                <BrandingUploadTile
                  label="Favicon"
                  hint="32x32 or 64x64px"
                  file={images.favicon}
                  existingUrl={existingImageUrls.favicon}
                  onChange={handleImageChange("favicon")}
                  onClear={() => handleImageClear("favicon")}
                />
                <BrandingUploadTile
                  label="Stamp"
                  hint="For printed documents"
                  file={images.stamp_image}
                  existingUrl={existingImageUrls.stamp_image}
                  onChange={handleImageChange("stamp_image")}
                  onClear={() => handleImageClear("stamp_image")}
                />
                <BrandingUploadTile
                  label="Signature"
                  hint="Authorized signatory"
                  file={images.signature_image}
                  existingUrl={existingImageUrls.signature_image}
                  onChange={handleImageChange("signature_image")}
                  onClear={() => handleImageClear("signature_image")}
                />
              </div>
            )}

            {/* Social */}
            {activeTab === "social" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Facebook URL
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.facebook_url}
                    onChange={handleChange("facebook_url")}
                    className={inputClass("facebook_url")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Instagram URL
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.instagram_url}
                    onChange={handleChange("instagram_url")}
                    className={inputClass("instagram_url")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      YouTube URL
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.youtube_url}
                    onChange={handleChange("youtube_url")}
                    className={inputClass("youtube_url")}
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      WhatsApp Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={handleChange("whatsapp_number")}
                    className={inputClass("whatsapp_number")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-100">
            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : navigate(-1))}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isEdit ? "Save Changes" : "Save Company Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
