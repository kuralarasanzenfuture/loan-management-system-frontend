import React from "react";
import { AlertTriangle, Loader2, X, Trash2, AlertCircle } from "lucide-react";
import {
  formatInterestValue,
  INTEREST_FREQUENCY_LABELS,
  PRINCIPAL_BASIS_LABELS,
} from "../utils/interestPlanHelpers.js";

/**
 * InterestPlanDeleteModal
 * Premium confirmation modal for deleting an interest loan plan.
 */
export default function InterestPlanDeleteModal({
  open,
  plan,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  if (!open || !plan) return null;

  const rateDisplay = formatInterestValue(plan);
  const frequencyLabel =
    INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
    plan.interest_frequency ||
    "Monthly";
  const basisLabel =
    PRINCIPAL_BASIS_LABELS[plan.principal_basis] ||
    plan.principal_basis?.replace("_", " ") ||
    "Outstanding Principal";

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-200/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-base-content">
                Delete Interest Plan
              </h3>
              <p className="text-xs text-base-content/50">
                Plan removal confirmation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="alert alert-error text-xs py-2.5 rounded-xl flex items-start gap-2 shadow-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <p className="text-sm text-base-content/70">
            Are you sure you want to permanently delete this interest loan plan?
          </p>

          {/* Plan Summary Card */}
          <div className="p-4 rounded-xl bg-base-200/60 border border-base-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Plan Name:</span>
              <span className="font-bold text-sm text-base-content">
                {plan.plan_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Plan Code:</span>
              <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded-md bg-base-300 text-base-content">
                {plan.plan_code || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Rate & Cycle:</span>
              <span className="font-semibold text-base-content">
                {rateDisplay} / {frequencyLabel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Principal Basis:</span>
              <span className="font-medium text-base-content capitalize">
                {basisLabel}
              </span>
            </div>
          </div>

          {/* Warning Notice with High-Contrast Legible Colors */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Plans currently linked to active or past loans cannot be deleted to preserve financial audit history.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-base-200/30 border-t border-base-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm rounded-xl text-base-content/70 hover:bg-base-200 font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error btn-sm rounded-xl gap-2 shadow-sm text-white font-semibold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
