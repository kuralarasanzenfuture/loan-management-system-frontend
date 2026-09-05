import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Percent,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";
import {
  fetchInterestOnlyLoans,
  addInterestOnlyLoan,
  editInterestOnlyLoan,
  editInterestOnlyLoanStatus,
  removeInterestOnlyLoan,
  clearInterestOnlyLoanError,
} from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import { addInterestOnlyPayment } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import { fetchActiveInterestOnlyLoanPlans } from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import InterestOnlyLoanTable from "../components/InterestOnlyLoanTable.jsx";
import InterestOnlyLoanFormModal from "../components/InterestOnlyLoanFormModal.jsx";
import InterestOnlyLoanStatusModal from "../components/InterestOnlyLoanStatusModal.jsx";
import InterestOnlyLoanDeleteModal from "../components/InterestOnlyLoanDeleteModal.jsx";
import InterestOnlyPaymentModal from "../components/InterestOnlyPaymentModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";
import { formatCurrency } from "../utils/interestOnlyLoanHelpers.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "default", label: "Default" },
  { value: "cancelled", label: "Cancelled" },
];

export default function InterestOnlyLoansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
    PERMISSIONS.LOAN_VIEW,
  ]);
  const canCreate = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_CREATE,
    PERMISSIONS.LOAN_CREATE,
  ]);
  const canEdit = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_EDIT,
    PERMISSIONS.LOAN_EDIT,
  ]);
  const canPay = can([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.LOAN_COLLECTION_CREATE,
  ]);
  const canDelete = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_DELETE,
    PERMISSIONS.LOAN_DELETE,
  ]);

  const { loans = [], loading, error } = useSelector(
    (state) => state.interestOnlyLoans || {},
  );
  const company = useSelector((state) => state.companyDetails?.company);
  const { customers = [] } = useSelector((state) => state.customers || {});
  const { activePlans = [] } = useSelector(
    (state) => state.interestLoanPlans || {},
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Quick Payment Modal State from table action
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (canView) {
      dispatch(fetchInterestOnlyLoans());
      dispatch(fetchCustomers());
      dispatch(fetchActiveInterestOnlyLoanPlans());
      dispatch(fetchCompanyDetails());
    }
  }, [dispatch, canView]);

  const loanList = useMemo(() => (Array.isArray(loans) ? loans : []), [loans]);
  const customerList = useMemo(
    () => (Array.isArray(customers) ? customers : []),
    [customers],
  );

  const enrichedLoans = useMemo(() => {
    const customerMap = Object.fromEntries(customerList.map((c) => [c.id, c]));
    return loanList.map((loan) => {
      const c = customerMap[loan.customer_id];
      return {
        ...loan,
        customer_name:
          loan.customer_name ||
          (c
            ? `${c.first_name} ${c.last_name || ""}`.trim()
            : null),
        customer_no: loan.customer_no || c?.customer_no || null,
        customer_mobile: loan.customer_mobile || c?.mobile || null,
        customer_photo: loan.customer_photo || loan.photo || c?.photo || null,
        customer_city: c?.city || null,
      };
    });
  }, [loanList, customerList]);

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
          l.customer_name?.toLowerCase().includes(q),
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
    () => loanList.filter((l) => l.status === "active").length,
    [loanList],
  );
  const defaultCount = useMemo(
    () => loanList.filter((l) => l.status === "default").length,
    [loanList],
  );
  const totalPrincipal = useMemo(
    () =>
      loanList.reduce((sum, l) => sum + (Number(l.principal_amount) || 0), 0),
    [loanList],
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
    if (!canCreate) return;
    dispatch(clearInterestOnlyLoanError());
    setFormModal(true);
  };

  const handleCloseForm = () => {
    setFormModal(false);
    dispatch(clearInterestOnlyLoanError());
  };

  const handleFormSubmit = async (formData) => {
    if (!canCreate) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(addInterestOnlyLoan(formData));
      if (addInterestOnlyLoan.fulfilled.match(action)) {
        setFormModal(false);
        dispatch(fetchInterestOnlyLoans());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditLoanSubmit = async (formData) => {
    if (!canEdit || !editTarget) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(
        editInterestOnlyLoan({ id: editTarget.id, data: formData }),
      );
      if (editInterestOnlyLoan.fulfilled.match(action)) {
        setEditTarget(null);
        dispatch(fetchInterestOnlyLoans());
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusSubmit = async ({ id, data }) => {
    if (!canEdit) return;
    setStatusSubmitting(true);
    try {
      const action = await dispatch(editInterestOnlyLoanStatus({ id, data }));
      if (editInterestOnlyLoanStatus.fulfilled.match(action)) {
        setStatusTarget(null);
      }
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!canDelete || !deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeInterestOnlyLoan(deleteTarget.id));
      if (removeInterestOnlyLoan.fulfilled.match(action)) {
        setDeleteTarget(null);
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleQuickPaymentSubmit = async (formData) => {
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      const action = await dispatch(addInterestOnlyPayment(formData));
      if (addInterestOnlyPayment.fulfilled.match(action)) {
        dispatch(fetchInterestOnlyLoans());
        return { success: true, data: action.payload?.data || action.payload };
      } else {
        const errMsg = action.payload || "Failed to record payment";
        setPaymentError(errMsg);
        return { success: false, error: errMsg };
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-sm text-base-content/60 max-w-sm">
          You do not possess the required permission to view customer
          interest-only loans.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Percent size={20} className="text-primary" />
            Customer Interest Loans
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Loans where only interest is collected periodically, principal due
            at term end.
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary btn-sm gap-1.5"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            New loan
          </button>
        )}
      </div>

      {error && !formModal && !statusTarget && !deleteTarget && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>
            {typeof error === "string"
              ? error
              : error?.message || "Something went wrong."}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Percent size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Principal</div>
            <div className="text-2xl font-semibold leading-tight">
              {formatCurrency(totalPrincipal)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Active Loans</div>
            <div className="text-2xl font-semibold leading-tight text-success">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <AlertOctagon size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Defaulted</div>
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
            placeholder="Search by loan no or customer…"
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
        <InterestOnlyLoanTable
          loans={pagedLoans}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canPay={canPay}
          canDelete={canDelete}
          onView={(l) => navigate(`/interest-only-loans/${l.id}`)}
          onEdit={(l) => setEditTarget(l)}
          onStatusChange={(l) => setStatusTarget(l)}
          onRecordPayment={(l) => setPaymentTarget(l)}
          onDelete={(l) => setDeleteTarget(l)}
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

      {/* Create Modal */}
      {formModal && (
        <InterestOnlyLoanFormModal
          open={formModal}
          customers={customerList}
          plans={activePlans}
          loading={formSubmitting}
          error={error}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <InterestOnlyLoanFormModal
          open={Boolean(editTarget)}
          initialData={editTarget}
          customers={customerList}
          plans={activePlans}
          loading={formSubmitting}
          error={error}
          onClose={() => {
            setEditTarget(null);
            dispatch(clearInterestOnlyLoanError());
          }}
          onSubmit={handleEditLoanSubmit}
        />
      )}

      {/* Status Modal */}
      {statusTarget && (
        <InterestOnlyLoanStatusModal
          open={Boolean(statusTarget)}
          loan={statusTarget}
          loading={statusSubmitting}
          error={error}
          onClose={() => setStatusTarget(null)}
          onSubmit={handleStatusSubmit}
        />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <InterestOnlyLoanDeleteModal
          open={Boolean(deleteTarget)}
          loan={deleteTarget}
          loading={deleteSubmitting}
          error={error}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Quick Payment Modal */}
      {paymentTarget && (
        <InterestOnlyPaymentModal
          open={Boolean(paymentTarget)}
          loan={paymentTarget}
          company={company}
          loading={paymentSubmitting}
          error={paymentError}
          onClose={() => {
            setPaymentTarget(null);
            setPaymentError(null);
          }}
          onSubmit={handleQuickPaymentSubmit}
        />
      )}
    </div>
  );
}
