import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import {
  fetchRoles,
  addRole,
  editRole,
  removeRole,
  clearRoleError,
} from "../../../redux/roles/roleSlice.js";
import RoleTable from "../components/RoleTable.jsx";
import RoleFormModal from "../components/RoleFormModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function RolesPage() {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form modal state: null = closed, {} = create, {...role} = edit
  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const filteredRoles = useMemo(() => {
    let result = roles;

    if (statusFilter !== "all") {
      result = result.filter((r) =>
        statusFilter === "inactive"
          ? r.status === "inactive"
          : r.status !== "inactive",
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [roles, search, statusFilter]);

  // Paginate the filtered result
  const {
    pagedData: pagedRoles,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredRoles, initialSize: 10 });

  const activeCount = useMemo(
    () => roles.filter((r) => r.status !== "inactive").length,
    [roles],
  );
  const inactiveCount = roles.length - activeCount;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage(); // jump back to page 1 when the query changes
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPage(); // jump back to page 1 when the filter changes
  };

  const handleOpenCreate = () => {
    dispatch(clearRoleError());
    setFormModal({});
  };

  const handleOpenEdit = (role) => {
    dispatch(clearRoleError());
    setFormModal(role);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearRoleError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editRole({ id: formModal.id, formData }))
        : await dispatch(addRole(formData));

      const wasFulfilled = isEdit
        ? editRole.fulfilled.match(action)
        : addRole.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
      }
      // On rejection, the thunk's error lands in Redux `error` and
      // RoleFormModal already reads it via the `error` prop below.
    } finally {
      setFormSubmitting(false);
      dispatch(fetchRoles());
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeRole(deleteTarget.id));
      if (removeRole.fulfilled.match(action)) {
        setDeleteTarget(null);
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
            <ShieldCheck size={20} className="text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage what each role can see and do across the platform.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New role
        </button>
      </div>

      {/* Fetch-level error (not the form's — that's shown inside the modal) */}
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
            <ShieldCheck size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total roles</div>
            <div className="text-2xl font-semibold leading-tight">
              {roles.length}
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

      {/* Toolbar: search + status filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-xs bg-base-100">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow"
            placeholder="Search roles…"
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
        <RoleTable
          roles={pagedRoles}
          loading={loading}
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
      <RoleFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.name}
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}