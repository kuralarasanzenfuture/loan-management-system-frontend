import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import {
  fetchAssets,
  addAsset,
  editAsset,
  removeAsset,
  clearAssetError,
} from "../../../redux/assets/assetSlice.js";
import { fetchAssetCategories } from "../../../redux/assetCategories/assetCategorySlice.js";
import AssetTable from "../components/AssetTable.jsx";
import AssetFormModal from "../components/AssetFormModal.jsx";
import AssetDeleteModal from "../components/AssetDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import { formatCurrency } from "../utils/assetHelpers.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "sold", label: "Sold" },
  { value: "disposed", label: "Disposed" },
];

export default function AssetsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { assets, loading, error } = useSelector((state) => state.assets);
  const { assetCategories } = useSelector((state) => state.assetCategories);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchAssetCategories());
  }, [dispatch]);

  // Auto-open edit modal when arriving from AssetViewPage
  useEffect(() => {
    if (location.state?.editAsset) {
      dispatch(clearAssetError());
      setFormModal(location.state.editAsset);
      // Clear the state so a refresh doesn't re-open the modal
      window.history.replaceState({}, "");
    }
  }, [location.state, dispatch]);

  const categoryMap = useMemo(
    () =>
      Object.fromEntries(
        (assetCategories || []).map((c) => [c.id, c.category_name]),
      ),
    [assetCategories],
  );

  const filteredAssets = useMemo(() => {
    let result = assets;

    if (statusFilter !== "all")
      result = result.filter((a) => a.status === statusFilter);
    if (categoryFilter !== "all")
      result = result.filter((a) => String(a.category_id) === categoryFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.asset_name?.toLowerCase().includes(q) ||
          a.asset_no?.toLowerCase().includes(q) ||
          a.serial_number?.toLowerCase().includes(q) ||
          a.brand?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [assets, search, statusFilter, categoryFilter]);

  const {
    pagedData: pagedAssets,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredAssets, initialSize: 10 });

  const totalCurrentValue = useMemo(
    () => assets.reduce((sum, a) => sum + (Number(a.current_value) || 0), 0),
    [assets],
  );
  const damagedCount = useMemo(
    () => assets.filter((a) => a.condition_status === "damaged").length,
    [assets],
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };
  const handleStatusFilterChange = (v) => {
    setStatusFilter(v);
    resetPage();
  };
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    resetPage();
  };

  const handleOpenCreate = () => {
    dispatch(clearAssetError());
    setFormModal({});
  };
  const handleOpenEdit = (asset) => {
    dispatch(clearAssetError());
    setFormModal(asset);
  };
  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearAssetError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editAsset({ id: formModal.id, formData }))
        : await dispatch(addAsset(formData));

      const wasFulfilled = isEdit
        ? editAsset.fulfilled.match(action)
        : addAsset.fulfilled.match(action);
      if (wasFulfilled) setFormModal(null);
    } finally {
      dispatch(fetchAssets());
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeAsset(deleteTarget.id));
      if (removeAsset.fulfilled.match(action)) setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Business Assets
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Track office equipment, furniture, and other business-owned assets.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New asset
        </button>
      </div>

      {error && !formModal && (
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
            <Package size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total assets</div>
            <div className="text-2xl font-semibold leading-tight">
              {assets.length}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Total current value
            </div>
            <div className="text-xl font-semibold leading-tight">
              {formatCurrency(totalCurrentValue)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <AlertTriangle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Damaged</div>
            <div className="text-2xl font-semibold leading-tight text-error">
              {damagedCount}
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
            placeholder="Search asset, serial no., brand…"
            value={search}
            onChange={handleSearchChange}
          />
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className="select select-bordered select-sm rounded-lg bg-base-100"
          >
            <option value="all">All categories</option>
            {assetCategories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.category_name}
              </option>
            ))}
          </select>
          <div className="join">
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
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <AssetTable
          assets={pagedAssets}
          loading={loading}
          categoryMap={categoryMap}
          onView={(a) => navigate(`/assets/${a.id}`)}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
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
      <AssetFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        categories={assetCategories || []}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
      <AssetDeleteModal
        open={Boolean(deleteTarget)}
        asset={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
