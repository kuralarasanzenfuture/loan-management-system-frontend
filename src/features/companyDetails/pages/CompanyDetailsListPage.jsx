import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import {
  fetchCompanyDetails,
  removeCompanyDetails,
  clearCompanyDetailsError,
} from "../../../redux/companyDetails/companyDetailsSlice.js";
import CompanyDeleteModal from "../components/CompanyDeleteModal.jsx";

export default function CompanyDetailsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { company, loading, error } = useSelector(
    (state) => state.companyDetails,
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyDetails());
    return () => {
      dispatch(clearCompanyDetailsError());
    };
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCompanyDetails(deleteTarget.id));
      if (removeCompanyDetails.fulfilled.match(action)) setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading company details…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            Company Profile
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage your company profile used across invoices and documents.
          </p>
        </div>
        {!company && (
          <button
            className="btn btn-primary btn-sm gap-1.5"
            onClick={() => navigate("/companies-details")}
          >
            <Building2 size={16} />
            Setup Company
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Building2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Company</div>
            <div className="text-lg font-semibold leading-tight">
              {company ? company.company_name : "Not set up"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
              company?.status === "active"
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {company?.status === "active" ? (
              <CheckCircle2 size={18} />
            ) : (
              <XCircle size={18} />
            )}
          </span>
          <div>
            <div className="text-xs text-base-content/50">Status</div>
            <div
              className={`text-lg font-semibold leading-tight ${
                company?.status === "active" ? "text-success" : "text-error"
              }`}
            >
              {company
                ? company.status?.charAt(0).toUpperCase() +
                  company.status?.slice(1)
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Company card */}
      {company ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-base-300 bg-base-200/40 flex items-center justify-center overflow-hidden shrink-0">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.company_name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 size={16} className="text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{company.company_name}</p>
                <p className="text-xs text-base-content/50">
                  {company.business_type?.replace(/_/g, " ")}
                  {company.gst_number ? ` · GST: ${company.gst_number}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`badge text-xs gap-1.5 font-medium ${
                  company.status === "active"
                    ? "badge-success badge-outline"
                    : "badge-ghost"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {company.status?.charAt(0).toUpperCase() +
                  company.status?.slice(1)}
              </span>
              <button
                onClick={() => navigate("/companies-details")}
                className="btn btn-ghost btn-xs gap-1"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(company)}
                className="btn btn-ghost btn-xs text-error gap-1"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>

          <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-base-content/40">Phone</p>
              <p className="font-medium">{company.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">Email</p>
              <p className="font-medium truncate">{company.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">City</p>
              <p className="font-medium">{company.city || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">PAN</p>
              <p className="font-medium">{company.pan_number || "—"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 py-16 flex flex-col items-center gap-3 text-base-content/40">
          <Building2 size={40} strokeWidth={1} />
          <p className="text-sm">No company profile set up yet.</p>
          <button
            className="btn btn-primary btn-sm mt-1"
            onClick={() => navigate("/settings/company")}
          >
            Set Up Now
          </button>
        </div>
      )}

      <CompanyDeleteModal
        open={Boolean(deleteTarget)}
        company={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteTarget(null);
          dispatch(clearCompanyDetailsError());
        }}
      />
    </div>
  );
}
