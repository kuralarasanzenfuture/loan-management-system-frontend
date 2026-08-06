import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import {
  fetchUsers,
  addUser,
  editUser,
  removeUser,
  clearUserError,
} from "../../../redux/users/userSlice.js";
import { fetchRoles } from "../../../redux/roles/roleSlice.js";
import UserTable from "../components/UserTable.jsx";
import UserFormModal from "../components/UserFormModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export default function UsersPage() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { roles } = useSelector((state) => state.roles);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null); // null closed, {} create, {...user} edit
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const roleMap = useMemo(
    () => Object.fromEntries((roles || []).map((r) => [r.id, r.name])),
    [roles],
  );

  const filteredUsers = useMemo(() => {
    let result = users;

    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.mobile?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [users, search, statusFilter]);

  const {
    pagedData: pagedUsers,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredUsers, initialSize: 10 });

  const activeCount = useMemo(
    () => users.filter((u) => u.status === "active").length,
    [users],
  );
  const blockedCount = useMemo(
    () => users.filter((u) => u.status === "blocked").length,
    [users],
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPage();
  };

  const handleOpenCreate = () => {
    dispatch(clearUserError());
    setFormModal({});
  };

  const handleOpenEdit = (user) => {
    dispatch(clearUserError());
    setFormModal(user);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearUserError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editUser({ id: formModal.id, formData }))
        : await dispatch(addUser(formData));

      const wasFulfilled = isEdit
        ? editUser.fulfilled.match(action)
        : addUser.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeUser(deleteTarget.id));
      if (removeUser.fulfilled.match(action)) {
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
            <UsersIcon size={20} className="text-primary" />
            Users
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage platform users, their roles, and account status.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New user
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
            <UsersIcon size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total users</div>
            <div className="text-2xl font-semibold leading-tight">
              {users.length}
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
            <Ban size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Blocked</div>
            <div className="text-2xl font-semibold leading-tight text-error">
              {blockedCount}
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
            placeholder="Search users…"
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
        <UserTable
          users={pagedUsers}
          loading={loading}
          roleMap={roleMap}
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
      <UserFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        roles={roles || []}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        itemName={deleteTarget?.username}
        itemLabel="user"
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
