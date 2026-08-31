import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Landmark,
  ShieldAlert,
  Calendar,
  IndianRupee,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchLoanPlanAndPenalityById,
  editLoanPlanAndPenality,
  removeLoanPlanAndPenality,
  clearSelectedLoanPlanAndPenality,
  clearLoanPlanAndPenalityError,
} from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import LoanPlanFormModal from "../components/LoanPlanFormModal.jsx";
import LoanPlanDeleteModal from "../components/LoanPlanDeleteModal.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

export default function LoanPlanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.LOAN_PLAN_VIEW);
  const canEdit = can(PERMISSIONS.LOAN_PLAN_EDIT);
  const canDelete = can(PERMISSIONS.LOAN_PLAN_DELETE);

  const {
    loanPlanAndPenality: plan,
    loading,
    error,
  } = useSelector((state) => state.loanPlanAndPenalities);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView) {
      dispatch(fetchLoanPlanAndPenalityById(id));
    }
    return () => dispatch(clearSelectedLoanPlanAndPenality());
  }, [dispatch, id, canView]);

  const handleOpenEdit = () => {
    if (!canEdit) return;
    dispatch(clearLoanPlanAndPenalityError());
    setIsEditModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsEditModalOpen(false);
    dispatch(clearLoanPlanAndPenalityError());
  };

  const handleFormSubmit = async (formData) => {
    if (!canEdit) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(
        editLoanPlanAndPenality({ id: plan.id, formData })
      );
      if (editLoanPlanAndPenality.fulfilled.match(action)) {
        setIsEditModalOpen(false);
        dispatch(fetchLoanPlanAndPenalityById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = () => {
    if (!canDelete) return;
    dispatch(clearLoanPlanAndPenalityError());
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    dispatch(clearLoanPlanAndPenalityError());
  };

  const handleConfirmDelete = async () => {
    if (!canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeLoanPlanAndPenality(id));
      if (removeLoanPlanAndPenality.fulfilled.match(action)) {
        navigate("/loan-plans", { replace: true });
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-base-content/40 gap-3">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading loan plan…</p>
      </div>
    );
  }

  if (!plan && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
        <span className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/30">
          <AlertCircle size={26} />
        </span>
        <div>
          <p className="text-sm font-bold text-base-content/70">
            Loan plan not found
          </p>
          <p className="text-xs text-base-content/40 mt-1">
            This plan may have been deleted or the ID is invalid.
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm gap-1.5"
          onClick={() => navigate("/loan-plans")}
        >
          <ArrowLeft size={14} />
          Back to Loan Plans
        </button>
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right text-base-content">
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square -ml-1"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Landmark size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-base-content">{plan.plan_name}</h1>
              <span
                className={`badge gap-1 font-medium ${STATUS_STYLES[plan.status] || "badge-ghost"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {plan.status?.charAt(0).toUpperCase() + plan.status?.slice(1)}
              </span>
            </div>
            <p className="text-xs text-base-content/40 font-mono mt-0.5">{plan.plan_code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              id="delete-loan-plan-btn"
              onClick={handleOpenDelete}
              className="btn btn-ghost btn-sm gap-1.5 text-error hover:bg-error/10"
              title="Delete plan"
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}

          {canEdit && (
            <button
              id="edit-loan-plan-btn"
              onClick={handleOpenEdit}
              className="btn btn-primary btn-sm gap-1.5 shadow-sm"
              title="Edit plan"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Quick stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Calendar size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Tenure</div>
            <div className="text-lg font-bold leading-tight text-base-content">
              {plan.tenure} {plan.tenure_type}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Commission</div>
            <div className="text-lg font-bold leading-tight text-base-content">
              {commissionDisplay}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning shrink-0">
            <ShieldAlert size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Late Penalty</div>
            <div className="text-lg font-bold leading-tight text-base-content">
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
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
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
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
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
            <p className="text-sm text-base-content/40 py-4">
              No penalty configured for this plan.
            </p>
          )}
        </div>

        {/* Record Info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2 shadow-sm">
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
      {isEditModalOpen && canEdit && (
        <LoanPlanFormModal
          open={isEditModalOpen}
          initialData={plan}
          loading={formSubmitting}
          error={isEditModalOpen ? error : null}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && canDelete && (
        <LoanPlanDeleteModal
          open={isDeleteModalOpen}
          plan={plan}
          loading={deleteSubmitting}
          error={isDeleteModalOpen ? error : null}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      )}
    </div>
  );
}
