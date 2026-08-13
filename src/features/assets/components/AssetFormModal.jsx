import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Package, UploadCloud, ImageOff } from "lucide-react";

const CONDITION_OPTIONS = ["new", "good", "fair", "damaged"];
const STATUS_OPTIONS = ["active", "inactive", "sold", "disposed"];

const emptyForm = {
  category_id: "",
  asset_name: "",
  brand: "",
  model: "",
  serial_number: "",
  description: "",
  purchase_price: "",
  purchase_date: "",
  quantity: "",
  vendor_name: "",
  invoice_number: "",
  // current_value: "",
  location: "",
  condition_status: "new",
  status: "active",
  remarks: "",
};

/**
 * AssetFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null = create, {...asset} = edit
 * - categories (array)         : [{ id, category_name }]
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with a FormData instance
 */
export default function AssetFormModal({
  open,
  initialData,
  categories = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        category_id:
          initialData.category_id != null
            ? String(initialData.category_id)
            : "",
        asset_name: initialData.asset_name || "",
        brand: initialData.brand || "",
        model: initialData.model || "",
        serial_number: initialData.serial_number || "",
        description: initialData.description || "",
        purchase_price: initialData.purchase_price ?? "",
        purchase_date: initialData.purchase_date
          ? initialData.purchase_date.slice(0, 10)
          : "",
        quantity: initialData.quantity ?? "",
        vendor_name: initialData.vendor_name || "",
        invoice_number: initialData.invoice_number || "",
        // current_value: initialData.current_value ?? "",
        location: initialData.location || "",
        condition_status: initialData.condition_status || "new",
        status: initialData.status || "active",
        remarks: initialData.remarks || "",
      });
    } else {
      setForm(emptyForm);
    }
    setImageFile(null);
    setRemoveImage(false);
    setFieldErrors({});
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
    }
    e.target.value = "";
  };

  const handleImageClear = () => {
    setImageFile(null);
    setRemoveImage(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.category_id) errors.category_id = "Select a category";
    if (!form.asset_name.trim()) errors.asset_name = "Asset name is required";
    if (form.purchase_price === "" || Number(form.purchase_price) < 0)
      errors.purchase_price = "Enter a valid purchase price";
    if (form.current_value !== "" && Number(form.current_value) < 0)
      errors.current_value = "Current value cannot be negative";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    // asset_no is intentionally NOT sent — backend auto-generates it
    fd.append("category_id", form.category_id);
    fd.append("asset_name", form.asset_name.trim());
    fd.append("brand", form.brand.trim());
    fd.append("model", form.model.trim());
    fd.append("serial_number", form.serial_number.trim());
    fd.append("description", form.description.trim());
    fd.append("purchase_price", Number(form.purchase_price));
    fd.append("purchase_date", form.purchase_date || "");
    fd.append("quantity", Number(form.quantity));
    fd.append("vendor_name", form.vendor_name.trim());
    fd.append("invoice_number", form.invoice_number.trim());
    // fd.append(
    //   "current_value",
    //   form.current_value === "" ? 0 : Number(form.current_value),
    // );
    fd.append("location", form.location.trim());
    fd.append("condition_status", form.condition_status);
    fd.append("status", form.status);
    fd.append("remarks", form.remarks.trim());

    if (imageFile) fd.append("image", imageFile);
    if (removeImage) fd.append("remove_image", "true");

    onSubmit(fd);
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : !removeImage
      ? initialData?.image
      : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Package size={18} className="text-primary" />
              {isEdit ? "Edit Asset" : "New Asset"}
            </h3>
            {isEdit && (
              <p className="text-xs text-base-content/40 mt-0.5">
                {initialData.asset_no}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Image + Basic */}
          <section className="flex gap-4">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-base-300 bg-base-200/30 flex items-center justify-center overflow-hidden relative group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Asset"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleImageClear}
                      className="absolute top-1 right-1 btn btn-error btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center gap-1 text-base-content/30 hover:text-primary transition-colors w-full h-full justify-center"
                  >
                    <ImageOff size={20} />
                    <span className="text-[9px] font-medium">No image</span>
                  </button>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn btn-ghost btn-xs rounded-lg gap-1 mt-1.5 w-full"
              >
                <UploadCloud size={11} />
                {imagePreview ? "Replace" : "Upload"}
              </button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Asset Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.asset_name}
                  onChange={handleChange("asset_name")}
                  className={inputClass("asset_name")}
                  placeholder="Dell Laptop"
                />
                <FieldError field="asset_name" />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Category *
                  </span>
                </label>
                <select
                  value={form.category_id}
                  onChange={handleChange("category_id")}
                  className={`select select-bordered select-sm rounded-lg w-full ${fieldErrors.category_id ? "select-error" : ""}`}
                >
                  <option value="" disabled>
                    {categories.length === 0
                      ? "No categories available"
                      : "Select category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
                <FieldError field="category_id" />
              </div>
            </div>
          </section>

          {/* Product details */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Product Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Brand
                  </span>
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  className={inputClass("brand")}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Model
                  </span>
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={handleChange("model")}
                  className={inputClass("model")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Serial Number
                  </span>
                </label>
                <input
                  type="text"
                  value={form.serial_number}
                  onChange={handleChange("serial_number")}
                  className={inputClass("serial_number")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Description
                  </span>
                </label>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={2}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                />
              </div>
            </div>
          </section>

          {/* Purchase & Value */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Purchase & Value
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Quantity
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange("quantity")}
                  className={inputClass("quantity")}
                />
                <FieldError field="current_value" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Purchase Price (₹) *
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchase_price}
                  onChange={handleChange("purchase_price")}
                  className={inputClass("purchase_price")}
                />
                <FieldError field="purchase_price" />
              </div>
              {/* <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Current Value (₹)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.current_value}
                  onChange={handleChange("current_value")}
                  className={inputClass("current_value")}
                />
                <FieldError field="current_value" />
              </div> */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Purchase Date
                  </span>
                </label>
                <input
                  type="date"
                  value={form.purchase_date}
                  onChange={handleChange("purchase_date")}
                  className={inputClass("purchase_date")}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Vendor Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.vendor_name}
                  onChange={handleChange("vendor_name")}
                  className={inputClass("vendor_name")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Invoice Number
                  </span>
                </label>
                <input
                  type="text"
                  value={form.invoice_number}
                  onChange={handleChange("invoice_number")}
                  className={inputClass("invoice_number")}
                />
              </div>
            </div>
          </section>

          {/* Status & Location */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Status & Location
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Condition
                  </span>
                </label>
                <select
                  value={form.condition_status}
                  onChange={handleChange("condition_status")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Status
                  </span>
                </label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Location
                  </span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={handleChange("location")}
                  className={inputClass("location")}
                  placeholder="e.g. Head Office - IT Room"
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Remarks
                  </span>
                </label>
                <textarea
                  value={form.remarks}
                  onChange={handleChange("remarks")}
                  rows={2}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="modal-action mt-6 sticky bottom-0 bg-base-100 pt-3 -mb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
