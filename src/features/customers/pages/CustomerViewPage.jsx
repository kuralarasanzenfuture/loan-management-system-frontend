import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  HandCoins,
  FileCheck2,
  Percent,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchCustomerById,
  editCustomer,
  removeCustomer,
  clearSelectedCustomer,
  clearCustomerError,
} from "../../../redux/customers/customerSlice.js";
import {
  fetchCustomerLoans,
  addCustomerLoan,
} from "../../../redux/customerLoans/customerLoanSlice.js";
import { fetchLoanPlanAndPenalities } from "../../../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import {
  fetchInterestOnlyLoansByCustomer,
  fetchInterestOnlyLoans,
  addInterestOnlyLoan,
} from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import { fetchActiveInterestOnlyLoanPlans } from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import CustomerDeleteModal from "../components/CustomerDeleteModal.jsx";
import CustomerLoanFormModal from "../../customerLoans/components/CustomerLoanFormModal.jsx";
import InterestOnlyLoanFormModal from "../../customerInterest/components/InterestOnlyLoanFormModal.jsx";
import CustomerOverviewTab from "../components/customer-view/CustomerOverviewTab.jsx";
import CustomerLoansTab from "../components/customer-view/CustomerLoansTab.jsx";
import CustomerDocumentsTab from "../components/customer-view/CustomerDocumentsTab.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

// ─── Constants ──────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

// ─── Tab definitions ────────────────────────────────────────────────────────────
function buildTabs(customer, customerLoansList, customerInterestLoansList) {
  const totalLoans = (customerLoansList?.length || 0) + (customerInterestLoansList?.length || 0);
  return [
    {
      key: "overview",
      label: "Overview",
      icon: User,
    },
    {
      key: "loans",
      label: "Loans",
      icon: HandCoins,
      count: totalLoans,
    },
    {
      key: "documents",
      label: "Documents",
      icon: FileCheck2,
      count: (customer?.documents || []).length,
    },
  ];
}

// ─── Shared: Avatar initials ────────────────────────────────────────────────────
function CustomerAvatar({ customer, size = "lg" }) {
  const fullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = customer?.first_name?.slice(0, 2).toUpperCase() || "?";
  const sizeClass = size === "lg" ? "w-16 h-16 text-lg" : "w-11 h-11 text-sm";

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0`}
    >
      {customer?.photo ? (
        <img
          src={customer.photo}
          alt={fullName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Global Permissions ────────────────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.CUSTOMER_VIEW);
  const canEdit = can(PERMISSIONS.CUSTOMER_EDIT);
  const canDelete = can(PERMISSIONS.CUSTOMER_DELETE);
  const canCreateLoan = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_CREATE,
    PERMISSIONS.LOAN_CREATE,
  ]);

  const { customer, loading, error } = useSelector((state) => state.customers);
  const { customerLoans, loading: loansLoading } = useSelector(
    (state) => state.customerLoans
  );
  const { loanPlanAndPenalities: emiPlans = [] } = useSelector(
    (state) => state.loanPlanAndPenalities || {}
  );
  const {
    loans: allInterestLoans = [],
    customerLoans: interestCustomerLoans = [],
    loading: interestLoansLoading,
  } = useSelector((state) => state.interestOnlyLoans || {});
  const { activePlans: interestPlans = [] } = useSelector(
    (state) => state.interestLoanPlans || {}
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Regular EMI loan creation state
  const [emiLoanModalOpen, setEmiLoanModalOpen] = useState(false);
  const [emiLoanSubmitting, setEmiLoanSubmitting] = useState(false);
  const [emiLoanError, setEmiLoanError] = useState(null);

  // Interest loan creation state
  const [interestLoanModalOpen, setInterestLoanModalOpen] = useState(false);
  const [interestLoanSubmitting, setInterestLoanSubmitting] = useState(false);
  const [interestLoanError, setInterestLoanError] = useState(null);

  // ── Fetch data on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    if (canView) {
      dispatch(fetchCustomerById(id));
      dispatch(fetchCustomerLoans());
      dispatch(fetchLoanPlanAndPenalities());
      dispatch(fetchInterestOnlyLoansByCustomer(id));
      dispatch(fetchActiveInterestOnlyLoanPlans());
    }
    return () => dispatch(clearSelectedCustomer());
  }, [dispatch, id, canView]);

  // ── Derived data ──────────────────────────────────────────────────────────────
  const customerLoansList = useMemo(
    () => (customerLoans || []).filter((l) => String(l.customer_id) === String(id)),
    [customerLoans, id]
  );

  const customerInterestLoansList = useMemo(() => {
    if (interestCustomerLoans && interestCustomerLoans.length > 0) {
      return interestCustomerLoans;
    }
    return (allInterestLoans || []).filter(
      (l) => String(l.customer_id) === String(id)
    );
  }, [interestCustomerLoans, allInterestLoans, id]);

  const fullName = useMemo(
    () =>
      [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
      "Unknown Customer",
    [customer]
  );

  const tabs = useMemo(
    () => buildTabs(customer, customerLoansList, customerInterestLoansList),
    [customer, customerLoansList, customerInterestLoansList]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleOpenEdit = () => {
    if (!canEdit) return;
    dispatch(clearCustomerError());
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    dispatch(clearCustomerError());
  };

  const handleEditSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const res = await dispatch(editCustomer({ id, formData }));
      if (editCustomer.fulfilled.match(res)) {
        setEditModalOpen(false);
        dispatch(fetchCustomerById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = () => {
    if (!canDelete) return;
    dispatch(clearCustomerError());
    setDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    dispatch(clearCustomerError());
  };

  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await dispatch(removeCustomer(id));
      if (removeCustomer.fulfilled.match(res)) {
        setDeleteModalOpen(false);
        navigate("/customers", { replace: true });
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Regular EMI Loan creation handlers
  const handleOpenCreateLoan = () => {
    if (!canCreateLoan) return;
    setEmiLoanError(null);
    setEmiLoanModalOpen(true);
  };

  const handleCloseCreateLoan = () => {
    setEmiLoanModalOpen(false);
    setEmiLoanError(null);
  };

  const handleSubmitCreateLoan = async (formData) => {
    setEmiLoanSubmitting(true);
    setEmiLoanError(null);
    try {
      const res = await dispatch(addCustomerLoan(formData));
      if (addCustomerLoan.fulfilled.match(res)) {
        setEmiLoanModalOpen(false);
        dispatch(fetchCustomerLoans());
      } else {
        setEmiLoanError(res.payload || "Failed to create loan");
      }
    } catch (err) {
      setEmiLoanError(err.message || "Failed to create loan");
    } finally {
      setEmiLoanSubmitting(false);
    }
  };

  // Interest Loan creation handlers
  const handleOpenCreateInterestLoan = () => {
    if (!canCreateLoan) return;
    setInterestLoanError(null);
    setInterestLoanModalOpen(true);
  };

  const handleCloseCreateInterestLoan = () => {
    setInterestLoanModalOpen(false);
    setInterestLoanError(null);
  };

  const handleSubmitCreateInterestLoan = async (formData) => {
    setInterestLoanSubmitting(true);
    setInterestLoanError(null);
    try {
      const res = await dispatch(addInterestOnlyLoan(formData));
      if (addInterestOnlyLoan.fulfilled.match(res)) {
        setInterestLoanModalOpen(false);
        dispatch(fetchInterestOnlyLoansByCustomer(id));
        dispatch(fetchInterestOnlyLoans());
      } else {
        setInterestLoanError(res.payload || "Failed to create interest-only loan");
      }
    } catch (err) {
      setInterestLoanError(err.message || "Failed to create interest-only loan");
    } finally {
      setInterestLoanSubmitting(false);
    }
  };

  // ── Render States ─────────────────────────────────────────────────────

  if (loading && !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-base-content/50 font-medium">
          Loading customer profile…
        </p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-8 flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Failed to load customer</p>
          <p className="text-xs opacity-80 mt-0.5">
            {typeof error === "string" ? error : "Customer not found."}
          </p>
        </div>
        <button
          onClick={() => navigate("/customers")}
          className="btn btn-sm btn-ghost"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar / Back button ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/customers")}
          className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </button>
      </div>

      {/* ── Customer Header Card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Avatar + Identity */}
          <div className="flex items-center gap-4">
            <CustomerAvatar customer={customer} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-base-content">
                  {fullName}
                </h1>
                <span
                  className={`badge badge-sm gap-1 font-medium ${
                    STATUS_STYLES[customer?.status] || "badge-ghost"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {customer?.status
                    ? customer.status.charAt(0).toUpperCase() +
                      customer.status.slice(1)
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-base-content/50 font-mono">
                  {customer?.customer_no}
                </span>
                {customer?.mobile && (
                  <span className="text-xs text-base-content/50">
                    · {customer.mobile}
                  </span>
                )}
                {customer?.city && (
                  <span className="text-xs text-base-content/40">
                    · {customer.city}
                    {customer.state ? `, ${customer.state}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                id="delete-customer-btn"
                onClick={handleOpenDelete}
                className="btn btn-ghost btn-sm gap-1.5 text-error hover:bg-error/10"
                title="Delete customer"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}

            {canEdit && (
              <button
                id="edit-customer-btn"
                onClick={handleOpenEdit}
                className="btn btn-primary btn-sm gap-1.5 shadow-sm"
                title="Edit customer"
              >
                <Pencil size={15} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* ── Tab navigation ───────────────────────────────────────────────── */}
        <div className="flex items-center border-t border-base-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-base-content/50 hover:text-base-content/80 hover:bg-base-200/50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`badge badge-xs font-bold ${
                      isActive ? "badge-primary" : "badge-ghost"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      {activeTab === "overview" && customer && (
        <CustomerOverviewTab customer={customer} />
      )}

      {activeTab === "loans" && (
        <CustomerLoansTab
          loans={customerLoansList}
          interestLoans={customerInterestLoansList}
          loading={loansLoading || interestLoansLoading}
          onOpenCreateLoan={canCreateLoan ? handleOpenCreateLoan : undefined}
          onOpenCreateInterestLoan={canCreateLoan ? handleOpenCreateInterestLoan : undefined}
        />
      )}

      {activeTab === "documents" && customer && (
        <CustomerDocumentsTab customer={customer} />
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editModalOpen && canEdit && (
        <CustomerFormModal
          open={editModalOpen}
          initialData={customer}
          loading={formSubmitting}
          error={editModalOpen ? error : null}
          onClose={handleCloseEdit}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      {deleteModalOpen && canDelete && (
        <CustomerDeleteModal
          open={deleteModalOpen}
          customer={customer}
          loading={deleteSubmitting}
          error={deleteModalOpen ? error : null}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      )}

      {/* ── Regular EMI Loan Creation Modal ─────────────────────────────────── */}
      {emiLoanModalOpen && (
        <CustomerLoanFormModal
          open={emiLoanModalOpen}
          initialData={{
            customer_id: id,
            customer_name: fullName,
            mobile: customer?.mobile,
            customer_no: customer?.customer_no,
            photo: customer?.photo,
            city: customer?.city,
            state: customer?.state,
          }}
          customers={customer ? [customer] : []}
          plans={emiPlans}
          loading={emiLoanSubmitting}
          error={emiLoanError}
          lockedCustomer={true}
          onClose={handleCloseCreateLoan}
          onSubmit={handleSubmitCreateLoan}
        />
      )}

      {/* ── Interest Loan Creation Modal ────────────────────────────────────── */}
      {interestLoanModalOpen && (
        <InterestOnlyLoanFormModal
          open={interestLoanModalOpen}
          initialData={{
            customer_id: id,
            customer_name: fullName,
            mobile: customer?.mobile,
            customer_no: customer?.customer_no,
            photo: customer?.photo,
            city: customer?.city,
            state: customer?.state,
          }}
          customers={customer ? [customer] : []}
          plans={interestPlans}
          loading={interestLoanSubmitting}
          error={interestLoanError}
          lockedCustomer={true}
          onClose={handleCloseCreateInterestLoan}
          onSubmit={handleSubmitCreateInterestLoan}
        />
      )}
    </div>
  );
}
