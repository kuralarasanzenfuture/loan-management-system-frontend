import React from "react";
import { Pencil, Trash2, Eye, Wallet2, CheckCircle2 } from "lucide-react";
import {
  STATUS_STYLES,
  formatCurrency,
  formatDate,
} from "../utils/chitHelpers.js";

/**
 * PersonalChitTable
 * Props:
 * - chits (array)
 * - loading (bool)
 * - onView (fn) / onEdit (fn) / onDelete (fn)
 */
export default function PersonalChitTable({
  chits,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && chits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading chits…</p>
      </div>
    );
  }

  if (!loading && chits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Wallet2 size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No chits found
        </p>
        <p className="text-xs text-base-content/40">
          Add your first personal chit to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Chit</th>
            <th className="font-medium">Provider</th>
            <th className="font-medium">Chit Value</th>
            <th className="font-medium">Paid / Pending</th>
            <th className="font-medium">Started</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {chits.map((chit) => (
            <tr
              key={chit.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3 py-1">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <Wallet2 size={16} />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">
                        {chit.chit_name}
                      </span>
                      {/* {chit.is_taken && (
                        <span className="badge badge-success badge-outline badge-xs gap-1 font-medium">
                          <CheckCircle2 size={9} /> Taken
                        </span>
                      )} */}
                      {Boolean(Number(chit.is_taken)) && (
                        <span className="badge badge-success badge-outline badge-xs gap-1 font-medium">
                          <CheckCircle2 size={9} /> Taken
                        </span>
                      )}
                      {/* {Number(chit.is_taken) === 1 ? (
                        <span className="badge badge-success badge-outline badge-xs gap-1 font-medium">
                          <CheckCircle2 size={9} /> Taken
                        </span>
                      ) : (
                        <span className="badge badge-primary badge-outline badge-xs font-medium">
                          Available
                        </span>
                      )} */}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono">
                      {chit.chit_no}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-xs">
                <div className="font-semibold text-base-content/80">
                  {chit.chit_provider}
                </div>
                {chit.provider_mobile && (
                  <div className="text-[10px] text-base-content/40">
                    {chit.provider_mobile}
                  </div>
                )}
              </td>

              <td className="text-xs font-semibold text-base-content">
                {formatCurrency(chit.chit_amount)}
              </td>

              <td className="text-xs">
                <div className="text-success font-semibold">
                  {formatCurrency(chit.total_paid_amount)}
                </div>
                <div className="text-error/70">
                  {formatCurrency(chit.total_pending_amount)} pending
                </div>
              </td>

              <td className="text-xs text-base-content/60">
                {formatDate(chit.start_date)}
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[chit.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {chit.status?.charAt(0).toUpperCase() + chit.status?.slice(1)}
                </span>
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onView(chit)}
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(chit)}
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(chit)}
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
