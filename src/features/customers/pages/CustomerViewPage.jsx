import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Phone,
  MapPin,
  Briefcase,
  Users2,
  IdCard,
  BadgeCheck,
} from "lucide-react";
import {
  fetchCustomerById,
  clearSelectedCustomer,
} from "../../../redux/customers/customerSlice.js";
import CustomerDocumentsPanel from "../components/CustomerDocumentsPanel.jsx";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customer, loading } = useSelector((state) => state.customers);

  useEffect(() => {
    dispatch(fetchCustomerById(id));
    return () => dispatch(clearSelectedCustomer());
  }, [dispatch, id]);

  if (loading && !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading customer…</p>
      </div>
    );
  }

  if (!customer) return null;

  const fullName = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ");

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value || <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="avatar">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
              {customer.photo ? (
                <img
                  src={customer.photo}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold uppercase">
                  {customer.first_name?.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-xs text-base-content/40">
              {customer.customer_no}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[customer.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {customer.status?.charAt(0).toUpperCase() +
              customer.status?.slice(1)}
          </span>
        </div>

        <button
          onClick={() => navigate(`/customers/${customer.id}/edit`)}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: info cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal */}
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

          {/* Contact & Identity */}
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

          {/* Address */}
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

          {/* Documents */}
          <CustomerDocumentsPanel documents={customer.documents || []} />
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
    </div>
  );
}
