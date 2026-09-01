import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Landmark, Star, CheckCircle2 } from "lucide-react";
import {
  fetchCompanyBanks,
  addCompanyBank,
  editCompanyBank,
  removeCompanyBank,
  makePrimaryCompanyBank,
  clearCompanyBankError,
} from "../../../redux/companyBanks/companyBankSlice.js";
import CompanyBankCard from "../components/CompanyBankCard.jsx";
import CompanyBankFormModal from "../components/CompanyBankFormModal.jsx";
import CompanyBankDeleteModal from "../components/CompanyBankDeleteModal.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

/**
 * CompanyBanksPage
 * Props:
 * - companyId (number) : the company these bank accounts belong to
 */
export default function CompanyBanksPage({ companyId }) {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const {
    companyBanks: banks,
    loading,
    error,
  } = useSelector((state) => state.companyBanks);

  const canView =
    can(PERMISSIONS.BANK_ACCOUNT_VIEW) || can(PERMISSIONS.COMPANY_VIEW);
  const canCreate =
    can(PERMISSIONS.BANK_ACCOUNT_CREATE) || can(PERMISSIONS.COMPANY_EDIT);
  const canEdit =
    can(PERMISSIONS.BANK_ACCOUNT_EDIT) || can(PERMISSIONS.COMPANY_EDIT);
  const canDelete =
    can(PERMISSIONS.BANK_ACCOUNT_DELETE) || can(PERMISSIONS.COMPANY_EDIT);

  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [primaryTargetId, setPrimaryTargetId] = useState(null);

  useEffect(() => {
    if (canView) {
      dispatch(fetchCompanyBanks());
    }
  }, [dispatch, canView]);

  // Filter to this company's banks (client-side unless the API supports ?company_id=)
  const companyBanksList = useMemo(
    () =>
      banks.filter(
        (b) => !companyId || String(b.company_id) === String(companyId),
      ),
    [banks, companyId],
  );

  const filteredBanks = useMemo(() => {
    if (!search.trim()) return companyBanksList;
    const q = search.toLowerCase();
    return companyBanksList.filter(
      (b) =>
        b.bank_name?.toLowerCase().includes(q) ||
        b.account_holder_name?.toLowerCase().includes(q) ||
        b.account_number?.includes(q) ||
        b.ifsc_code?.toLowerCase().includes(q),
    );
  }, [companyBanksList, search]);

  const primaryCount = companyBanksList.filter((b) => b.is_primary).length;
  const activeCount = companyBanksList.filter(
    (b) => b.status === "active",
  ).length;

  const handleOpenCreate = () => {
    if (!canCreate) return;
    dispatch(clearCompanyBankError());
    setFormModal({});
  };
  const handleOpenEdit = (bank) => {
    if (!canEdit) return;
    dispatch(clearCompanyBankError());
    setFormModal(bank);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearCompanyBankError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editCompanyBank({ id: formModal.id, formData }))
        : await dispatch(addCompanyBank(formData));

      const wasFulfilled = isEdit
        ? editCompanyBank.fulfilled.match(action)
        : addCompanyBank.fulfilled.match(action);

      if (wasFulfilled) setFormModal(null);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleMakePrimary = async (bank) => {
    if (!canEdit) return;
    setPrimaryTargetId(bank.id);
    try {
      await dispatch(makePrimaryCompanyBank(bank.id));
    } finally {
      setPrimaryTargetId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canDelete) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeCompanyBank(deleteTarget.id));
      if (removeCompanyBank.fulfilled.match(action)) setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!canView) return null;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Landmark size={20} className="text-primary" />
            Bank Accounts
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage collection, disbursement, and business bank accounts.
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary btn-sm gap-1.5"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            Add bank account
          </button>
        )}
      </div>

      {error && !formModal && !deleteTarget && (
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
            <Landmark size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total accounts</div>
            <div className="text-2xl font-semibold leading-tight">
              {companyBanksList.length}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Active</div>
            <div className="text-2xl font-semibold leading-tight text-success">
              {activeCount}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning shrink-0">
            <Star size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Primary set</div>
            <div className="text-2xl font-semibold leading-tight text-warning">
              {primaryCount > 0 ? "Yes" : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-xs bg-base-100 mb-4">
        <Search size={14} className="text-base-content/40 shrink-0" />
        <input
          type="text"
          className="grow"
          placeholder="Search bank, account no., IFSC…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {/* Card grid */}
      {loading && filteredBanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2 rounded-2xl border border-base-300 bg-base-100">
          <span className="loading loading-spinner loading-md" />
          <p className="text-sm">Loading bank accounts…</p>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-2xl border border-base-300 bg-base-100">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
            <Landmark size={20} />
          </span>
          <p className="text-sm font-medium text-base-content/70">
            No bank accounts found
          </p>
          <p className="text-xs text-base-content/40">
            Add your first bank account to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => (
            <CompanyBankCard
              key={bank.id}
              bank={bank}
              canView={canView}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
              onMakePrimary={handleMakePrimary}
              settingPrimary={primaryTargetId === bank.id}
            />
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <CompanyBankFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        companyId={companyId}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete modal */}
      <CompanyBankDeleteModal
        open={Boolean(deleteTarget)}
        bank={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
