import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  User,
  HandCoins,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import {
  fetchCustomerById,
  editCustomer,
  clearSelectedCustomer,
  clearCustomerError,
} from "../../../redux/customers/customerSlice.js";
import { fetchCustomerLoans } from "../../../redux/customerLoans/customerLoanSlice.js";
import CustomerFormModal from "../components/CustomerFormModal.jsx";
import CustomerOverviewTab from "../components/customer-view/CustomerOverviewTab.jsx";
import CustomerLoansTab from "../components/customer-view/CustomerLoansTab.jsx";
import CustomerDocumentsTab from "../components/customer-view/CustomerDocumentsTab.jsx";
import ComingSoonTab from "../components/customer-view/ComingSoonTab.jsx";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { customer, loading, error } = useSelector((state) => state.customers);
  const { customerLoans, loading: loansLoading } = useSelector(
    (state) => state.customerLoans,
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomerById(id));
    dispatch(fetchCustomerLoans()); // ideally filtered server-side by customer_id — see note below
    return () => dispatch(clearSelectedCustomer());
  }, [dispatch, id]);

  // Client-side filter until/unless the backend supports ?customer_id=
  const customerLoansList = useMemo(
    () => customerLoans.filter((l) => String(l.customer_id) === String(id)),
    [customerLoans, id],
  );

  const handleEditSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const action = await dispatch(editCustomer({ id, formData }));
      if (editCustomer.fulfilled.match(action)) {
        setEditModalOpen(false);
        dispatch(fetchCustomerById(id));
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading && !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading customer…</p>
      </div>
    );
  }

  if (!customer) return null;

  const fullName = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ");

  const TABS = [
    { key: "overview", label: "Overview", icon: User },
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
      count: (customer.documents || []).length,
    },
    { key: "coming-soon", label: "Coming Soon", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="avatar">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
              {customer.photo ? (
                <img
                  src={customer.photo}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold uppercase">
                  {customer.first_name?.slice(0, 2)}
                </span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-xs text-base-content/40">
              {customer.customer_no}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[customer.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {customer.status?.charAt(0).toUpperCase() +
              customer.status?.slice(1)}
          </span>
        </div>

        <button
          onClick={() => {
            dispatch(clearCustomerError());
            setEditModalOpen(true);
          }}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-base-300 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/40 hover:text-base-content/70"
                }`}
            >
              <Icon size={14} />
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`badge badge-xs font-bold ${isActive ? "badge-primary" : "badge-ghost"
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <CustomerOverviewTab customer={customer} />}

      {activeTab === "loans" && (
        <CustomerLoansTab loans={customerLoansList} loading={loansLoading} />
      )}

      {activeTab === "documents" && (
        <CustomerDocumentsTab customer={customer} />
      )}

      {activeTab === "coming-soon" && (
        <ComingSoonTab
          title="More coming soon"
          description="Payment reminders, communication history, and other customer-level insights will show up here as they're built."
        />
      )}

      <CustomerFormModal
        open={editModalOpen}
        initialData={customer}
        loading={formSubmitting}
        error={editModalOpen ? error : null}
        onClose={() => {
          setEditModalOpen(false);
          dispatch(clearCustomerError());
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
