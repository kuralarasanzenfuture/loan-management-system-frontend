import React from "react";
import { Pencil, Trash2, Eye, Package, ImageOff } from "lucide-react";
import {
  CONDITION_LABELS,
  CONDITION_STYLES,
  STATUS_STYLES,
  formatCurrency,
} from "../utils/assetHelpers.js";

/**
 * AssetTable
 * Props:
 * - assets (array)
 * - loading (bool)
 * - categoryMap (object) : { [category_id]: category_name }
 * - onView (fn) / onEdit (fn) / onDelete (fn)
 */
export default function AssetTable({
  assets,
  loading,
  categoryMap = {},
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading assets…</p>
      </div>
    );
  }

  if (!loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Package size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No assets found
        </p>
        <p className="text-xs text-base-content/40">
          Register your first business asset to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Asset</th>
            <th className="font-medium">Category</th>
            <th className="font-medium">Purchase</th>
            <th className="font-medium">Value</th>
            <th className="font-medium">Condition</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-lg border border-base-300 bg-base-200/40 flex items-center justify-center overflow-hidden shrink-0">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.asset_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff size={15} className="text-base-content/30" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {asset.asset_name}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono">
                      {asset.asset_no}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-xs">
                <span className="badge badge-ghost badge-sm font-medium">
                  {categoryMap[asset.category_id] ||
                    `Category #${asset.category_id}`}
                </span>
              </td>

              <td className="text-xs text-base-content/60">
                <div>
                  {asset.purchase_date
                    ? new Date(asset.purchase_date).toLocaleDateString()
                    : "—"}
                </div>
                {asset.vendor_name && (
                  <div className="text-[10px] text-base-content/40 truncate max-w-[140px]">
                    {asset.vendor_name}
                  </div>
                )}
              </td>

              <td className="text-xs">
                <div className="font-semibold text-base-content">
                  {formatCurrency(asset.current_value)}
                </div>
                <div className="text-[10px] text-base-content/40">
                  Bought {formatCurrency(asset.purchase_price)}
                </div>
              </td>

              <td>
                <span
                  className={`badge badge-sm font-medium ${CONDITION_STYLES[asset.condition_status] || "badge-ghost"}`}
                >
                  {CONDITION_LABELS[asset.condition_status] ||
                    asset.condition_status}
                </span>
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[asset.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {asset.status
                    ? asset.status.charAt(0).toUpperCase() +
                      asset.status.slice(1)
                    : "Unknown"}
                </span>
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onView(asset)}
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(asset)}
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(asset)}
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
