import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  HandCoins,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Filter,
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
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

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

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();

  const canView = can(PERMISSIONS.LOAN_APPLICATION_VIEW) || can(PERMISSIONS.LOAN_VIEW);
  const canCreate = can(PERMISSIONS.LOAN_APPLICATION_CREATE) || can(PERMISSIONS.LOAN_CREATE);
  const canEdit = can(PERMISSIONS.LOAN_APPLICATION_EDIT) || can(PERMISSIONS.LOAN_EDIT);
  const canDelete = can(PERMISSIONS.LOAN_APPLICATION_DELETE) || can(PERMISSIONS.LOAN_DELETE);
  const canChangeStatus = canEdit || can(PERMISSIONS.LOAN_APPROVAL_ACTION) || can(PERMISSIONS.LOAN_APPROVAL_VIEW);

  console.log("canView", canView);
  console.log("canCreate", canCreate);
  console.log("canEdit", canEdit);
  console.log("canDelete", canDelete);
  console.log("canChangeStatus", canChangeStatus);
  
  const { customers } = useSelector((state) => state.customers);
  const { loanPlanAndPenalities: plans } = useSelector(
    (state) => state.loanPlanAndPenalities
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
    if (canView) {
      dispatch(fetchCustomerLoans());
      dispatch(fetchCustomers());
      dispatch(fetchLoanPlanAndPenalities());
    }
  }, [dispatch, canView]);

  // Enrich loans with customer/plan names, unique customer numbers & mobile for display
  const enrichedLoans = useMemo(() => {
    const customerMap = Object.fromEntries(
      (customers || []).map((c) => [c.id, c])
    );
    const planMap = Object.fromEntries((plans || []).map((p) => [p.id, p]));
    return loans.map((loan) => {
      const c = customerMap[loan.customer_id];
      const p = planMap[loan.loan_plan_id];
      const cName = [c?.first_name, c?.last_name].filter(Boolean).join(" ");
      return {
        ...loan,
        customer_name:
          loan.customer_name ||
          (cName ? cName : `Customer #${loan.customer_id}`),
        customer_no: loan.customer_no || c?.customer_no || null,
        customer_mobile: loan.customer_mobile || c?.mobile || null,
        photo: loan.photo || c?.photo || null,
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
          l.customer_no?.toLowerCase().includes(q) ||
          l.customer_mobile?.includes(q) ||
          l.plan_name?.toLowerCase().includes(q)
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
    [loans]
  );
  const defaultCount = useMemo(
    () => loans.filter((l) => l.status === "default").length,
    [loans]
  );
  const totalDisbursed = useMemo(
    () =>
      loans.reduce((sum, l) => sum + (Number(l.net_disbursed_amount) || 0), 0),
    [loans]
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
    if (!canCreate) return;
    dispatch(clearCustomerLoanError());
    setFormModal({});
  };
  const handleOpenEdit = (loan) => {
    if (!canEdit) return;
    dispatch(clearCustomerLoanError());
    setFormModal(loan);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearCustomerLoanError());
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = Boolean(formModal?.id);
    if (isEdit && !canEdit) return;
    if (!isEdit && !canCreate) return;

    setFormSubmitting(true);
    try {
      const action = isEdit
        ? await dispatch(editCustomerLoan({ id: formModal.id, formData }))
        : await dispatch(addCustomerLoan(formData));

      const wasFulfilled = isEdit
        ? editCustomerLoan.fulfilled.match(action)
        : addCustomerLoan.fulfilled.match(action);

      if (wasFulfilled) {
        setFormModal(null);
        dispatch(fetchCustomerLoans());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusSubmit = async (formData) => {
    if (!canChangeStatus) return;
    setStatusSubmitting(true);
    try {
      const action = await dispatch(
        editCustomerLoanStatus({ id: statusTarget.id, formData })
      );
      if (editCustomerLoanStatus.fulfilled.match(action)) {
        setStatusTarget(null);
        dispatch(fetchCustomerLoans());
      }
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOpenDelete = (loan) => {
    if (!canDelete) return;
    dispatch(clearCustomerLoanError());
    setDeleteTarget(loan);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCustomerLoan(deleteTarget.id));
      if (removeCustomerLoan.fulfilled.match(action)) {
        setDeleteTarget(null);
        dispatch(fetchCustomerLoans());
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
          <h1 className="text-xl font-semibold flex items-center gap-2 text-base-content">
            <HandCoins size={20} className="text-primary" />
            Customer Loans
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Issue and manage loans against customer profiles and repayment plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm gap-1.5"
            onClick={() => dispatch(fetchCustomerLoans())}
            title="Refresh loans list"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          {canCreate && (
            <button
              id="create-customer-loan-btn"
              className="btn btn-primary btn-sm gap-1.5 shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus size={16} />
              New Loan
            </button>
          )}
        </div>
      </div>

      {error && !formModal && !statusTarget && !deleteTarget && (
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
            <HandCoins size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Total Disbursed</div>
            <div className="text-xl font-bold leading-tight text-base-content">
              {formatCurrency(totalDisbursed)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-info/10 text-info shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Active Loans</div>
            <div className="text-2xl font-bold leading-tight text-info">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-error/10 text-error shrink-0">
            <AlertOctagon size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">In Default</div>
            <div className="text-2xl font-bold leading-tight text-error">
              {defaultCount}
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
            placeholder="Search loan no., customer, plan…"
            value={search}
            onChange={handleSearchChange}
            id="customer-loan-search-input"
          />
        </label>

        <div className="join border border-base-300 rounded-xl overflow-hidden flex-wrap">
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
        <CustomerLoanTable
          loans={pagedLoans}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          canChangeStatus={canChangeStatus}
          onView={(l) => {
            if (canView) navigate(`/loans/${l.id}`);
          }}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onStatusChange={(l) => {
            if (canChangeStatus) setStatusTarget(l);
          }}
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
      )}

      {/* Status change modal */}
      {statusTarget && canChangeStatus && (
        <LoanStatusModal
          open={Boolean(statusTarget)}
          loan={statusTarget}
          loading={statusSubmitting}
          error={statusTarget ? error : null}
          onClose={() => setStatusTarget(null)}
          onSubmit={handleStatusSubmit}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && canDelete && (
        <CustomerLoanDeleteModal
          open={Boolean(deleteTarget)}
          loan={deleteTarget}
          loading={deleteSubmitting}
          error={deleteTarget ? error : null}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
