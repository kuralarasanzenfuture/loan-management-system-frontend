import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Package,
  ImageOff,
  Tag,
  IndianRupee,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import {
  fetchAssetById,
  clearSelectedAsset,
} from "../../../redux/assets/assetSlice.js";
import {
  CONDITION_LABELS,
  CONDITION_STYLES,
  STATUS_STYLES,
  formatCurrency,
} from "../utils/assetHelpers.js";

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

export default function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { asset, loading } = useSelector((state) => state.assets);

  useEffect(() => {
    dispatch(fetchAssetById(id));
    return () => dispatch(clearSelectedAsset());
  }, [dispatch, id]);

  if (loading && !asset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading asset…</p>
      </div>
    );
  }

  if (!asset) return null;

  const depreciation =
    asset.purchase_price > 0
      ? Math.round(
          ((asset.purchase_price - (asset.current_value || 0)) /
            asset.purchase_price) *
            100,
        )
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
          <div className="w-14 h-14 rounded-2xl border border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden shrink-0">
            {asset.image ? (
              <img
                src={asset.image}
                alt={asset.asset_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff size={20} className="text-base-content/30" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{asset.asset_name}</h1>
            <p className="text-xs text-base-content/40 font-mono">
              {asset.asset_no}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[asset.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {asset.status?.charAt(0).toUpperCase() + asset.status?.slice(1)}
          </span>
        </div>

        <button
          onClick={() => navigate("/assets", { state: { editAsset: asset } })}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      {/* Value strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Current Value</div>
            <div className="text-lg font-semibold leading-tight">
              {formatCurrency(asset.current_value)}
            </div>
          </div>
        </div> */}
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Tag size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Purchase Price</div>
            <div className="text-lg font-semibold leading-tight">
              {formatCurrency(asset.purchase_price)}
            </div>
          </div>
        </div>
        {/* <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${depreciation > 0 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}
          >
            <BadgeCheck size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Depreciation</div>
            <div className="text-lg font-semibold leading-tight">
              {depreciation}%
            </div>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Details */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Package size={13} /> Product Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Brand" value={asset.brand} />
            <InfoRow label="Model" value={asset.model} />
            <InfoRow label="Serial Number" value={asset.serial_number} />
            <InfoRow
              label="Condition"
              value={
                <span
                  className={`badge badge-sm font-medium ${CONDITION_STYLES[asset.condition_status] || "badge-ghost"}`}
                >
                  {CONDITION_LABELS[asset.condition_status] ||
                    asset.condition_status}
                </span>
              }
            />
          </div>
          {asset.description && (
            <div className="mt-3 pt-3 border-t border-base-200">
              <p className="text-xs text-base-content/40 mb-1">Description</p>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {asset.description}
              </p>
            </div>
          )}
        </div>

        {/* Purchase Info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Tag size={13} /> Purchase Info
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Purchase Date"
              value={
                asset.purchase_date
                  ? new Date(asset.purchase_date).toLocaleDateString()
                  : null
              }
            />
            <InfoRow label="purchase Price" value={asset.purchase_price} />
            <InfoRow label="quantity" value={asset.quantity} />
            <InfoRow label="Vendor" value={asset.vendor_name} />
            <InfoRow label="Invoice Number" value={asset.invoice_number} />
          </div>
        </div>

        {/* Location & Remarks */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <MapPin size={13} /> Location
          </h3>
          <p className="text-sm text-base-content/70">
            {asset.location || (
              <span className="text-base-content/30">Not specified</span>
            )}
          </p>
        </div>

        {asset.remarks && (
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
              Remarks
            </h3>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {asset.remarks}
            </p>
          </div>
        )}

        {/* Record Info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2">
            Record Info
          </h3>
          <div className="grid grid-cols-2 divide-x divide-base-200">
            <div className="pr-4">
              <InfoRow
                label="Created"
                value={
                  asset.created_at
                    ? new Date(asset.created_at).toLocaleString()
                    : null
                }
              />
            </div>
            <div className="pl-4">
              <InfoRow
                label="Updated"
                value={
                  asset.updated_at
                    ? new Date(asset.updated_at).toLocaleString()
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
