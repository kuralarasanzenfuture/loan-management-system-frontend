import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  fetchHandLoans,
  addHandLoan,
  editHandLoan,
  removeHandLoan,
  clearHandLoanError,
} from "../../../redux/handLoans/handLoanSlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import HandLoanTable from "../components/HandLoanTable.jsx";
import HandLoanFormModal from "../components/HandLoanFormModal.jsx";
import HandLoanDeleteModal from "../components/HandLoanDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import { formatCurrency } from "../utils/handLoanHelpers.js";

const DIRECTION_FILTERS = [
  { value: "all", label: "All" },
  { value: "given", label: "Given" },
  { value: "borrowed", label: "Borrowed" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export default function HandLoansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    handLoans: loans,
    loading,
    error,
  } = useSelector((state) => state.handLoans);
  const { customers } = useSelector((state) => state.customers);

  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHandLoans());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredLoans = useMemo(() => {
    let result = loans;
    if (directionFilter !== "all")
      result = result.filter((l) => l.loan_direction === directionFilter);
    if (statusFilter !== "all")
      result = result.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.person_name?.toLowerCase().includes(q) ||
          l.hand_loan_no?.toLowerCase().includes(q) ||
          l.mobile?.includes(q),
      );
    }
    return result;
  }, [loans, search, directionFilter, statusFilter]);

  const {
    pagedData: pagedLoans,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredLoans, initialSize: 10 });

  const totalGivenOutstanding = useMemo(
    () =>
      loans
        .filter((l) => l.loan_direction === "given")
        .reduce((sum, l) => sum + (Number(l.outstanding_amount) || 0), 0),
    [loans],
  );
  const totalBorrowedOutstanding = useMemo(
    () =>
      loans
        .filter((l) => l.loan_direction === "borrowed")
        .reduce((sum, l) => sum + (Number(l.outstanding_amount) || 0), 0),
    [loans],
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };
  const handleDirectionFilterChange = (v) => {
    setDirectionFilter(v);
    resetPage();
  };
  const handleStatusFilterChange = (v) => {
    setStatusFilter(v);
    resetPage();
  };

  const handleOpenCreate = () => {
    dispatch(clearHandLoanError());
    setFormModal({});
  };
  const handleOpenEdit = (loan) => {
    dispatch(clearHandLoanError());
    setFormModal(loan);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearHandLoanError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editHandLoan({ id: formModal.id, formData }))
        : await dispatch(addHandLoan(formData));

      const wasFulfilled = isEdit
        ? editHandLoan.fulfilled.match(action)
        : addHandLoan.fulfilled.match(action);
      if (wasFulfilled) setFormModal(null);
    } finally {
      dispatch(fetchHandLoans());
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeHandLoan(deleteTarget.id));
      if (removeHandLoan.fulfilled.match(action)) setDeleteTarget(null);
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
            <HandCoins size={20} className="text-primary" />
            Hand Loans
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Track informal loans given to or borrowed from individuals.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New hand loan
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <ArrowUpRight size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Outstanding (Given)
            </div>
            <div className="text-xl font-semibold leading-tight text-info">
              {formatCurrency(totalGivenOutstanding)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning shrink-0">
            <ArrowDownLeft size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Outstanding (Borrowed)
            </div>
            <div className="text-xl font-semibold leading-tight text-warning">
              {formatCurrency(totalBorrowedOutstanding)}
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
            placeholder="Search person, loan no., mobile…"
            value={search}
            onChange={handleSearchChange}
          />
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="join">
            {DIRECTION_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`join-item btn btn-sm ${directionFilter === f.value
                    ? "btn-primary"
                    : "btn-ghost bg-base-100 border-base-300"
                  }`}
                onClick={() => handleDirectionFilterChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="select select-bordered select-sm rounded-lg bg-base-100"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <HandLoanTable
          loans={pagedLoans}
          loading={loading}
          onView={(l) => navigate(`/hand-loans/${l.id}`)}
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
      <HandLoanFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        customers={customers || []}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete modal */}
      <HandLoanDeleteModal
        open={Boolean(deleteTarget)}
        loan={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
