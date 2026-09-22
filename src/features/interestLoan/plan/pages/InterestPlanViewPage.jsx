import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Percent,
  Calendar,
  Layers,
  Clock,
  ShieldAlert,
  User,
  Info,
} from "lucide-react";
import {
  fetchInterestPlanById,
  editInterestPlan,
  removeInterestPlan,
  clearSelectedInterestPlan,
  clearInterestPlanError,
} from "../../../../redux/interestLoan/plan/interestPlanSlice.js";
import {
  INTEREST_FREQUENCY_LABELS,
  PRINCIPAL_BASIS_LABELS,
  CALCULATION_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  STATUS_STYLES,
  formatInterestValue,
} from "../utils/interestPlanHelpers.js";
import InterestPlanFormModal from "../components/InterestPlanFormModal.jsx";
import InterestPlanDeleteModal from "../components/InterestPlanDeleteModal.jsx";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 text-sm border-b border-base-200 last:border-0">
      <span className="text-base-content/50 font-medium">{label}</span>
      <span className="font-semibold text-right text-base-content">
        {value ?? <span className="text-base-content/30 font-normal">—</span>}
      </span>
    </div>
  );
}

export default function InterestPlanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global Permissions ──────────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.INTEREST_LOAN_PLAN_VIEW);
  const canEdit = can(PERMISSIONS.INTEREST_LOAN_PLAN_EDIT);
  const canDelete = can(PERMISSIONS.INTEREST_LOAN_PLAN_DELETE);

  const { plan, loading, error } = useSelector(
    (state) => state.interestPlans || {},
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView && id) {
      dispatch(fetchInterestPlanById(id));
    }
    return () => {
      dispatch(clearSelectedInterestPlan());
    };
  }, [dispatch, id, canView]);

  const handleOpenEdit = () => {
    if (!canEdit) return;
    dispatch(clearInterestPlanError());
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    dispatch(clearInterestPlanError());
  };

  const handleFormSubmit = async (formData) => {
    if (!canEdit || !plan?.id) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(
        editInterestPlan({ id: plan.id, formData }),
      );
      if (editInterestPlan.fulfilled.match(action)) {
        setIsEditModalOpen(false);
        dispatch(fetchInterestPlanById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = () => {
    if (!canDelete) return;
    dispatch(clearInterestPlanError());
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    dispatch(clearInterestPlanError());
  };

  const handleConfirmDelete = async () => {
    if (!canDelete || !plan?.id) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeInterestPlan(plan.id));
      if (removeInterestPlan.fulfilled.match(action)) {
        setIsDeleteModalOpen(false);
        navigate("/interest-plans");
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
          You do not have permission to view this interest plan.
        </p>
        <button
          className="btn btn-outline btn-sm mt-2 rounded-lg"
          onClick={() => navigate("/interest-plans")}
        >
          Back to Plans
        </button>
      </div>
    );
  }

  if (loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading plan details…</p>
      </div>
    );
  }

  if (!loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-base-content/40">
          <Percent size={24} />
        </div>
        <h2 className="text-base font-semibold text-base-content">
          Plan Not Found
        </h2>
        <p className="text-xs text-base-content/50">
          The requested interest plan does not exist or has been removed.
        </p>
        <button
          className="btn btn-primary btn-sm rounded-lg mt-2"
          onClick={() => navigate("/interest-plans")}
        >
          Back to Plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          className="btn btn-ghost btn-sm gap-2 rounded-lg text-base-content/70 hover:text-base-content"
          onClick={() => navigate("/interest-plans")}
        >
          <ArrowLeft size={16} />
          Back to Plans
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-base-content gap-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all"
              onClick={handleOpenEdit}
            >
              <Pencil size={15} className="text-base-content/70" />
              <span>Edit</span>
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-error btn-outline btn-sm gap-1.5 rounded-lg"
              onClick={handleOpenDelete}
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Plan Header Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Percent size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-base-content">
                  {plan.plan_name}
                </h1>
                <span
                  className={`badge font-medium ${
                    STATUS_STYLES[plan.status] || "badge-ghost"
                  }`}
                >
                  {plan.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content/50 font-mono mt-1">
                <span>{plan.plan_code}</span>
                <span>•</span>
                <span>ID: #{plan.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rate Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="text-xs text-base-content/50 font-medium">
            Interest Rate
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {formatInterestValue(plan)}
          </div>
          <div className="text-[11px] text-base-content/40 capitalize mt-0.5">
            {plan.interest_type || "percentage"}
          </div>
        </div>

        {/* Frequency Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="text-xs text-base-content/50 font-medium">
            Frequency
          </div>
          <div className="text-xl font-bold text-base-content mt-1">
            {INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
              plan.interest_frequency}
          </div>
          <div className="text-[11px] text-base-content/40 mt-0.5">
            Billing interval
          </div>
        </div>

        {/* Principal Basis Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="text-xs text-base-content/50 font-medium">
            Principal Basis
          </div>
          <div className="text-base font-bold text-base-content mt-1 line-clamp-1">
            {PRINCIPAL_BASIS_LABELS[plan.principal_basis] ||
              plan.principal_basis}
          </div>
          <div className="text-[11px] text-base-content/40 mt-0.5">
            Calculation basis
          </div>
        </div>

        {/* Payment Flexibility */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="text-xs text-base-content/50 font-medium">
            Payment Type
          </div>
          <div className="text-xl font-bold text-base-content mt-1 capitalize">
            {PAYMENT_TYPE_LABELS[plan.payment_type] ||
              plan.payment_type ||
              "Anytime"}
          </div>
          <div className="text-[11px] text-base-content/40 mt-0.5">
            Principal & interest terms
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specification Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/70 flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            Terms & Configuration
          </h3>

          <div className="space-y-1">
            <DetailRow label="Plan Name" value={plan.plan_name} />
            <DetailRow label="Plan Code" value={plan.plan_code} />
            <DetailRow
              label="Interest Type"
              value={plan.interest_type ? plan.interest_type.toUpperCase() : "PERCENTAGE"}
            />
            <DetailRow
              label="Rate / Value"
              value={formatInterestValue(plan)}
            />
            <DetailRow
              label="Billing Frequency"
              value={
                INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
                plan.interest_frequency
              }
            />
            <DetailRow
              label="Calculation Method"
              value={
                CALCULATION_METHOD_LABELS[plan.calculation_method] ||
                plan.calculation_method ||
                "Simple"
              }
            />
            <DetailRow
              label="Principal Basis"
              value={
                PRINCIPAL_BASIS_LABELS[plan.principal_basis] ||
                plan.principal_basis
              }
            />
            <DetailRow
              label="Payment Flexibility"
              value={
                PAYMENT_TYPE_LABELS[plan.payment_type] ||
                plan.payment_type ||
                "Anytime"
              }
            />
          </div>
        </div>

        {/* Description & Audit Details Card */}
        <div className="space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/70 flex items-center gap-2">
              <Info size={16} className="text-primary" />
              Description & Notes
            </h3>
            <p className="text-sm text-base-content/70 whitespace-pre-wrap">
              {plan.description || (
                <span className="text-base-content/30 italic">
                  No additional description provided for this plan.
                </span>
              )}
            </p>
          </div>

          {/* Audit Metadata */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-base-content/70 flex items-center gap-2">
              <User size={16} className="text-primary" />
              Audit Log
            </h3>
            <div className="space-y-1">
              <DetailRow
                label="Created By"
                value={plan.created_by_name || `#${plan.created_by || "—"}`}
              />
              <DetailRow
                label="Created At"
                value={
                  plan.created_at
                    ? new Date(plan.created_at).toLocaleString("en-IN")
                    : "—"
                }
              />
              <DetailRow
                label="Last Updated By"
                value={plan.updated_by_name || (plan.updated_by ? `#${plan.updated_by}` : "—")}
              />
              <DetailRow
                label="Last Updated At"
                value={
                  plan.updated_at
                    ? new Date(plan.updated_at).toLocaleString("en-IN")
                    : "—"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <InterestPlanFormModal
        open={isEditModalOpen}
        initialData={plan}
        loading={formSubmitting}
        error={error}
        onClose={handleCloseEdit}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <InterestPlanDeleteModal
        open={isDeleteModalOpen}
        plan={plan}
        loading={deleteSubmitting}
        error={error}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

