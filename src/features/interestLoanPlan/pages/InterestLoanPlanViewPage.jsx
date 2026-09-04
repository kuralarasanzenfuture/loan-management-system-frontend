import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Percent,
  Calendar,
  ShieldAlert,
  IndianRupee,
} from "lucide-react";
import {
  fetchInterestOnlyLoanPlanById,
  editInterestOnlyLoanPlan,
  removeInterestOnlyLoanPlan,
  clearSelectedInterestLoanPlan,
  clearInterestLoanPlanError,
} from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";
import {
  INTEREST_FREQUENCY_LABELS,
  TENURE_TYPE_LABELS,
  STATUS_STYLES,
  formatInterestValue,
  formatCommissionValue,
} from "../utils/interestPlanHelpers.js";
import InterestLoanPlanFormModal from "../components/InterestLoanPlanFormModal.jsx";
import InterestLoanPlanDeleteModal from "../components/InterestLoanPlanDeleteModal.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value ?? <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );
}

export default function InterestLoanPlanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_VIEW,
    PERMISSIONS.LOAN_PLAN_VIEW,
  ]);
  const canEdit = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_EDIT,
    PERMISSIONS.LOAN_PLAN_EDIT,
  ]);
  const canDelete = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_DELETE,
    PERMISSIONS.LOAN_PLAN_DELETE,
  ]);

  const { plan, loading, error } = useSelector(
    (state) => state.interestLoanPlans || {},
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView && id) {
      dispatch(fetchInterestOnlyLoanPlanById(id));
    }
    return () => {
      dispatch(clearSelectedInterestLoanPlan());
    };
  }, [dispatch, id, canView]);

  const handleOpenEdit = () => {
    if (!canEdit) return;
    dispatch(clearInterestLoanPlanError());
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    dispatch(clearInterestLoanPlanError());
  };

  const handleFormSubmit = async (formData) => {
    if (!canEdit || !plan?.id) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(
        editInterestOnlyLoanPlan({ id: plan.id, formData }),
      );
      if (editInterestOnlyLoanPlan.fulfilled.match(action)) {
        setIsEditModalOpen(false);
        dispatch(fetchInterestOnlyLoanPlanById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = () => {
    if (!canDelete) return;
    dispatch(clearInterestLoanPlanError());
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    dispatch(clearInterestLoanPlanError());
  };

  const handleConfirmDelete = async () => {
    if (!canDelete || !plan?.id) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeInterestOnlyLoanPlan(plan.id));
      if (removeInterestOnlyLoanPlan.fulfilled.match(action)) {
        setIsDeleteModalOpen(false);
        navigate("/interest-loan-plans");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-sm text-base-content/60 max-w-sm">
          You do not possess the required permission to view this interest-only
          loan plan.
        </p>
        <button
          onClick={() => navigate("/interest-loan-plans")}
          className="btn btn-ghost btn-sm mt-2"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading interest plan…</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <p className="text-sm text-base-content/60">Interest plan not found.</p>
        <button
          onClick={() => navigate("/interest-loan-plans")}
          className="btn btn-ghost btn-sm"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/interest-loan-plans")}
            className="btn btn-ghost btn-sm btn-square"
            title="Back to plans"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <Percent size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">{plan.plan_name}</h1>
            <p className="text-xs text-base-content/40 font-mono">
              {plan.plan_code}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[plan.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {plan.status?.charAt(0).toUpperCase() + plan.status?.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleOpenEdit}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleOpenDelete}
              className="btn btn-outline btn-error btn-sm gap-1.5"
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Percent size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Interest Rate</div>
            <div className="text-lg font-semibold leading-tight">
              {formatInterestValue(plan)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Calendar size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Tenure</div>
            <div className="text-lg font-semibold leading-tight">
              {plan.tenure}{" "}
              {TENURE_TYPE_LABELS[plan.tenure_type] || plan.tenure_type}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
              plan.penalty_enabled
                ? "bg-warning/10 text-warning"
                : "bg-base-200 text-base-content/30"
            }`}
          >
            <ShieldAlert size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Penalty</div>
            <div className="text-lg font-semibold leading-tight">
              {plan.penalty_enabled ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Percent size={13} /> Interest Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Interest Type"
              value={
                plan.interest_type
                  ? plan.interest_type.charAt(0).toUpperCase() +
                    plan.interest_type.slice(1)
                  : "—"
              }
            />
            <InfoRow label="Interest Value" value={formatInterestValue(plan)} />
            <InfoRow
              label="Interest Frequency"
              value={
                INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
                plan.interest_frequency
              }
            />
            <InfoRow label="Principal Repayment" value="End of Term" />
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

        {/* Commission & Penalty */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <IndianRupee size={13} /> Commission & Penalty
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Commission Type"
              value={
                plan.commission_type
                  ? plan.commission_type.charAt(0).toUpperCase() +
                    plan.commission_type.slice(1)
                  : "None"
              }
            />
            <InfoRow
              label="Commission Value"
              value={formatCommissionValue(plan)}
            />
            <InfoRow
              label="Penalty Enabled"
              value={plan.penalty_enabled ? "Yes" : "No"}
            />
          </div>
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

      {/* Edit modal */}
      {isEditModalOpen && (
        <InterestLoanPlanFormModal
          open={isEditModalOpen}
          initialData={plan}
          loading={formSubmitting}
          error={error}
          onClose={handleCloseEdit}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete confirm modal */}
      {isDeleteModalOpen && (
        <InterestLoanPlanDeleteModal
          open={isDeleteModalOpen}
          plan={plan}
          loading={deleteSubmitting}
          error={error}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      )}
    </div>
  );
}
