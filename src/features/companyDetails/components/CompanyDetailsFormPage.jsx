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
  MessageCircle,
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

const tabForField = {
  company_name: "basic",
  legal_name: "basic",
  trade_name: "basic",
  business_type: "basic",
  establishment_date: "basic",
  status: "basic",
  business_description: "basic",
  gst_number: "registration",
  pan_number: "registration",
  phone: "contact",
  alternate_phone: "contact",
  email: "contact",
  alternate_email: "contact",
  website: "contact",
  address_line_1: "address",
  address_line_2: "address",
  landmark: "address",
  city: "address",
  taluk: "address",
  district: "address",
  state: "address",
  state_code: "address",
  country: "address",
  pincode: "address",
  latitude: "address",
  longitude: "address",
  business_start_time: "hours",
  business_end_time: "hours",
  working_days: "hours",
  weekly_off_day: "hours",
  timezone: "hours",
  facebook_url: "social",
  instagram_url: "social",
  youtube_url: "social",
  whatsapp_number: "social",
};

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
];

export function parsePhoneNumber(raw = "") {
  if (!raw) return { countryCode: "+91", number: "" };
  const str = String(raw).trim();
  for (const c of COUNTRY_CODES) {
    if (str.startsWith(c.code)) {
      const rest = str.slice(c.code.length).replace(/^[ -]+/, "");
      return { countryCode: c.code, number: rest };
    }
  }
  return { countryCode: "+91", number: str.replace(/^\+/, "") };
}

function PhoneInputWithCountry({
  label,
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
  error,
  placeholder = "98765 43210",
  icon,
}) {
  return (
    <div className="form-control">
      <label className="label pb-1">
        <span className="label-text text-xs font-semibold flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </label>
      <div className="join w-full">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="join-item select select-bordered select-sm text-xs font-medium bg-base-200/50 w-28 shrink-0 px-2.5"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d\s-]/g, "");
            onChange(val);
          }}
          placeholder={placeholder}
          className={`join-item input input-bordered input-sm w-full text-xs font-medium ${
            error ? "input-error" : ""
          }`}
        />
      </div>
      {error && <span className="text-[11px] text-error mt-1">{error}</span>}
    </div>
  );
}

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

  // Dedicated phone and country code states
  const [phoneCountry, setPhoneCountry] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [altPhoneCountry, setAltPhoneCountry] = useState("+91");
  const [altPhoneNumber, setAltPhoneNumber] = useState("");

  const [whatsappCountry, setWhatsappCountry] = useState("+91");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    dispatch(clearCompanyDetailsError());
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

      const p = parsePhoneNumber(initialData.phone);
      setPhoneCountry(p.countryCode);
      setPhoneNumber(p.number);

      const ap = parsePhoneNumber(initialData.alternate_phone);
      setAltPhoneCountry(ap.countryCode);
      setAltPhoneNumber(ap.number);

      const wp = parsePhoneNumber(initialData.whatsapp_number);
      setWhatsappCountry(wp.countryCode);
      setWhatsappNumber(wp.number);
    } else {
      setForm(emptyForm);
      setPhoneCountry("+91");
      setPhoneNumber("");
      setAltPhoneCountry("+91");
      setAltPhoneNumber("");
      setWhatsappCountry("+91");
      setWhatsappNumber("");
    }
  }, [isEdit, initialData, dispatch]);

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
      !/^[0-9A-Z]{15}$/i.test(form.gst_number.trim())
    )
      errors.gst_number = "Enter a valid 15-character GST number";
    if (
      form.pan_number &&
      !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.pan_number.trim())
    )
      errors.pan_number = "Enter a valid PAN (e.g. ABCDE1234F)";

    if (phoneNumber.trim()) {
      const clean = phoneNumber.replace(/[\s-]/g, "");
      if (clean.length < 7 || clean.length > 14) {
        errors.phone = "Enter a valid phone number (7 to 14 digits)";
      }
    }
    if (altPhoneNumber.trim()) {
      const clean = altPhoneNumber.replace(/[\s-]/g, "");
      if (clean.length < 7 || clean.length > 14) {
        errors.alternate_phone = "Enter a valid alternate phone number";
      }
    }
    if (whatsappNumber.trim()) {
      const clean = whatsappNumber.replace(/[\s-]/g, "");
      if (clean.length < 7 || clean.length > 14) {
        errors.whatsapp_number = "Enter a valid WhatsApp number";
      }
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address";
    if (form.alternate_email && !/^\S+@\S+\.\S+$/.test(form.alternate_email.trim()))
      errors.alternate_email = "Enter a valid alternate email address";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim()))
      errors.pincode = "Pincode must be 6 digits";
    setFieldErrors(errors);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors } = validate();
    if (!valid) {
      const firstErrorField = Object.keys(errors)[0];
      if (tabForField[firstErrorField]) {
        setActiveTab(tabForField[firstErrorField]);
      }
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "working_days") {
        fd.append(key, Array.isArray(value) ? value.join(",") : "");
      } else if (key.startsWith("remove_")) {
        return;
      } else {
        fd.append(key, value === "" || value === null ? "" : value);
      }
    });

    if (form.gst_number) fd.set("gst_number", form.gst_number.toUpperCase().trim());
    if (form.pan_number) fd.set("pan_number", form.pan_number.toUpperCase().trim());

    // Phone numbers with country code
    const fullPhone = phoneNumber.trim() ? `${phoneCountry} ${phoneNumber.trim()}` : "";
    const fullAltPhone = altPhoneNumber.trim() ? `${altPhoneCountry} ${altPhoneNumber.trim()}` : "";
    const fullWhatsapp = whatsappNumber.trim() ? `${whatsappCountry} ${whatsappNumber.trim()}` : "";

    fd.set("phone", fullPhone);
    fd.set("alternate_phone", fullAltPhone);
    fd.set("whatsapp_number", fullWhatsapp);

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
        onCancel();
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
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong."}
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
                <PhoneInputWithCountry
                  label="Primary Phone"
                  countryCode={phoneCountry}
                  onCountryCodeChange={setPhoneCountry}
                  value={phoneNumber}
                  onChange={(val) => {
                    setPhoneNumber(val);
                    setFieldErrors((prev) => ({ ...prev, phone: null }));
                  }}
                  error={fieldErrors.phone}
                  placeholder="98765 43210"
                />
                <PhoneInputWithCountry
                  label="Alternate Phone"
                  countryCode={altPhoneCountry}
                  onCountryCodeChange={setAltPhoneCountry}
                  value={altPhoneNumber}
                  onChange={(val) => {
                    setAltPhoneNumber(val);
                    setFieldErrors((prev) => ({ ...prev, alternate_phone: null }));
                  }}
                  error={fieldErrors.alternate_phone}
                  placeholder="80 2345 6789"
                />
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
                    type="text"
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
                    type="text"
                    value={form.facebook_url}
                    onChange={handleChange("facebook_url")}
                    className={inputClass("facebook_url")}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Instagram URL
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.instagram_url}
                    onChange={handleChange("instagram_url")}
                    className={inputClass("instagram_url")}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      YouTube URL
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.youtube_url}
                    onChange={handleChange("youtube_url")}
                    className={inputClass("youtube_url")}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
                <PhoneInputWithCountry
                  label="WhatsApp Number"
                  countryCode={whatsappCountry}
                  onCountryCodeChange={setWhatsappCountry}
                  value={whatsappNumber}
                  onChange={(val) => {
                    setWhatsappNumber(val);
                    setFieldErrors((prev) => ({ ...prev, whatsapp_number: null }));
                  }}
                  error={fieldErrors.whatsapp_number}
                  placeholder="98765 43210"
                  icon={<MessageCircle size={13} className="text-success" />}
                />
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
