import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  CheckCircle2,
  Ban,
  UserX,
  RefreshCw,
  Filter,
  ShieldAlert,
} from "lucide-react";
import {
  fetchCustomers,
  fetchCustomerById,
  addCustomer,
  editCustomer,
  removeCustomer,
  clearCustomerError,
} from "../../../redux/customers/customerSlice.js";
import CustomerTable from "../components/CustomerTable.jsx";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import CustomerDeleteModal from "../components/CustomerDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

// ─── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
      <span
        className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${bgClass} ${colorClass}`}
      >
        <Icon size={20} />
      </span>
      <div>
        <div className="text-xs text-base-content/50 font-medium">{label}</div>
        <div className="text-2xl font-bold leading-tight text-base-content">
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useSelector((state) => state.customers);

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.CUSTOMER_VIEW);
  const canCreate = can(PERMISSIONS.CUSTOMER_CREATE);
  const canEdit = can(PERMISSIONS.CUSTOMER_EDIT);
  const canDelete = can(PERMISSIONS.CUSTOMER_DELETE);

  // ── Local UI state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formModal, setFormModal] = useState(null); // null = closed, {} = create, {...customer} = edit
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // ── Initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (canView) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, canView]);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.first_name?.toLowerCase().includes(q) ||
          c.last_name?.toLowerCase().includes(q) ||
          c.mobile?.includes(q) ||
          c.customer_no?.toLowerCase().includes(q) ||
          c.aadhaar_no?.includes(q) ||
          c.pan_no?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [customers, search, statusFilter]);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const {
    pagedData: pagedCustomers,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredCustomers, initialSize: 10 });

  // ── Stat aggregates ───────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      inactive: customers.filter((c) => c.status === "inactive").length,
      blocked: customers.filter((c) => c.status === "blocked").length,
    }),
    [customers]
  );

  // ── Search & filter handlers ──────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPage();
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────────

  /** Open Create modal */
  const handleOpenCreate = () => {
    if (!canCreate) return;
    dispatch(clearCustomerError());
    setFormModal({});
  };

  /** Open Edit modal — fetches fresh data first so all fields are populated */
  const handleOpenEdit = async (customer) => {
    if (!canEdit) return;
    dispatch(clearCustomerError());
    const res = await dispatch(fetchCustomerById(customer.id));
    setFormModal(
      fetchCustomerById.fulfilled.match(res)
        ? res.payload.data ?? res.payload
        : customer
    );
  };

  /** Close form modal and clear any stale errors */
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearCustomerError());
  };

  /** Create or update a customer */
  const handleFormSubmit = async (formData) => {
    const isEdit = Boolean(formModal?.id);
    if (isEdit && !canEdit) return;
    if (!isEdit && !canCreate) return;

    setFormSubmitting(true);
    try {
      const action = isEdit
        ? await dispatch(editCustomer({ id: formModal.id, formData }))
        : await dispatch(addCustomer(formData));

      const succeeded = isEdit
        ? editCustomer.fulfilled.match(action)
        : addCustomer.fulfilled.match(action);

      if (succeeded) {
        handleCloseForm();
        dispatch(fetchCustomers());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  /** Open delete confirmation modal */
  const handleOpenDelete = (customer) => {
    if (!canDelete) return;
    dispatch(clearCustomerError());
    setDeleteTarget(customer);
  };

  /** Execute delete after confirmation */
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCustomer(deleteTarget.id));
      if (removeCustomer.fulfilled.match(action)) {
        setDeleteTarget(null);
        dispatch(fetchCustomers());
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Navigate to view page ─────────────────────────────────────────────────────
  const handleView = (customer) => {
    if (!canView) return;
    navigate(`/customers/${customer.id}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2 text-base-content">
            <Users size={20} className="text-primary" />
            Customers
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Manage borrower profiles, KYC documents and contact details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm gap-1.5"
            onClick={() => dispatch(fetchCustomers())}
            title="Refresh list"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          {canCreate && (
            <button
              id="create-customer-btn"
              className="btn btn-primary btn-sm gap-1.5 shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus size={16} />
              New Customer
            </button>
          )}
        </div>
      </div>

      {/* ── Global error (outside any modal) ────────────────────────────────── */}
      {error && !formModal && !deleteTarget && (
        <div className="alert alert-error text-sm py-2 rounded-xl">
          <span>{typeof error === "string" ? error : "Something went wrong."}</span>
        </div>
      )}

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={stats.total}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={stats.active}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={stats.inactive}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          icon={Ban}
          label="Blocked"
          value={stats.blocked}
          colorClass="text-error"
          bgClass="bg-error/10"
        />
      </div>

      {/* ── Toolbar: Search + Status filter ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-sm bg-base-100 rounded-xl border-base-300">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow text-sm"
            placeholder="Search name, mobile, Aadhaar, PAN…"
            value={search}
            onChange={handleSearchChange}
            id="customer-search-input"
          />
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/50 font-medium flex items-center gap-1">
            <Filter size={12} />
            Status
          </span>
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
      </div>

      {/* ── Table + Pagination ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
        <CustomerTable
          customers={pagedCustomers}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={handleView}
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

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {formModal && (
        <CustomerFormModal
          open={Boolean(formModal)}
          initialData={formModal?.id ? formModal : null}
          loading={formSubmitting}
          error={formModal ? error : null}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteTarget && (
        <CustomerDeleteModal
          open={Boolean(deleteTarget)}
          customer={deleteTarget}
          loading={deleteSubmitting}
          error={deleteTarget ? error : null}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setDeleteTarget(null);
            dispatch(clearCustomerError());
          }}
        />
      )}
    </div>
  );
}
