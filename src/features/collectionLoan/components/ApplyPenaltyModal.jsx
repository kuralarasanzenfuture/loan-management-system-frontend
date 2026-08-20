import React, { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, Calculator } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/collectionHelpers.js";

/**
 * ApplyPenaltyModal
 * Props:
 * - open (bool)
 * - installment (object|null)
 * - penaltyPreview (object|null) : result of fetchPenalty(id) — { penalty_amount, days_overdue, ... }
 * - previewLoading (bool)
 * - loading (bool)         : applying
 * - error (string|object|null)
 * - onOpenCalculate (fn)   : (id) => void — triggers fetchPenalty
 * - onClose (fn)
 * - onSubmit (fn)          : called with { id, formData }
 */
export default function ApplyPenaltyModal({
  open,
  installment,
  penaltyPreview,
  previewLoading,
  loading,
  error,
  onOpenCalculate,
  onClose,
  onSubmit,
}) {
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [useOverride, setUseOverride] = useState(false);

  useEffect(() => {
    if (open && installment) {
      onOpenCalculate(installment.id);
      setUseOverride(false);
      setPenaltyAmount("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, installment]);

  useEffect(() => {
    if (penaltyPreview?.penalty_amount != null) {
      setPenaltyAmount(penaltyPreview.penalty_amount);
    }
  }, [penaltyPreview]);

  if (!open || !installment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = Number(penaltyAmount);
    if (!amt || amt < 0) return;

    onSubmit({
      id: installment.id,
      formData: { penalty_amount: amt },
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            Apply Penalty
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-base-content/40 mb-4">
          Installment #{installment.installment_no} · Due{" "}
          {formatDate(installment.due_date)}
        </p>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        {/* Calculated preview */}
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 mb-4">
          {previewLoading ? (
            <div className="flex items-center gap-2 text-xs text-base-content/50 py-2">
              <span className="loading loading-spinner loading-xs" />
              Calculating penalty…
            </div>
          ) : penaltyPreview ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-content/50 flex items-center gap-1">
                  <Calculator size={11} /> Days Overdue
                </span>
                <span className="font-semibold">
                  {penaltyPreview.days_overdue ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-content/50">Calculated Penalty</span>
                <span className="font-bold text-warning">
                  {formatCurrency(penaltyPreview.penalty_amount)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-base-content/40">
              No penalty calculation available.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={useOverride}
              onChange={(e) => setUseOverride(e.target.checked)}
              className="checkbox checkbox-sm checkbox-warning rounded"
            />
            Override calculated amount
          </label>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Penalty Amount (₹) *
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              disabled={!useOverride && Boolean(penaltyPreview)}
              className="input input-bordered input-sm rounded-lg w-full disabled:opacity-70"
            />
          </div>

          <div className="modal-action mt-5">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !penaltyAmount}
              className="btn btn-warning btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Apply Penalty
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
