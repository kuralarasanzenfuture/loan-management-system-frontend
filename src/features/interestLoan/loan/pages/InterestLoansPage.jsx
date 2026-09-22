import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Receipt,
  Layers,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  CreditCard,
} from "lucide-react";
import {
  fetchInterestLoans,
  fetchInterestLoanSummary,
  removeInterestLoan,
} from "../../../../redux/interestLoan/loan/interestLoanSlice.js";
import InterestLoanTable from "../components/InterestLoanTable.jsx";
import InterestLoanFormModal from "../components/InterestLoanFormModal.jsx";
import InterestLoanDeleteModal from "../components/InterestLoanDeleteModal.jsx";
import InterestLoanPaymentFormModal from "../../payment/components/InterestLoanPaymentFormModal.jsx";
import InterestLoanModuleNav from "../components/InterestLoanModuleNav.jsx";
import { formatCurrency } from "../utils/interestLoanHelpers.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

const InterestLoansPage = () => {
  const dispatch = useDispatch();

  // ── Permissions ──────────────────────────────────────────────────────────
  const { can } = usePermissions();
  const canCreate = can(PERMISSIONS.INTEREST_ONLY_LOAN_CREATE);
  const canEdit = can(PERMISSIONS.INTEREST_ONLY_LOAN_EDIT);
  const canDelete = can(PERMISSIONS.INTEREST_ONLY_LOAN_DELETE);
  const canCollect = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_PAY,
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.INTEREST_ONLY_LOAN_CREATE,
  ]);

  const { loans, summary, pagination, loading } = useSelector(
    (state) => state.interestLoans || {},
  );

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deletingLoan, setDeletingLoan] = useState(null);
  const [collectingLoan, setCollectingLoan] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch Summary and Loans
  const loadData = () => {
    dispatch(fetchInterestLoanSummary());
    const params = {
      page: currentPage,
      limit: 10,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (statusFilter !== "all") params.status = statusFilter;
    if (frequencyFilter) params.interest_frequency = frequencyFilter;

    dispatch(fetchInterestLoans(params));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, currentPage, statusFilter, frequencyFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingLoan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setIsModalOpen(true);
  };

  const handleDelete = (loan) => {
    setDeletingLoan(loan);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLoan) return;
    setDeleteSubmitting(true);
    try {
      await dispatch(removeInterestLoan(deletingLoan.id)).unwrap();
      setDeletingLoan(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete loan:", err);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2 text-base-content">
            <Receipt size={20} className="text-primary" />
            Anytime Interest Loans
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Manage flexible customer interest-based credit accounts & billing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/interest-loans/payments"
            className="btn btn-outline btn-sm gap-1.5 rounded-xl text-xs font-semibold"
            title="Go to Anytime Loan Payments"
          >
            <CreditCard size={14} />
            <span>Payments Ledger</span>
          </Link>

          <button
            className="btn btn-ghost btn-sm gap-1.5 text-xs text-base-content/70 rounded-xl"
            onClick={loadData}
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm gap-1.5 shadow-xs text-xs rounded-xl"
            >
              <Plus size={15} />
              New Loan
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InterestLoanModuleNav activeTab="loans" />

      {/* Summary KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total & Active Loans */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            <Layers size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Total Loans</div>
            <div className="text-2xl font-bold leading-tight text-base-content flex items-baseline gap-1.5">
              {summary?.total_loans || 0}
              <span className="text-xs font-semibold text-info">
                ({summary?.active_loans || 0} Active)
              </span>
            </div>
          </div>
        </div>

        {/* Disbursed Principal */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-info/10 text-info shrink-0">
            <DollarSign size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Disbursed Principal</div>
            <div className="text-2xl font-bold leading-tight text-base-content">
              {formatCurrency(summary?.total_principal_disbursed)}
            </div>
          </div>
        </div>

        {/* Outstanding Principal */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-warning/10 text-warning shrink-0">
            <TrendingUp size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Outstanding Principal</div>
            <div className="text-2xl font-bold leading-tight text-warning">
              {formatCurrency(summary?.total_outstanding_principal)}
            </div>
          </div>
        </div>

        {/* Collected Interest */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-xs text-base-content/50 font-medium">Interest Collected</div>
            <div className="text-2xl font-bold leading-tight text-success">
              {formatCurrency(summary?.total_interest_paid)}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Search */}
        <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-sm bg-base-100 rounded-xl border-base-300">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow text-sm"
            placeholder="Search loan #, customer…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        {/* Status Tabs & Frequency */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="join border border-base-300 rounded-xl overflow-hidden">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`join-item btn btn-sm px-3.5 ${statusFilter === tab.value
                    ? "btn-primary font-bold"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={frequencyFilter}
            onChange={(e) => {
              setFrequencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="select select-bordered select-sm rounded-xl bg-base-100 border-base-300 text-xs text-base-content font-medium"
          >
            <option value="">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <InterestLoanTable
        loans={loans}
        loading={loading}
        canEdit={canEdit}
        canDelete={canDelete}
        canCollect={canCollect}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCollectPayment={(loan) => setCollectingLoan(loan)}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-base-content/50">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="join border border-base-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="join-item btn btn-sm btn-ghost disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="join-item btn btn-sm btn-ghost disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Form Modal (Create or Edit) */}
      <InterestLoanFormModal
        isOpen={isModalOpen}
        initialData={editingLoan}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLoan(null);
        }}
        onSuccess={() => loadData()}
      />

      {/* Delete Confirmation Modal */}
      <InterestLoanDeleteModal
        open={Boolean(deletingLoan)}
        loan={deletingLoan}
        loading={deleteSubmitting}
        onClose={() => setDeletingLoan(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Collect Payment Modal */}
      <InterestLoanPaymentFormModal
        open={Boolean(collectingLoan)}
        preselectedLoan={collectingLoan}
        onClose={() => setCollectingLoan(null)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};

export default InterestLoansPage;
