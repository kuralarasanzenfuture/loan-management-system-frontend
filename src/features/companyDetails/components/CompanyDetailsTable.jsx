import React from "react";
import { Pencil, Trash2, Eye, Building2 } from "lucide-react";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-ghost",
};

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

/**
 * CompanyDetailsTable
 * Props:
 * - companies (array)
 * - loading (bool)
 * - onView (fn) / onEdit (fn) / onDelete (fn)
 */
export default function CompanyDetailsTable({
  companies,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading companies…</p>
      </div>
    );
  }

  if (!loading && companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Building2 size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No companies found
        </p>
        <p className="text-xs text-base-content/40">
          Set up your first company profile to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="w-14 font-medium">#</th>
            <th className="font-medium">Company</th>
            <th className="font-medium">Type</th>
            <th className="font-medium">Contact</th>
            <th className="font-medium">GST / PAN</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((c, index) => (
            <tr
              key={c.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td className="text-base-content/40">{index + 1}</td>

              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="w-9 h-9 rounded-lg border border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden shrink-0">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={c.company_name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Building2 size={15} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {c.company_name}
                    </div>
                    {c.trade_name && (
                      <div className="text-[11px] text-base-content/40">
                        {c.trade_name}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              <td className="text-xs text-base-content/60">
                {BUSINESS_TYPE_LABELS[c.business_type] || c.business_type}
              </td>

              <td className="text-xs text-base-content/60">
                <div className="font-medium">{c.phone || "—"}</div>
                {c.email && (
                  <div className="text-[10px] text-base-content/40">
                    {c.email}
                  </div>
                )}
              </td>

              <td className="text-xs text-base-content/60">
                <div>{c.gst_number || "—"}</div>
                {c.pan_number && (
                  <div className="text-[10px] text-base-content/40">
                    {c.pan_number}
                  </div>
                )}
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[c.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {c.status
                    ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                    : "Unknown"}
                </span>
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onView(c)}
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(c)}
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(c)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
