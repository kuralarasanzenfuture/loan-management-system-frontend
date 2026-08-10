import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Landmark, CheckCircle2, XCircle } from "lucide-react";
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState("");

  useEffect(() => {
    dispatch(fetchLoanPlanAndPenalities());
  }, [dispatch]);

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
          p.collection_frequency?.toLowerCase().includes(q),
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
    [plans],
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
    dispatch(clearLoanPlanAndPenalityError());
    setFormModal({});
  };

  const handleOpenEdit = (plan) => {
    dispatch(clearLoanPlanAndPenalityError());
    setFormModal(plan);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearLoanPlanAndPenalityError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(
            editLoanPlanAndPenality({ id: formModal.id, formData }),
          )
        : await dispatch(addLoanPlanAndPenality(formData));

      const wasFulfilled = isEdit
        ? editLoanPlanAndPenality.fulfilled.match(action)
        : addLoanPlanAndPenality.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
        // Redux slice already updates the list in-memory — no need to re-fetch
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeLoanPlanAndPenality(deleteTarget.id));
      if (removeLoanPlanAndPenality.fulfilled.match(action)) {
        setDeleteTarget(null);
        dispatch(clearLoanPlanAndPenalityError());
        // If backend soft-deactivated instead of deleting, show info
        if (action.payload?.response?.deactivated) {
          setDeactivatedMsg(
            `"${deleteTarget.plan_name}" is in use by active loans. It has been set to Inactive instead of being deleted.`,
          );
          setTimeout(() => setDeactivatedMsg(""), 6000);
        }
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Landmark size={20} className="text-primary" />
            Loan Plans & Penalties
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Define repayment plans, commission, and late-payment penalty rules.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New plan
        </button>
      </div>

      {deactivatedMsg && (
        <div className="alert alert-info text-sm py-2 mb-4">
          <span>{deactivatedMsg}</span>
        </div>
      )}

      {error && !formModal && !deleteTarget && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Landmark size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total plans</div>
            <div className="text-2xl font-semibold leading-tight">
              {plans.length}
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
        <LoanPlanTable
          plans={pagedPlans}
          loading={loading}
          onView={(p) => navigate(`/loan-plans/${p.id}`)}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
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
      <LoanPlanFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
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
    </div>
  );
}
