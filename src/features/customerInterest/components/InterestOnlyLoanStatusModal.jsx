import React, { useState, useEffect } from "react";
import { X, Loader2, Percent } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "text-info" },
  { value: "completed", label: "Completed", color: "text-success" },
  { value: "closed", label: "Closed", color: "text-base-content/60" },
  { value: "default", label: "Default", color: "text-error" },
  { value: "cancelled", label: "Cancelled", color: "text-base-content/40" },
];

export default function InterestOnlyLoanStatusModal({
  open,
  loan,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (open && loan) setStatus(loan.status || "active");
  }, [open, loan]);

  if (!open || !loan) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: loan.id, data: { status } });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Percent size={16} className="text-primary" />
            Update Loan Status
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-base-content/40 mb-4">{loan.loan_no}</p>

        {error && (
          <div className="alert alert-error text-xs py-2 mb-3">
            <span>
              {typeof error === "string"
                ? error
                : error?.message || error?.error || "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                  status === s.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-base-300 text-base-content/60 hover:bg-base-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full bg-current ${s.color}`}
                />
                {s.label}
              </button>
            ))}
          </div>

          <div className="modal-action mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
