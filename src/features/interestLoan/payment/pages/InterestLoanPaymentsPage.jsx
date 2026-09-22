import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, CreditCard, RefreshCw, Layers, Receipt } from "lucide-react";
import {
  fetchPayments,
  fetchPaymentSummary,
  reversePaymentThunk,
} from "../../../../redux/interestLoan/payment/interestLoanPaymentSlice.js";
import InterestLoanPaymentSummaryCards from "../components/InterestLoanPaymentSummaryCards.jsx";
import InterestLoanPaymentTable from "../components/InterestLoanPaymentTable.jsx";
import InterestLoanPaymentFormModal from "../components/InterestLoanPaymentFormModal.jsx";
import InterestLoanPaymentReceiptModal from "../components/InterestLoanPaymentReceiptModal.jsx";
import InterestLoanPaymentReverseModal from "../components/InterestLoanPaymentReverseModal.jsx";
import InterestLoanModuleNav from "../../loan/components/InterestLoanModuleNav.jsx";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

export default function InterestLoanPaymentsPage() {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission([
    PERMISSIONS.INTEREST_ONLY_LOAN_PAY,
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.INTEREST_ONLY_LOAN_CREATE,
  ]);
  const canDelete = hasPermission([
    PERMISSIONS.INTEREST_ONLY_PAYMENT_DELETE,
    PERMISSIONS.INTEREST_ONLY_LOAN_DELETE,
  ]);

  const { payments, pagination, summary, loading, summaryLoading, reversing } =
    useSelector((state) => state.interestLoanPayments || {});

  // Filters State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    payment_mode: "",
    from_date: "",
    to_date: "",
    sort_by: "id",
    sort_order: "desc",
  });

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState(null);
  const [selectedReversePayment, setSelectedReversePayment] = useState(null);

  // Sanitize filters so empty string parameters are never dispatched to API
  const cleanFilters = useMemo(() => {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
  }, [filters]);

  // Initial Load & Filter change trigger
  useEffect(() => {
    dispatch(fetchPayments(cleanFilters));
  }, [dispatch, cleanFilters]);

  // Load summary metrics on page mount
  useEffect(() => {
    dispatch(fetchPaymentSummary());
  }, [dispatch]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    dispatch(fetchPayments(cleanFilters));
    dispatch(fetchPaymentSummary());
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchPayments(cleanFilters));
    dispatch(fetchPaymentSummary());
  };

  const handleConfirmReverse = async (paymentId) => {
    const res = await dispatch(reversePaymentThunk(paymentId));
    if (reversePaymentThunk.fulfilled.match(res)) {
      setSelectedReversePayment(null);
      dispatch(fetchPaymentSummary());
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary/10 text-primary shrink-0">
            <CreditCard size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-base-content tracking-tight">
              Anytime Interest Loan Payments
            </h1>
            <p className="text-xs text-base-content/50 mt-0.5">
              Manage collections, view line-item allocations, and generate receipts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <Link
            to="/interest-loans"
            className="btn btn-outline btn-sm gap-1.5 rounded-xl text-xs font-semibold"
            title="Go to Anytime Interest Loans"
          >
            <Receipt size={14} />
            <span>Anytime Loans</span>
          </Link>

          <button
            onClick={handleRefresh}
            className="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content rounded-xl"
            title="Refresh payments"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {canCreate && (
            <button
              onClick={() => setIsCollectModalOpen(true)}
              className="btn btn-primary btn-sm gap-2 rounded-xl shadow-xs text-xs font-semibold"
            >
              <Plus size={15} />
              <span>Collect Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <InterestLoanModuleNav activeTab="payments" />

      {/* Summary KPI Cards */}
      <InterestLoanPaymentSummaryCards
        summary={summary}
        loading={summaryLoading}
      />

      {/* Payments Table */}
      <InterestLoanPaymentTable
        payments={payments}
        pagination={pagination}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewReceipt={(p) => setSelectedReceiptPayment(p)}
        onReversePayment={(p) => setSelectedReversePayment(p)}
        canDelete={canDelete}
      />

      {/* Collect Payment Modal */}
      <InterestLoanPaymentFormModal
        open={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <InterestLoanPaymentReceiptModal
        open={Boolean(selectedReceiptPayment)}
        payment={selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
      />

      {/* Reverse Modal */}
      <InterestLoanPaymentReverseModal
        open={Boolean(selectedReversePayment)}
        payment={selectedReversePayment}
        loading={reversing}
        onClose={() => setSelectedReversePayment(null)}
        onConfirm={handleConfirmReverse}
      />
    </div>
  );
}
