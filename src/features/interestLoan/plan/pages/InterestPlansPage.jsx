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
  fetchInterestPlans,
  addInterestPlan,
  editInterestPlan,
  changeInterestPlanStatus,
  removeInterestPlan,
  clearInterestPlanError,
} from "../../../../redux/interestLoan/plan/interestPlanSlice.js";
import InterestPlanTable from "../components/InterestPlanTable.jsx";
import InterestPlanFormModal from "../components/InterestPlanFormModal.jsx";
import InterestPlanDeleteModal from "../components/InterestPlanDeleteModal.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/hooks/usePagination.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import {
  INTEREST_FREQUENCY_OPTIONS,
  INTEREST_FREQUENCY_LABELS,
} from "../utils/interestPlanHelpers.js";

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function InterestPlansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Global Permissions ──────────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.INTEREST_LOAN_PLAN_VIEW);
  const canCreate = can(PERMISSIONS.INTEREST_LOAN_PLAN_CREATE);
  const canEdit = can(PERMISSIONS.INTEREST_LOAN_PLAN_EDIT);
  const canDelete = can(PERMISSIONS.INTEREST_LOAN_PLAN_DELETE);

  const { plans, loading, error } = useSelector(
    (state) => state.interestPlans || {},
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (canView) {
      dispatch(fetchInterestPlans());
    }
  }, [dispatch, canView]);

  const planList = useMemo(() => (Array.isArray(plans) ? plans : []), [plans]);

  const filteredPlans = useMemo(() => {
    let result = planList;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (frequencyFilter !== "all") {
      result = result.filter((p) => p.interest_frequency === frequencyFilter);
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
  }, [planList, search, statusFilter, frequencyFilter]);

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

  const handleFrequencyFilterChange = (v) => {
    setFrequencyFilter(v);
    resetPage();
  };

  const handleOpenCreate = () => {
    if (!canCreate) return;
    dispatch(clearInterestPlanError());
    setFormModal({});
  };

  const handleOpenEdit = (plan) => {
    if (!canEdit) return;
    dispatch(clearInterestPlanError());
    setFormModal(plan);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearInterestPlanError());
  };

  const handleFormSubmit = async (formData) => {
    if (formModal?.id ? !canEdit : !canCreate) return;
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(
            editInterestPlan({ id: formModal.id, formData }),
          )
        : await dispatch(addInterestPlan(formData));

      const wasFulfilled = isEdit
        ? editInterestPlan.fulfilled.match(action)
        : addInterestPlan.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
        dispatch(fetchInterestPlans());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = (plan) => {
    if (!canEdit) return;
    const nextStatus = plan.status === "active" ? "inactive" : "active";
    dispatch(
      changeInterestPlanStatus({
        id: plan.id,
        data: { status: nextStatus },
      }),
    );
  };

  const handleConfirmDelete = async () => {
    if (!canDelete || !deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeInterestPlan(deleteTarget.id));
      if (removeInterestPlan.fulfilled.match(action)) {
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
          You do not possess permission to view interest loan plans.
          Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-base-content">
            <Percent size={22} className="text-primary" />
            Interest Loan Plans
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Configure interest rate schemes, frequencies, and repayment terms for anytime interest loans.
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary btn-sm gap-1.5 rounded-lg shadow-sm"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            Create Plan
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && !formModal && (
        <div className="alert alert-error text-sm py-3 rounded-xl">
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "An unexpected error occurred."}
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Total Plans</div>
            <div className="text-2xl font-bold text-base-content leading-tight">
              {planList.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Active Plans</div>
            <div className="text-2xl font-bold text-success leading-tight">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-base-200 text-base-content/50 shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Inactive Plans</div>
            <div className="text-2xl font-bold text-base-content/70 leading-tight">
              {inactiveCount}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />
            <input
              type="text"
              placeholder="Search by name or plan code…"
              className="input input-bordered input-sm w-full pl-9 rounded-lg"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Frequency Filter */}
            <select
              className="select select-bordered select-sm rounded-lg text-xs"
              value={frequencyFilter}
              onChange={(e) => handleFrequencyFilterChange(e.target.value)}
            >
              <option value="all">All Frequencies</option>
              {INTEREST_FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {INTEREST_FREQUENCY_LABELS[f] || f}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="select select-bordered select-sm rounded-lg text-xs"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Table Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <InterestPlanTable
          plans={pagedPlans}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={(p) => navigate(`/interest-plans/${p.id}`)}
          onEdit={handleOpenEdit}
          onDelete={(p) => setDeleteTarget(p)}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-base-200">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <InterestPlanFormModal
        open={Boolean(formModal)}
        initialData={formModal}
        loading={formSubmitting}
        error={error}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <InterestPlanDeleteModal
        open={Boolean(deleteTarget)}
        plan={deleteTarget}
        loading={deleteSubmitting}
        error={error}
        onClose={() => {
          setDeleteTarget(null);
          dispatch(clearInterestPlanError());
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

