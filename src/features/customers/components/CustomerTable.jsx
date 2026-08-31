import React from "react";
import { Pencil, Trash2, Eye, UserRound } from "lucide-react";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

// ─── Status badge map ────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

/**
 * CustomerTable
 *
 * Props:
 * - customers (array)  — already filtered / paginated
 * - loading   (bool)
 * - canView   (bool)   — optional explicit override
 * - canEdit   (bool)   — optional explicit override
 * - canDelete (bool)   — optional explicit override
 * - onView    (fn)     — called with customer object → navigate to detail page
 * - onEdit    (fn)     — called with customer object → open edit modal
 * - onDelete  (fn)     — called with customer object → open delete modal
 */
export default function CustomerTable({
  customers,
  loading,
  canView: canViewProp,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
  onView,
  onEdit,
  onDelete,
}) {
  const { can } = usePermissions();

  const canView = canViewProp !== undefined ? canViewProp : can(PERMISSIONS.CUSTOMER_VIEW);
  const canEdit = canEditProp !== undefined ? canEditProp : can(PERMISSIONS.CUSTOMER_EDIT);
  const canDelete = canDeleteProp !== undefined ? canDeleteProp : can(PERMISSIONS.CUSTOMER_DELETE);

  const hasAnyAction = canView || canEdit || canDelete;

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading customers…</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <UserRound size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content/70">
            No customers found
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Adjust your search or filter, or create a new customer.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
            <th className="w-12 font-semibold py-3">#</th>
            <th className="font-semibold py-3">Customer</th>
            <th className="font-semibold py-3">Contact</th>
            <th className="font-semibold py-3 hidden md:table-cell">Location</th>
            <th className="font-semibold py-3 w-28 hidden sm:table-cell">Income</th>
            <th className="font-semibold py-3 w-24">Status</th>
            {hasAnyAction && <th className="font-semibold py-3 text-right w-28">Actions</th>}
          </tr>
        </thead>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <tbody>
          {customers.map((c, index) => {
            const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ");
            const initials = c.first_name?.slice(0, 2).toUpperCase() || "?";

            return (
              <tr
                key={c.id}
                className={`border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors group ${
                  canView ? "cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (canView && onView) onView(c);
                }}
              >
                {/* Index */}
                <td className="text-base-content/40 text-xs py-3">{index + 1}</td>

                {/* Avatar + name */}
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {c.photo ? (
                        <img
                          src={c.photo}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-sm text-base-content transition-colors ${
                          canView ? "group-hover:text-primary" : ""
                        }`}
                      >
                        {fullName || "—"}
                      </div>
                      <div className="text-[11px] text-base-content/40 font-mono">
                        {c.customer_no}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3">
                  <div className="text-xs text-base-content/70 font-medium">{c.mobile}</div>
                  {c.alternate_mobile && (
                    <div className="text-[10px] text-base-content/40">{c.alternate_mobile}</div>
                  )}
                </td>

                {/* Location */}
                <td className="py-3 hidden md:table-cell text-xs text-base-content/60">
                  {c.city ? (
                    `${c.city}${c.state ? `, ${c.state}` : ""}`
                  ) : (
                    <span className="text-base-content/25">—</span>
                  )}
                </td>

                {/* Income */}
                <td className="py-3 hidden sm:table-cell text-xs font-semibold text-base-content/70">
                  {c.monthly_income ? (
                    `₹${Number(c.monthly_income).toLocaleString("en-IN")}`
                  ) : (
                    <span className="text-base-content/25 font-normal">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3">
                  <span
                    className={`badge badge-sm gap-1 font-medium ${
                      STATUS_STYLES[c.status] || "badge-ghost"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {c.status
                      ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                      : "Unknown"}
                  </span>
                </td>

                {/* Actions — stop propagation so row click doesn't fire */}
                {hasAnyAction && (
                  <td className="py-3">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canView && (
                        <button
                          id={`view-customer-${c.id}`}
                          className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                          onClick={() => onView && onView(c)}
                          aria-label={`View ${fullName}`}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          id={`edit-customer-${c.id}`}
                          className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                          onClick={() => onEdit && onEdit(c)}
                          aria-label={`Edit ${fullName}`}
                          title="Edit customer"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          id={`delete-customer-${c.id}`}
                          className="btn btn-ghost btn-xs btn-square rounded-lg text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onDelete && onDelete(c)}
                          aria-label={`Delete ${fullName}`}
                          title="Delete customer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
