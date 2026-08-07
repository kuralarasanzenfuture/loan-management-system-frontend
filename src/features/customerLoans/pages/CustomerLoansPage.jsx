import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  HandCoins,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import {
  fetchCustomerLoans,
  addCustomerLoan,
  editCustomerLoan,
  editCustomerLoanStatus,
  removeCustomerLoan,
  clearCustomerLoanError,
} from "../../../redux/customerLoans/customerLoanSlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import { fetchLoanPlanAndPenalities } from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import CustomerLoanTable from "../components/CustomerLoanTable.jsx";
import CustomerLoanFormModal from "../components/CustomerLoanFormModal.jsx";
import CustomerLoanDeleteModal from "../components/CustomerLoanDeleteModal.jsx";
import LoanStatusModal from "../components/LoanStatusModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import { formatCurrency } from "../utils/loanCalculations.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "default", label: "Default" },
];

export default function CustomerLoansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    customerLoans: loans,
    loading,
    error,
  } = useSelector((state) => state.customerLoans);
  const { customers } = useSelector((state) => state.customers);
  const { loanPlanAndPenalities: plans } = useSelector(
    (state) => state.loanPlanAndPenalities,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerLoans());
    dispatch(fetchCustomers());
    dispatch(fetchLoanPlanAndPenalities());
  }, [dispatch]);

  // Enrich loans with customer/plan names for display, in case the
  // backend list endpoint doesn't already join them.
  const enrichedLoans = useMemo(() => {
    const customerMap = Object.fromEntries(
      (customers || []).map((c) => [c.id, c]),
    );
    const planMap = Object.fromEntries((plans || []).map((p) => [p.id, p]));
    return loans.map((loan) => {
      const c = customerMap[loan.customer_id];
      const p = planMap[loan.loan_plan_id];
      return {
        ...loan,
        customer_name:
          loan.customer_name ||
          (c ? `${c.first_name} ${c.last_name || ""}`.trim() : null),
        plan_name: loan.plan_name || p?.plan_name || null,
      };
    });
  }, [loans, customers, plans]);

  const filteredLoans = useMemo(() => {
    let result = enrichedLoans;

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.loan_no?.toLowerCase().includes(q) ||
          l.customer_name?.toLowerCase().includes(q) ||
          l.plan_name?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [enrichedLoans, search, statusFilter]);

  const {
    pagedData: pagedLoans,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredLoans, initialSize: 10 });

  const activeCount = useMemo(
    () => loans.filter((l) => l.status === "active").length,
    [loans],
  );
  const defaultCount = useMemo(
    () => loans.filter((l) => l.status === "default").length,
    [loans],
  );
  const totalDisbursed = useMemo(
    () =>
      loans.reduce((sum, l) => sum + (Number(l.net_disbursed_amount) || 0), 0),
    [loans],
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
    dispatch(clearCustomerLoanError());
    setFormModal({});
  };
  const handleOpenEdit = (loan) => {
    dispatch(clearCustomerLoanError());
    setFormModal(loan);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearCustomerLoanError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editCustomerLoan({ id: formModal.id, formData }))
        : await dispatch(addCustomerLoan(formData));

      const wasFulfilled = isEdit
        ? editCustomerLoan.fulfilled.match(action)
        : addCustomerLoan.fulfilled.match(action);

      if (wasFulfilled) setFormModal(null);
      await dispatch(fetchCustomerLoans());
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusSubmit = async (formData) => {
    setStatusSubmitting(true);
    try {
      const action = await dispatch(
        editCustomerLoanStatus({ id: statusTarget.id, formData }),
      );
      if (editCustomerLoanStatus.fulfilled.match(action)) setStatusTarget(null);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCustomerLoan(deleteTarget.id));
      if (removeCustomerLoan.fulfilled.match(action)) setDeleteTarget(null);
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
            <HandCoins size={20} className="text-primary" />
            Customer Loans
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Issue and manage loans against customer profiles and repayment
            plans.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New loan
        </button>
      </div>

      {error && !formModal && !statusTarget && (
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
            <HandCoins size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total disbursed</div>
            <div className="text-xl font-semibold leading-tight">
              {formatCurrency(totalDisbursed)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Active loans</div>
            <div className="text-2xl font-semibold leading-tight text-info">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <AlertOctagon size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">In default</div>
            <div className="text-2xl font-semibold leading-tight text-error">
              {defaultCount}
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
            placeholder="Search loan no., customer, plan…"
            value={search}
            onChange={handleSearchChange}
          />
        </label>

        <div className="join flex-wrap">
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
        <CustomerLoanTable
          loans={pagedLoans}
          loading={loading}
          onView={(l) => navigate(`/loans/${l.id}`)}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
          onStatusChange={setStatusTarget}
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
      <CustomerLoanFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        customers={customers || []}
        plans={plans || []}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Status change modal */}
      <LoanStatusModal
        open={Boolean(statusTarget)}
        loan={statusTarget}
        loading={statusSubmitting}
        error={statusTarget ? error : null}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleStatusSubmit}
      />

      {/* Delete confirm modal */}
      <CustomerLoanDeleteModal
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
