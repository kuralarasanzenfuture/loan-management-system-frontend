import React from "react";
import { Pencil, Trash2, Boxes } from "lucide-react";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

/**
 * AssetCategoryTable
 * Props:
 * - categories (array)
 * - loading (bool)
 * - canEdit (bool)   – show Edit button
 * - canDelete (bool) – show Delete button
 * - onEdit (fn)
 * - onDelete (fn)
 */
export default function AssetCategoryTable({
  categories,
  loading,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
}) {
  const showActions = canEdit || canDelete;

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading asset categories…</p>
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Boxes size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No asset categories found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first category to get started.
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
            <th className="font-medium">Category</th>
            <th className="font-medium">Description</th>
            <th className="font-medium w-32">Status</th>
            {showActions && (
              <th className="text-right font-medium w-28">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {categories.map((cat, index) => (
            <tr
              key={cat.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td className="text-base-content/40">{index + 1}</td>

              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <Boxes size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {cat.category_name}
                    </div>
                    <div className="text-[11px] text-base-content/40">
                      ID: {cat.id}
                    </div>
                  </div>
                </div>
              </td>

              <td className="max-w-md">
                <p
                  className="truncate text-sm text-base-content/60"
                  title={cat.description || ""}
                >
                  {cat.description || (
                    <span className="text-base-content/30">No description</span>
                  )}
                </p>
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium ${STATUS_STYLES[cat.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {cat.status === "inactive" ? "Inactive" : "Active"}
                </span>
              </td>

              {showActions && (
                <td>
                  <div className="flex justify-end gap-1.5">
                    {canEdit && (
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => onEdit(cat)}
                        aria-label={`Edit ${cat.category_name}`}
                        title="Edit category"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={() => onDelete(cat)}
                        aria-label={`Delete ${cat.category_name}`}
                        title="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

