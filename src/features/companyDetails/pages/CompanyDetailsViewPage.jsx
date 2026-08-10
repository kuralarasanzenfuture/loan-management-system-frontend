import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Pencil,
  Building2,
  Globe2,
  MessageCircle,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import CompanyDetailsFormPage from "../components/CompanyDetailsFormPage.jsx";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value || <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );
}

const BUSINESS_TYPE_LABELS = {
  proprietorship: "Proprietorship",
  partnership: "Partnership",
  llp: "LLP",
  private_limited: "Private Limited",
  public_limited: "Public Limited",
  trust: "Trust",
  society: "Society",
  other: "Other",
};

export default function CompanyDetailsViewPage() {
  const dispatch = useDispatch();
  // Singleton: state.company is the single company record or null
  const { company, loading } = useSelector((state) => state.companyDetails);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyDetails());
  }, [dispatch]);

  if (loading && !company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading company details…</p>
      </div>
    );
  }

  // First-time setup: no record exists yet
  if (!company || editing) {
    return (
      <CompanyDetailsFormPage
        initialData={editing ? company : null}
        onCancel={editing ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border border-base-300 bg-base-100 flex items-center justify-center overflow-hidden shrink-0">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.company_name}
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <Building2 size={22} className="text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{company.company_name}</h1>
            <p className="text-xs text-base-content/40">
              {BUSINESS_TYPE_LABELS[company.business_type] ||
                company.business_type}
              {company.trade_name && ` · ${company.trade_name}`}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${company.status === "active"
                ? "badge-success badge-outline"
                : "badge-ghost"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {company.status?.charAt(0).toUpperCase() + company.status?.slice(1)}
          </span>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic + Registration */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Company Info
            </h3>
            <div className="divide-y divide-base-200">
              <InfoRow label="Legal Name" value={company.legal_name} />
              <InfoRow label="Trade Name" value={company.trade_name} />
              <InfoRow
                label="Establishment Date"
                value={
                  company.establishment_date
                    ? new Date(company.establishment_date).toLocaleDateString()
                    : null
                }
              />
              <InfoRow label="GST Number" value={company.gst_number} />
              <InfoRow label="PAN Number" value={company.pan_number} />
            </div>
            {company.business_description && (
              <div className="mt-3 pt-3 border-t border-base-200">
                <p className="text-xs text-base-content/40 mb-1">Description</p>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {company.business_description}
                </p>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Contact
            </h3>
            <div className="divide-y divide-base-200">
              <InfoRow label="Phone" value={company.phone} />
              <InfoRow
                label="Alternate Phone"
                value={company.alternate_phone}
              />
              <InfoRow label="Email" value={company.email} />
              <InfoRow
                label="Alternate Email"
                value={company.alternate_email}
              />
              <InfoRow label="Website" value={company.website} />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Address
            </h3>
            <div className="divide-y divide-base-200">
              <InfoRow
                label="Address"
                value={[company.address_line_1, company.address_line_2]
                  .filter(Boolean)
                  .join(", ")}
              />
              <InfoRow label="Landmark" value={company.landmark} />
              <InfoRow
                label="City / District"
                value={[company.city, company.district]
                  .filter(Boolean)
                  .join(", ")}
              />
              <InfoRow
                label="State"
                value={
                  company.state
                    ? `${company.state} (${company.state_code || "—"})`
                    : null
                }
              />
              <InfoRow label="Country" value={company.country} />
              <InfoRow label="Pincode" value={company.pincode} />
            </div>
          </div>

          {/* Business Hours */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Business Hours
            </h3>
            <div className="divide-y divide-base-200">
              <InfoRow
                label="Hours"
                value={
                  company.business_start_time && company.business_end_time
                    ? `${company.business_start_time} – ${company.business_end_time}`
                    : null
                }
              />
              <InfoRow label="Working Days" value={company.working_days} />
              <InfoRow label="Weekly Off" value={company.weekly_off_day} />
              <InfoRow label="Timezone" value={company.timezone} />
            </div>
          </div>
        </div>

        {/* Right column: branding + social */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-3">
              Branding
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "logo", label: "Logo" },
                { key: "favicon", label: "Favicon" },
                { key: "stamp_image", label: "Stamp" },
                { key: "signature_image", label: "Signature" },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-xl border border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden">
                    {company[key] ? (
                      <img
                        src={company[key]}
                        alt={label}
                        className="w-full h-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-[9px] text-base-content/30">
                        None
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-base-content/40">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Social & Online
            </h3>
            <div className="space-y-2.5">
              <SocialLink
                // icon={Facebook}
                icon={FaFacebook}
                url={company.facebook_url}
                label="Facebook"
              />
              <SocialLink
                icon={FaInstagram}
                url={company.instagram_url}
                label="Instagram"
              />
              <SocialLink
                icon={FaYoutube}
                url={company.youtube_url}
                label="YouTube"
              />
              <SocialLink
                icon={MessageCircle}
                url={
                  company.whatsapp_number
                    ? `https://wa.me/${company.whatsapp_number}`
                    : null
                }
                label={company.whatsapp_number || "WhatsApp"}
              />
              <SocialLink icon={Globe2} url={company.website} label="Website" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ icon: Icon, url, label }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-base-content/30">
        <Icon size={14} />
        <span>{label} not set</span>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 text-xs text-base-content/70 hover:text-primary transition-colors"
    >
      <Icon size={14} />
      <span className="truncate">{label}</span>
    </a>
  );
}
