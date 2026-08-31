import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Landmark, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import {
  fetchLoanPlanAndPenalities,
  addLoanPlanAndPenality,
  editLoanPlanAndPenality,
  removeLoanPlanAndPenality,
  clearLoanPlanAndPenalityError,
} from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import LoanPlanTable from "../components/LoanPlanTable.jsx";
import LoanPlanFormModal from "../components/LoanPlanFormModal.jsx";
import LoanPlanDeleteModal from "../components/LoanPlanDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function LoanPlansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    loanPlanAndPenalities: plans,
    loading,
    error,
  } = useSelector((state) => state.loanPlanAndPenalities);

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.LOAN_PLAN_VIEW);
  const canCreate = can(PERMISSIONS.LOAN_PLAN_CREATE);
  const canEdit = can(PERMISSIONS.LOAN_PLAN_EDIT);
  const canDelete = can(PERMISSIONS.LOAN_PLAN_DELETE);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState("");

  useEffect(() => {
    if (canView) {
      dispatch(fetchLoanPlanAndPenalities());
    }
  }, [dispatch, canView]);

  const filteredPlans = useMemo(() => {
    let result = plans;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.plan_name?.toLowerCase().includes(q) ||
          p.plan_code?.toLowerCase().includes(q) ||
          p.collection_frequency?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [plans, search, statusFilter]);

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
    () => plans.filter((p) => p.status === "active").length,
    [plans]
  );
  const inactiveCount = plans.length - activeCount;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPage();
  };

  const handleOpenCreate = () => {
    if (!canCreate) return;
    dispatch(clearLoanPlanAndPenalityError());
    setFormModal({});
  };

  const handleOpenEdit = (plan) => {
    if (!canEdit) return;
    dispatch(clearLoanPlanAndPenalityError());
    setFormModal(plan);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearLoanPlanAndPenalityError());
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = Boolean(formModal?.id);
    if (isEdit && !canEdit) return;
    if (!isEdit && !canCreate) return;

    setFormSubmitting(true);
    try {
      const action = isEdit
        ? await dispatch(
            editLoanPlanAndPenality({ id: formModal.id, formData })
          )
        : await dispatch(addLoanPlanAndPenality(formData));

      const wasFulfilled = isEdit
        ? editLoanPlanAndPenality.fulfilled.match(action)
        : addLoanPlanAndPenality.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
        dispatch(fetchLoanPlanAndPenalities());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (plan) => {
    if (!canDelete) return;
    dispatch(clearLoanPlanAndPenalityError());
    setDeleteTarget(plan);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeLoanPlanAndPenality(deleteTarget.id));
      if (removeLoanPlanAndPenality.fulfilled.match(action)) {
        setDeleteTarget(null);
        dispatch(clearLoanPlanAndPenalityError());
        dispatch(fetchLoanPlanAndPenalities());
        // If backend soft-deactivated instead of deleting, show info
        if (action.payload?.response?.deactivated) {
          setDeactivatedMsg(
            `"${deleteTarget.plan_name}" is in use by active loans. It has been set to Inactive instead of being deleted.`
          );
          setTimeout(() => setDeactivatedMsg(""), 6000);
        }
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-base-content">
            <Landmark size={20} className="text-primary" />
            Loan Plans & Penalties
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Define repayment plans, commission, and late-payment penalty rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm gap-1.5"
            onClick={() => dispatch(fetchLoanPlanAndPenalities())}
            title="Refresh plans list"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          {canCreate && (
            <button
              id="create-loan-plan-btn"
              className="btn btn-primary btn-sm gap-1.5 shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus size={16} />
              New Plan
            </button>
          )}
        </div>
      </div>

      {deactivatedMsg && (
        <div className="alert alert-info text-sm py-2 rounded-xl">
          <span>{deactivatedMsg}</span>
        </div>
      )}

      {error && !formModal && !deleteTarget && (
        <div className="alert alert-error text-sm py-2 rounded-xl">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <Landmark size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Total Plans</div>
            <div className="text-2xl font-bold leading-tight text-base-content">
              {plans.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Active</div>
            <div className="text-2xl font-bold leading-tight text-success">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-error/10 text-error shrink-0">
            <XCircle size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Inactive</div>
            <div className="text-2xl font-bold leading-tight text-error">
              {inactiveCount}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-sm bg-base-100 rounded-xl border-base-300">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow text-sm"
            placeholder="Search plans by name or code…"
            value={search}
            onChange={handleSearchChange}
            id="loan-plan-search-input"
          />
        </label>

        <div className="join border border-base-300 rounded-xl overflow-hidden">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              id={`status-filter-${f.value}`}
              className={`join-item btn btn-sm px-3 ${
                statusFilter === f.value
                  ? "btn-primary font-bold"
                  : "btn-ghost text-base-content/60 hover:text-base-content"
              }`}
              onClick={() => handleStatusFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
        <LoanPlanTable
          plans={pagedPlans}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={(p) => {
            if (canView) navigate(`/loan-plans/${p.id}`);
          }}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
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
        <LoanPlanFormModal
          open={Boolean(formModal)}
          initialData={formModal?.id ? formModal : null}
          loading={formSubmitting}
          error={formModal ? error : null}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <LoanPlanDeleteModal
          open={Boolean(deleteTarget)}
          plan={deleteTarget}
          loading={deleteSubmitting}
          error={deleteTarget ? error : null}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setDeleteTarget(null);
            dispatch(clearLoanPlanAndPenalityError());
          }}
        />
      )}
    </div>
  );
}
