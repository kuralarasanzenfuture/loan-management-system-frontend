import React from "react";
import { Pencil, Trash2, Eye, UserRound } from "lucide-react";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

/**
 * CustomerTable
 * Props:
 * - customers (array) : already filtered/paginated
 * - loading (bool)
 * - onView (fn)
 * - onEdit (fn)
 * - onDelete (fn)
 */
export default function CustomerTable({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading customers…</p>
      </div>
    );
  }

  if (!loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <UserRound size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No customers found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first customer to get started.
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
            <th className="font-medium">Customer</th>
            <th className="font-medium">Contact</th>
            <th className="font-medium">Location</th>
            <th className="font-medium w-32">Income</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c, index) => {
            const fullName = [c.first_name, c.last_name]
              .filter(Boolean)
              .join(" ");
            return (
              <tr
                key={c.id}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
                // onClick={() => onView(c)}
              >
                <td className="text-base-content/40">{index + 1}</td>

                <td>
                  <div className="flex items-center gap-3 py-1">
                    <div className="avatar">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
                        {c.photo ? (
                          <img
                            src={c.photo}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold uppercase">
                            {c.first_name?.slice(0, 2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{fullName}</div>
                      <div className="text-[11px] text-base-content/40">
                        {c.customer_no}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="text-xs text-base-content/60">
                    <div>{c.mobile}</div>
                    {c.alternate_mobile && (
                      <div className="text-[10px] text-base-content/40">
                        {c.alternate_mobile}
                      </div>
                    )}
                  </div>
                </td>

                <td className="text-xs text-base-content/60">
                  {c.city ? (
                    `${c.city}, ${c.state || ""}`
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-xs font-semibold text-base-content/70">
                  {c.monthly_income ? (
                    `₹${Number(c.monthly_income).toLocaleString("en-IN")}`
                  ) : (
                    <span className="text-base-content/30 font-normal">—</span>
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
                      aria-label={`View ${fullName}`}
                      title="View customer"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => onEdit(c)}
                      aria-label={`Edit ${fullName}`}
                      title="Edit customer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                      onClick={() => onDelete(c)}
                      aria-label={`Delete ${fullName}`}
                      title="Delete customer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
