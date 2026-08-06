import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, CheckCircle2, Ban } from "lucide-react";
import {
  fetchCustomers,
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

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export default function CustomersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useSelector((state) => state.customers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

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
          c.pan_no?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [customers, search, statusFilter]);

  const {
    pagedData: pagedCustomers,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredCustomers, initialSize: 10 });

  const activeCount = useMemo(
    () => customers.filter((c) => c.status === "active").length,
    [customers],
  );
  const blockedCount = useMemo(
    () => customers.filter((c) => c.status === "blocked").length,
    [customers],
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
    dispatch(clearCustomerError());
    setFormModal({});
  };

  const handleOpenEdit = (customer) => {
    dispatch(clearCustomerError());
    setFormModal(customer);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearCustomerError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editCustomer({ id: formModal.id, formData }))
        : await dispatch(addCustomer(formData));

      const wasFulfilled = isEdit
        ? editCustomer.fulfilled.match(action)
        : addCustomer.fulfilled.match(action);

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
      const action = await dispatch(removeCustomer(deleteTarget.id));
      if (removeCustomer.fulfilled.match(action)) {
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
            <Users size={20} className="text-primary" />
            Customers
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage borrower profiles, KYC, and contact details.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New customer
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
            <Users size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total customers</div>
            <div className="text-2xl font-semibold leading-tight">
              {customers.length}
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
            placeholder="Search name, mobile, Aadhaar, PAN…"
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
        <CustomerTable
          customers={pagedCustomers}
          loading={loading}
          onView={(c) => navigate(`/customers/${c.id}`)}
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
      <CustomerFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
      <CustomerDeleteModal
        open={Boolean(deleteTarget)}
        itemName={[deleteTarget?.first_name, deleteTarget?.last_name]
          .filter(Boolean)
          .join(" ")}
        itemLabel="customer"
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
