import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Boxes, CheckCircle2, XCircle } from "lucide-react";
import {
  fetchAssetCategories,
  addAssetCategory,
  editAssetCategory,
  removeAssetCategory,
  clearAssetCategoryError,
} from "../../../redux/assetCategories/assetCategorySlice.js";
import AssetCategoryTable from "../components/AssetCategoryTable.jsx";
import AssetCategoryFormModal from "../components/AssetCategoryFormModal.jsx";
import AssetCategoryDeleteModal from "../components/AssetCategoryDeleteModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AssetCategoriesPage() {
  const dispatch = useDispatch();
  const { assetCategories, loading, error } = useSelector(
    (state) => state.assetCategories,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssetCategories());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    let result = assetCategories;

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.category_name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [assetCategories, search, statusFilter]);

  const {
    pagedData: pagedCategories,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredCategories, initialSize: 10 });

  const activeCount = useMemo(
    () => assetCategories.filter((c) => c.status === "active").length,
    [assetCategories],
  );
  const inactiveCount = assetCategories.length - activeCount;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPage();
  };

  const handleOpenCreate = () => {
    dispatch(clearAssetCategoryError());
    setFormModal({});
  };

  const handleOpenEdit = (category) => {
    dispatch(clearAssetCategoryError());
    setFormModal(category);
  };

  const handleCloseForm = () => {
    setFormModal(null);
    dispatch(clearAssetCategoryError());
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const isEdit = Boolean(formModal?.id);
      const action = isEdit
        ? await dispatch(editAssetCategory({ id: formModal.id, formData }))
        : await dispatch(addAssetCategory(formData));

      const wasFulfilled = isEdit
        ? editAssetCategory.fulfilled.match(action)
        : addAssetCategory.fulfilled.match(action);

      if (wasFulfilled) {
        dispatch(fetchAssetCategories());
        setFormModal(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const action = await dispatch(removeAssetCategory(deleteTarget.id));
      if (removeAssetCategory.fulfilled.match(action)) {
        setDeleteTarget(null);
      }
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
            <Boxes size={20} className="text-primary" />
            Asset Categories
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Manage categories used to classify collateral and pledged assets.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          New category
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
            <Boxes size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total categories</div>
            <div className="text-2xl font-semibold leading-tight">
              {assetCategories.length}
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
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <XCircle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Inactive</div>
            <div className="text-2xl font-semibold leading-tight text-error">
              {inactiveCount}
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
            placeholder="Search categories…"
            value={search}
            onChange={handleSearchChange}
          />
        </label>

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

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <AssetCategoryTable
          categories={pagedCategories}
          loading={loading}
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
      <AssetCategoryFormModal
        open={Boolean(formModal)}
        initialData={formModal?.id ? formModal : null}
        loading={formSubmitting}
        error={formModal ? error : null}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirm modal */}
      <AssetCategoryDeleteModal
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        loading={deleteSubmitting}
        error={deleteTarget ? error : null}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
