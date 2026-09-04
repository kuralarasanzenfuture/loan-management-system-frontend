import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Percent,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import {
  fetchInterestOnlyLoanPlans,
  addInterestOnlyLoanPlan,
  editInterestOnlyLoanPlan,
  changeInterestOnlyLoanPlanStatus,
  removeInterestOnlyLoanPlan,
  clearInterestLoanPlanError,
} from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";
import InterestLoanPlanTable from "../components/InterestLoanPlanTable.jsx";
import InterestLoanPlanFormModal from "../components/InterestLoanPlanFormModal.jsx";
import InterestLoanPlanDeleteModal from "../components/InterestLoanPlanDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function InterestLoanPlansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_VIEW,
    PERMISSIONS.LOAN_PLAN_VIEW,
  ]);
  const canCreate = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_CREATE,
    PERMISSIONS.LOAN_PLAN_CREATE,
  ]);
  const canEdit = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_EDIT,
    PERMISSIONS.LOAN_PLAN_EDIT,
  ]);
  const canDelete = can([
    PERMISSIONS.INTEREST_LOAN_PLAN_DELETE,
    PERMISSIONS.LOAN_PLAN_DELETE,
  ]);

  const { plans, loading, error } = useSelector(
    (state) => state.interestLoanPlans || {},
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView) {
      dispatch(fetchInterestOnlyLoanPlans());
    }
  }, [dispatch, canView]);

  const planList = useMemo(() => (Array.isArray(plans) ? plans : []), [plans]);

  const filteredPlans = useMemo(() => {
    let result = planList;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.plan_name?.toLowerCase().includes(q) ||
          p.plan_code?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [planList, search, statusFilter]);

  const {
    pagedData: pagedPlans,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredPlans, initialSize: 10 });

  const activeCount = useMemo(
    () => planList.filter((p) => p.status === "active").length,
    [planList],
  );
  const inactiveCount = planList.length - activeCount;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (v) => {
    setStatusFilter(v);
    resetPage();
  };

  const handleOpenCreate = () => {
    if (!canCreate) return;
    dispatch(clearInterestLoanPlanError());
    setFormModal({});
  };

  const handleOpenEdit = (plan) => {
    if (!canEdit) return;
    dispatch(clearInterestLoanPlanError());
    setFormModal(plan);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearInterestLoanPlanError());
  };

  const handleFormSubmit = async (formData) => {
    if (formModal?.id ? !canEdit : !canCreate) return;
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(
            editInterestOnlyLoanPlan({ id: formModal.id, formData }),
          )
        : await dispatch(addInterestOnlyLoanPlan(formData));

      const wasFulfilled = isEdit
        ? editInterestOnlyLoanPlan.fulfilled.match(action)
        : addInterestOnlyLoanPlan.fulfilled.match(action);

      if (wasFulfilled) setFormModal(null);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = (plan) => {
    if (!canEdit) return;
    const nextStatus = plan.status === "active" ? "inactive" : "active";
    dispatch(
      changeInterestOnlyLoanPlanStatus({
        id: plan.id,
        data: { status: nextStatus },
      }),
    );
  };

  const handleConfirmDelete = async () => {
    if (!canDelete || !deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(
        removeInterestOnlyLoanPlan(deleteTarget.id),
      );
      if (removeInterestOnlyLoanPlan.fulfilled.match(action)) {
        setDeleteTarget(null);
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
          You do not possess the required permission to view interest-only loan
          plans. Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Percent size={20} className="text-primary" />
            Interest-Only Loan Plans
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Loan plans where only interest is collected periodically, with
            principal due at the end of the term.
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary btn-sm gap-1.5"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            New plan
          </button>
        )}
      </div>

      {error && !formModal && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong."}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Percent size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total plans</div>
            <div className="text-2xl font-semibold leading-tight">
              {planList.length}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Active</div>
            <div className="text-2xl font-semibold leading-tight text-success">
              {activeCount}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <XCircle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Inactive</div>
            <div className="text-2xl font-semibold leading-tight text-error">
              {inactiveCount}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-xs bg-base-100">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow"
            placeholder="Search plans by name or code…"
            value={search}
            onChange={handleSearchChange}
          />
        </label>

        <div className="join">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`join-item btn btn-sm ${
                statusFilter === f.value
                  ? "btn-primary"
                  : "btn-ghost bg-base-100 border-base-300"
              }`}
              onClick={() => handleStatusFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <InterestLoanPlanTable
          plans={pagedPlans}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={(p) => navigate(`/interest-loan-plans/${p.id}`)}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
          onToggleStatus={handleToggleStatus}
        />
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Create / edit modal */}
      {formModal && (
        <InterestLoanPlanFormModal
          open={Boolean(formModal)}
          initialData={formModal?.id ? formModal : null}
          loading={formSubmitting}
          error={error}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <InterestLoanPlanDeleteModal
          open={Boolean(deleteTarget)}
          plan={deleteTarget}
          loading={deleteSubmitting}
          error={error}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
