import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  fetchBankTransactions,
  fetchBankTransactionSummary,
  addBankTransaction,
  reverseTransaction,
  clearBankTransactionError,
} from "../../../redux/bankTransactions/bankTransactionSlice.js";
import BankTransactionTable from "../components/BankTransactionTable.jsx";
import BankTransactionFormModal from "../components/BankTransactionFormModal.jsx";
import ReverseTransactionModal from "../components/ReverseTransactionModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import {
  formatCurrency,
  REFERENCE_TYPE_LABELS,
} from "../utils/transactionHelpers.js";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

/**
 * BankTransactionsPage
 * Can be used in two ways:
 * 1. As a standalone page at /bank-transactions — reads bankId from URL param
 * 2. Embedded inside CompanyBankViewPage — receives bankId and bankLabel as props
 *
 * Props:
 * - bankId (number)    : company_bank_id — this ledger is scoped to one bank account
 * - bankLabel (string) : e.g. "HDFC Bank •••• 6789"
 */
export default function BankTransactionsPage({
  bankId: bankIdProp,
  bankLabel,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Support standalone route /bank-transactions (no bankId prop)
  const { bankId: bankTransactionBankId } = useParams();
  const bankId = bankIdProp ?? bankTransactionBankId ?? null;

  const { bankTransactions, summary, loading, error } = useSelector(
    (state) => state.bankTransactions,
  );

  const [typeFilter, setTypeFilter] = useState("all");
  const [referenceFilter, setReferenceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [formModal, setFormModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [reverseTarget, setReverseTarget] = useState(null);
  const [reverseSubmitting, setReverseSubmitting] = useState(false);

  const queryParams = useMemo(
    () => ({
      ...(bankId && { company_bank_id: bankId }),
      ...(typeFilter !== "all" && { transaction_type: typeFilter }),
      ...(referenceFilter !== "all" && { reference_type: referenceFilter }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    }),
    [bankId, typeFilter, referenceFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    dispatch(fetchBankTransactions(queryParams));
    if (bankId) {
      dispatch(fetchBankTransactionSummary({ company_bank_id: bankId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(queryParams)]);

  // Client-side filter as a safety net
  const filteredTransactions = useMemo(() => {
    if (!bankId) return bankTransactions;
    return bankTransactions.filter(
      (t) => String(t.company_bank_id) === String(bankId),
    );
  }, [bankTransactions, bankId]);

  const {
    pagedData: pagedTransactions,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination({ data: filteredTransactions, initialSize: 15 });

  const handleOpenCreate = () => {
    dispatch(clearBankTransactionError());
    setFormModal(true);
  };
  const handleCloseForm = () => {
    setFormModal(false);
    dispatch(clearBankTransactionError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const action = await dispatch(addBankTransaction(formData));
      if (addBankTransaction.fulfilled.match(action)) {
        setFormModal(false);
        // Refresh summary after successful create
        if (bankId) {
          dispatch(fetchBankTransactionSummary({ company_bank_id: bankId }));
        }
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReverseConfirm = async () => {
    if (!reverseTarget) return;
    setReverseSubmitting(true);
    try {
      const action = await dispatch(
        reverseTransaction({
          id: reverseTarget.id,
          company_bank_id: reverseTarget.company_bank_id,
        }),
      );
      if (reverseTransaction.fulfilled.match(action)) {
        setReverseTarget(null);
        // Refresh summary after reversal
        if (bankId) {
          dispatch(fetchBankTransactionSummary({ company_bank_id: bankId }));
        }
      }
    } finally {
      setReverseSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Receipt size={20} className="text-primary" />
            Transactions
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            {bankLabel ||
              (bankId ? `Bank Account #${bankId}` : "All bank transactions")}
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
          disabled={!bankId}
          title={
            !bankId ? "Select a bank account to record transactions" : undefined
          }
        >
          <Plus size={16} />
          New transaction
        </button>
      </div>

      {!bankId && (
        <div className="alert alert-warning text-sm py-2 mb-4">
          <span>
            Please navigate to a specific bank account to view and record its
            transactions.
          </span>
        </div>
      )}

      {error && !formModal && !reverseTarget && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Summary cards */}
      {bankId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
              <ArrowDownLeft size={18} />
            </span>
            <div>
              <div className="text-xs text-base-content/50">Total credits</div>
              <div className="text-xl font-semibold leading-tight text-success">
                {formatCurrency(summary?.total_credit)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
              <ArrowUpRight size={18} />
            </span>
            <div>
              <div className="text-xs text-base-content/50">Total debits</div>
              <div className="text-xl font-semibold leading-tight text-error">
                {formatCurrency(summary?.total_debit)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <Wallet size={18} />
            </span>
            <div>
              <div className="text-xs text-base-content/50">
                Closing balance
              </div>
              <div className="text-xl font-semibold leading-tight">
                {formatCurrency(summary?.closing_balance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="join">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`join-item btn btn-sm ${
                typeFilter === f.value
                  ? "btn-primary"
                  : "btn-ghost bg-base-100 border-base-300"
              }`}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            className="select select-bordered select-sm rounded-lg bg-base-100"
          >
            <option value="all">All reference types</option>
            {Object.entries(REFERENCE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input input-bordered input-sm rounded-lg bg-base-100"
          />
          <span className="text-xs text-base-content/30">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input input-bordered input-sm rounded-lg bg-base-100"
          />
          {(dateFrom || dateTo) && (
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              title="Clear date filters"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <BankTransactionTable
          transactions={pagedTransactions}
          loading={loading}
          onView={(t) => navigate(`/bank-transactions/${t.id}`)}
          onReverse={setReverseTarget}
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

      {/* Create modal */}
      <BankTransactionFormModal
        open={formModal}
        bankId={bankId}
        bankLabel={bankLabel}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Reverse modal */}
      <ReverseTransactionModal
        open={Boolean(reverseTarget)}
        transaction={reverseTarget}
        loading={reverseSubmitting}
        error={reverseTarget ? error : null}
        onConfirm={handleReverseConfirm}
        onClose={() => {
          setReverseTarget(null);
          dispatch(clearBankTransactionError());
        }}
      />
    </div>
  );
}
