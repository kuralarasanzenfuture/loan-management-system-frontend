import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Plus,
  HandCoins,
  User,
  Receipt,
} from "lucide-react";
import {
  fetchHandLoanById,
  fetchHandLoanTransactions,
  addHandLoanTransaction,
  editHandLoan,
  clearSelectedHandLoan,
  clearHandLoanError,
} from "../../../redux/handLoans/handLoanSlice.js";
import { fetchCustomers } from "../../../redux/customers/customerSlice.js";
import { fetchCompanyBanks } from "../../../redux/companyBanks/companyBankSlice.js";
import HandLoanFormModal from "../components/HandLoanFormModal.jsx";
import HandLoanTransactionModal from "../components/HandLoanTransactionModal.jsx";
import HandLoanTransactionsTable from "../components/HandLoanTransactionsTable.jsx";
import {
  DIRECTION_LABELS,
  DIRECTION_STYLES,
  STATUS_STYLES,
  formatCurrency,
} from "../utils/handLoanHelpers.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-base-content/40">{label}</span>
      <span className="font-medium text-right">
        {value || <span className="text-base-content/30">—</span>}
      </span>
    </div>
  );
}

export default function HandLoanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    handLoan: loan,
    transactions,
    loading,
    error,
  } = useSelector((state) => state.handLoans);
  const { customers } = useSelector((state) => state.customers);
  const { companyBanks } = useSelector((state) => state.companyBanks);

  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnSubmitting, setTxnSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHandLoanById(id));
    dispatch(fetchHandLoanTransactions(id));
    dispatch(fetchCustomers());
    dispatch(fetchCompanyBanks());
    return () => dispatch(clearSelectedHandLoan());
  }, [dispatch, id]);

  const handleEditSubmit = async (formData) => {
    setEditSubmitting(true);
    try {
      const action = await dispatch(editHandLoan({ id, formData }));
      if (editHandLoan.fulfilled.match(action)) {
        setEditOpen(false);
        dispatch(fetchHandLoanById(id));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleTxnSubmit = async ({ id: loanId, formData }) => {
    setTxnSubmitting(true);
    try {
      const action = await dispatch(
        addHandLoanTransaction({ id: loanId, formData }),
      );
      if (addHandLoanTransaction.fulfilled.match(action)) {
        setTxnModalOpen(false);
        dispatch(fetchHandLoanById(id));
        dispatch(fetchHandLoanTransactions(id));
      }
    } finally {
      setTxnSubmitting(false);
    }
  };

  if (loading && !loan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading hand loan…</p>
      </div>
    );
  }

  if (!loan) return null;

  const repaidPercent =
    loan.amount > 0
      ? Math.round((Number(loan.paid_amount) / Number(loan.amount)) * 100)
      : 0;

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
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <HandCoins size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">{loan.person_name}</h1>
            <p className="text-xs text-base-content/40 font-mono">
              {loan.hand_loan_no}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${DIRECTION_STYLES[loan.loan_direction] || "badge-ghost"}`}
          >
            {DIRECTION_LABELS[loan.loan_direction]}
          </span>
          <span
            className={`badge gap-1.5 font-medium ${STATUS_STYLES[loan.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              dispatch(clearHandLoanError());
              setTxnModalOpen(true);
            }}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <Plus size={15} />
            Record Transaction
          </button>
          <button
            onClick={() => {
              dispatch(clearHandLoanError());
              setEditOpen(true);
            }}
            className="btn btn-outline btn-sm gap-1.5 border-base-300"
          >
            <Pencil size={15} />
            Edit
          </button>
        </div>
      </div>

      {/* Amount summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Total Amount</div>
          <div className="text-xl font-semibold leading-tight">
            {formatCurrency(loan.amount)}
          </div>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Paid Amount</div>
          <div className="text-xl font-semibold leading-tight text-success">
            {formatCurrency(loan.paid_amount)}
          </div>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Outstanding</div>
          <div className="text-xl font-semibold leading-tight text-error">
            {formatCurrency(loan.outstanding_amount)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <User size={13} /> Person & Loan Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Mobile" value={loan.mobile} />
            <InfoRow label="Address" value={loan.address} />
            <InfoRow
              label="Given Date"
              value={new Date(loan.given_date).toLocaleDateString()}
            />
            <InfoRow
              label="Expected Return"
              value={
                loan.expected_return_date
                  ? new Date(loan.expected_return_date).toLocaleDateString()
                  : null
              }
            />
            <InfoRow
              label="Completed Date"
              value={
                loan.completed_date
                  ? new Date(loan.completed_date).toLocaleDateString()
                  : null
              }
            />
            <InfoRow label="Payment Mode" value={loan.payment_mode} />
            <InfoRow label="Purpose" value={loan.purpose} />
          </div>

          <div className="mt-4 pt-3 border-t border-base-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-base-content/70">
                Repayment Progress
              </span>
              <span className="font-bold text-primary">{repaidPercent}%</span>
            </div>
            <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${repaidPercent}%` }}
              />
            </div>
          </div>

          {loan.remarks && (
            <div className="mt-4 pt-3 border-t border-base-200">
              <p className="text-xs text-base-content/40 mb-1">Remarks</p>
              <p className="text-sm text-base-content/70">{loan.remarks}</p>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Receipt size={13} /> Transaction History
          </h3>
          <HandLoanTransactionsTable
            transactions={transactions}
            loading={loading}
          />
        </div>
      </div>

      {/* Edit modal */}
      <HandLoanFormModal
        open={editOpen}
        initialData={loan}
        customers={customers || []}
        loading={editSubmitting}
        error={editOpen ? error : null}
        onClose={() => {
          setEditOpen(false);
          dispatch(clearHandLoanError());
        }}
        onSubmit={handleEditSubmit}
      />

      {/* Add transaction modal */}
      <HandLoanTransactionModal
        open={txnModalOpen}
        loan={loan}
        banks={companyBanks || []}
        loading={txnSubmitting}
        error={txnModalOpen ? error : null}
        onClose={() => {
          setTxnModalOpen(false);
          dispatch(clearHandLoanError());
        }}
        onSubmit={handleTxnSubmit}
      />
    </div>
  );
}
