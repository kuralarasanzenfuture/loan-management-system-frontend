import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Wallet2, IndianRupee, AlertCircle } from "lucide-react";
import {
  fetchPersonalChits,
  addPersonalChit,
  editPersonalChit,
  removePersonalChit,
  clearPersonalChitError,
} from "../../../redux/personalChits/personalChitSlice.js";
import PersonalChitTable from "../components/PersonalChitTable.jsx";
import PersonalChitFormModal from "../components/PersonalChitFormModal.jsx";
import PersonalChitDeleteModal from "../components/PersonalChitDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import { formatCurrency } from "../utils/chitHelpers.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function PersonalChitsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    personalChits: chits,
    loading,
    error,
  } = useSelector((state) => state.personalChits);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPersonalChits());
  }, [dispatch]);

  const filteredChits = useMemo(() => {
    let result = chits;
    if (statusFilter !== "all")
      result = result.filter((c) => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.chit_name?.toLowerCase().includes(q) ||
          c.chit_no?.toLowerCase().includes(q) ||
          c.chit_provider?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [chits, search, statusFilter]);

  const {
    pagedData: pagedChits,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredChits, initialSize: 10 });

  const totalPending = useMemo(
    () =>
      chits.reduce((sum, c) => sum + (Number(c.total_pending_amount) || 0), 0),
    [chits],
  );
  const activeCount = useMemo(
    () => chits.filter((c) => c.status === "active").length,
    [chits],
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };
  const handleStatusFilterChange = (v) => {
    setStatusFilter(v);
    resetPage();
  };

  const handleOpenCreate = () => {
    dispatch(clearPersonalChitError());
    setFormModal({});
  };
  const handleOpenEdit = (chit) => {
    dispatch(clearPersonalChitError());
    setFormModal(chit);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearPersonalChitError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editPersonalChit({ id: formModal.id, formData }))
        : await dispatch(addPersonalChit(formData));

      const wasFulfilled = isEdit
        ? editPersonalChit.fulfilled.match(action)
        : addPersonalChit.fulfilled.match(action);
      if (wasFulfilled) setFormModal(null);
    } finally {
      dispatch(fetchPersonalChits());
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removePersonalChit(deleteTarget.id));
      if (removePersonalChit.fulfilled.match(action)) setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Wallet2 size={20} className="text-primary" />
            Personal Chits
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Track chit funds you've subscribed to across various providers.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New chit
        </button>
      </div>

      {error && !formModal && (
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
            <Wallet2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total chits</div>
            <div className="text-2xl font-semibold leading-tight">
              {chits.length}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <AlertCircle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Active</div>
            <div className="text-2xl font-semibold leading-tight text-info">
              {activeCount}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total pending</div>
            <div className="text-xl font-semibold leading-tight text-error">
              {formatCurrency(totalPending)}
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
            placeholder="Search chit, provider…"
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
        <PersonalChitTable
          chits={pagedChits}
          loading={loading}
          onView={(c) => navigate(`/personal-chits/${c.id}`)}
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
      <PersonalChitFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete modal */}
      <PersonalChitDeleteModal
        open={Boolean(deleteTarget)}
        chit={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
