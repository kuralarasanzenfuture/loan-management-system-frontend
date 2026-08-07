import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Landmark,
  ShieldAlert,
  Calendar,
  IndianRupee,
} from "lucide-react";
import {
  fetchLoanPlanAndPenalityById,
  editLoanPlanAndPenality,
  clearSelectedLoanPlanAndPenality,
  clearLoanPlanAndPenalityError,
} from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import LoanPlanFormModal from "../components/LoanPlanFormModal.jsx";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

export default function LoanPlanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loanPlanAndPenality: plan,
    loading,
    error,
  } = useSelector((state) => state.loanPlanAndPenalities);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchLoanPlanAndPenalityById(id));
    return () => dispatch(clearSelectedLoanPlanAndPenality());
  }, [dispatch, id]);

  const handleOpenEdit = () => {
    dispatch(clearLoanPlanAndPenalityError());
    setIsEditModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsEditModalOpen(false);
    dispatch(clearLoanPlanAndPenalityError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const action = await dispatch(
        editLoanPlanAndPenality({ id: plan.id, formData }),
      );
      if (editLoanPlanAndPenality.fulfilled.match(action)) {
        setIsEditModalOpen(false);
        dispatch(fetchLoanPlanAndPenalityById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loan plan…</p>
      </div>
    );
  }

  if (!plan) return null;

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value ?? <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );

  const commissionDisplay =
    plan.commission_type === "percentage"
      ? `${Number(plan.commission_value).toFixed(2)}%`
      : `₹${Number(plan.commission_value).toLocaleString("en-IN")}`;

  const penaltyDisplay =
    plan.penalty_value != null
      ? plan.penalty_type === "percentage"
        ? `${Number(plan.penalty_value).toFixed(2)}%`
        : `₹${Number(plan.penalty_value).toLocaleString("en-IN")}`
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <Landmark size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">{plan.plan_name}</h1>
            <p className="text-xs text-base-content/40">{plan.plan_code}</p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[plan.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {plan.status?.charAt(0).toUpperCase() + plan.status?.slice(1)}
          </span>
        </div>

        <button
          onClick={handleOpenEdit}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      {/* Quick stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Calendar size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Tenure</div>
            <div className="text-lg font-semibold leading-tight">
              {plan.tenure} {plan.tenure_type}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Commission</div>
            <div className="text-lg font-semibold leading-tight">
              {commissionDisplay}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning shrink-0">
            <ShieldAlert size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Late Penalty</div>
            <div className="text-lg font-semibold leading-tight">
              {penaltyDisplay || (
                <span className="text-base-content/30 text-sm font-normal">
                  Not set
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Landmark size={13} /> Plan Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Plan Name" value={plan.plan_name} />
            <InfoRow label="Plan Code" value={plan.plan_code} />
            <InfoRow
              label="Collection Frequency"
              value={
                plan.collection_frequency?.charAt(0).toUpperCase() +
                plan.collection_frequency?.slice(1)
              }
            />
            <InfoRow
              label="Tenure"
              value={`${plan.tenure} ${plan.tenure_type}`}
            />
            <InfoRow
              label="Commission Type"
              value={
                plan.commission_type?.charAt(0).toUpperCase() +
                plan.commission_type?.slice(1)
              }
            />
            <InfoRow label="Commission Value" value={commissionDisplay} />
          </div>
          {plan.description && (
            <div className="mt-3 pt-3 border-t border-base-200">
              <p className="text-xs text-base-content/40 mb-1">Description</p>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {plan.description}
              </p>
            </div>
          )}
        </div>

        {/* Penalty Details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <ShieldAlert size={13} /> Penalty Configuration
          </h3>
          {plan.penalty_value != null ? (
            <div className="divide-y divide-base-200">
              <InfoRow label="Grace Days" value={plan.grace_days ?? 0} />
              <InfoRow
                label="Penalty Type"
                value={
                  plan.penalty_type?.charAt(0).toUpperCase() +
                  plan.penalty_type?.slice(1)
                }
              />
              <InfoRow label="Penalty Value" value={penaltyDisplay} />
              <InfoRow
                label="Max Penalty Cap"
                value={
                  plan.max_penalty != null
                    ? `₹${Number(plan.max_penalty).toLocaleString("en-IN")}`
                    : "No cap"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-base-content/40">
              No penalty configured for this plan.
            </p>
          )}
        </div>

        {/* Record Info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
            Record Info
          </h3>
          <div className="grid grid-cols-2 divide-x divide-base-200">
            <div className="pr-4">
              <InfoRow
                label="Created"
                value={
                  plan.created_at
                    ? new Date(plan.created_at).toLocaleString()
                    : null
                }
              />
            </div>
            <div className="pl-4">
              <InfoRow
                label="Updated"
                value={
                  plan.updated_at
                    ? new Date(plan.updated_at).toLocaleString()
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <LoanPlanFormModal
        open={isEditModalOpen}
        initialData={plan}
        loading={formSubmitting}
        error={isEditModalOpen ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
