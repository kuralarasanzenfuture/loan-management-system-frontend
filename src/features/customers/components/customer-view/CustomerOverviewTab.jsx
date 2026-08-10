import React from "react";
import {
  Phone,
  MapPin,
  Briefcase,
  Users2,
  IdCard,
  BadgeCheck,
} from "lucide-react";

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

/**
 * CustomerOverviewTab
 * Props:
 * - customer (object)
 */
export default function CustomerOverviewTab({ customer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: info cards */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Users2 size={13} /> Personal Info
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Father's Name" value={customer.father_name} />
            <InfoRow label="Mother's Name" value={customer.mother_name} />
            <InfoRow
              label="Date of Birth"
              value={
                customer.dob
                  ? new Date(customer.dob).toLocaleDateString()
                  : null
              }
            />
            <InfoRow
              label="Gender"
              value={
                customer.gender &&
                customer.gender.charAt(0).toUpperCase() +
                  customer.gender.slice(1)
              }
            />
            <InfoRow label="Occupation" value={customer.occupation} />
            <InfoRow
              label="Monthly Income"
              value={
                customer.monthly_income
                  ? `₹${Number(customer.monthly_income).toLocaleString("en-IN")}`
                  : null
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <IdCard size={13} /> Contact & Identity
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Mobile" value={customer.mobile} />
            <InfoRow
              label="Alternate Mobile"
              value={customer.alternate_mobile}
            />
            <InfoRow label="Aadhaar Number" value={customer.aadhaar_no} />
            <InfoRow label="PAN Number" value={customer.pan_no} />
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <MapPin size={13} /> Address
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Street Address" value={customer.address} />
            <InfoRow label="City" value={customer.city} />
            <InfoRow label="District" value={customer.district} />
            <InfoRow label="State" value={customer.state} />
            <InfoRow label="Pincode" value={customer.pincode} />
          </div>
        </div>
      </div>

      {/* Right column: reference & meta */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Phone size={13} /> Reference
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Name" value={customer.reference_name} />
            <InfoRow label="Mobile" value={customer.reference_mobile} />
          </div>
        </div>

        {customer.remarks && (
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
              <Briefcase size={13} /> Remarks
            </h3>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {customer.remarks}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <BadgeCheck size={13} /> Record Info
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Created"
              value={
                customer.created_at
                  ? new Date(customer.created_at).toLocaleString()
                  : null
              }
            />
            <InfoRow
              label="Updated"
              value={
                customer.updated_at
                  ? new Date(customer.updated_at).toLocaleString()
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
