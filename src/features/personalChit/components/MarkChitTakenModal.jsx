import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../utils/chitHelpers.js";

/**
 * MarkChitTakenModal
 * Collects taken_date, chit_received_amount, and optional remarks
 * required by the backend markChitTaken schema.
 */
export default function MarkChitTakenModal({
  open,
  chit,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  const [takenDate, setTakenDate] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open && chit) {
      setTakenDate(new Date().toISOString().slice(0, 10));
      setReceivedAmount(chit.chit_amount ?? "");
      setRemarks("");
      setConfirmed(false);
      setFieldErrors({});
    }
  }, [open, chit]);

  if (!open || !chit) return null;

  const validate = () => {
    const errors = {};
    if (!takenDate) errors.takenDate = "Please select the payout date";
    if (receivedAmount === "" || Number(receivedAmount) < 0) {
      errors.receivedAmount = "Please enter a valid received amount (0 or more)";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || !confirmed) return;

    onConfirm({
      taken_date: takenDate,
      chit_received_amount: Number(receivedAmount),
      remarks: remarks.trim() || null,
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-square absolute right-3 top-3"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-success/10 text-success">
            <CheckCircle2 size={22} />
          </span>
          <h3 className="font-bold text-base">Mark Chit as Taken</h3>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200/40 p-3 mt-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{chit.chit_name}</p>
              <p className="text-[11px] text-base-content/40 font-mono">
                {chit.chit_no}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-base-content/50">Chit Value</span>
              <p className="text-sm font-bold text-primary">
                {formatCurrency(chit.chit_amount)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-xs py-2 mt-3">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Payout Taken Date *
              </span>
            </label>
            <input
              type="date"
              value={takenDate}
              onChange={(e) => {
                setTakenDate(e.target.value);
                setFieldErrors((prev) => ({ ...prev, takenDate: null }));
              }}
              className={`input input-bordered input-sm rounded-lg w-full ${
                fieldErrors.takenDate ? "input-error" : ""
              }`}
            />
            {fieldErrors.takenDate && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.takenDate}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Received / Payout Amount (₹) *
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={receivedAmount}
              onChange={(e) => {
                setReceivedAmount(e.target.value);
                setFieldErrors((prev) => ({ ...prev, receivedAmount: null }));
              }}
              className={`input input-bordered input-sm rounded-lg w-full ${
                fieldErrors.receivedAmount ? "input-error" : ""
              }`}
              placeholder="e.g. 50000"
            />
            {fieldErrors.receivedAmount && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.receivedAmount}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Remarks (optional)
              </span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="textarea textarea-bordered textarea-sm rounded-lg w-full"
              placeholder="Any notes about the payout auction/bid..."
            />
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="checkbox checkbox-sm checkbox-success rounded mt-0.5 shrink-0"
            />
            <span className="text-xs text-base-content/60 leading-tight">
              I confirm the chit payout has been received. Remaining installment
              obligations will continue.
            </span>
          </label>

          <div className="modal-action justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed}
              className="btn btn-success btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Mark as Taken
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}

