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
import { fetchCustomerLoans } from "../../../redux/customerLoans/customerLoanSlice.js";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import CustomerDeleteModal from "../components/CustomerDeleteModal.jsx";
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
function buildTabs(customer, customerLoansList) {
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
      count: customerLoansList.length,
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

  const { customer, loading, error } = useSelector((state) => state.customers);
  const { customerLoans, loading: loansLoading } = useSelector(
    (state) => state.customerLoans
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // ── Fetch data on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    if (canView) {
      dispatch(fetchCustomerById(id));
      dispatch(fetchCustomerLoans());
    }
    return () => dispatch(clearSelectedCustomer());
  }, [dispatch, id, canView]);

  // ── Derived data ──────────────────────────────────────────────────────────────
  const customerLoansList = useMemo(
    () => customerLoans.filter((l) => String(l.customer_id) === String(id)),
    [customerLoans, id]
  );

  const fullName = useMemo(
    () =>
      [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
      "Unknown Customer",
    [customer]
  );

  const tabs = useMemo(
    () => buildTabs(customer, customerLoansList),
    [customer, customerLoansList]
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
    if (!canEdit) return;
    setFormSubmitting(true);
    try {
      const action = await dispatch(editCustomer({ id, formData }));
      if (editCustomer.fulfilled.match(action)) {
        handleCloseEdit();
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
    if (!canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCustomer(id));
      if (removeCustomer.fulfilled.match(action)) {
        navigate("/customers", { replace: true });
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading && !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3 text-base-content/40">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading customer profile…</p>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!customer && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
        <span className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/30">
          <AlertCircle size={26} />
        </span>
        <div>
          <p className="text-sm font-bold text-base-content/70">
            Customer not found
          </p>
          <p className="text-xs text-base-content/40 mt-1">
            This customer may have been deleted or the ID is invalid.
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm gap-1.5"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft size={14} />
          Back to Customers
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header Card ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <div className="flex items-start justify-between flex-wrap gap-4 p-5">
          {/* Left: Avatar + identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm btn-square -ml-1"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <CustomerAvatar customer={customer} size="lg" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-base-content">
                  {fullName}
                </h1>
                <span
                  className={`badge gap-1 font-medium ${
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
        <CustomerLoansTab loans={customerLoansList} loading={loansLoading} />
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
    </div>
  );
}
