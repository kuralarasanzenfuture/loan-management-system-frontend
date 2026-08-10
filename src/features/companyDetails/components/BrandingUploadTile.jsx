import React, { useRef } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";

/**
 * BrandingUploadTile
 * Props:
 * - label (string)
 * - hint (string)          : e.g. "PNG, 512x512px recommended"
 * - file (File|null)        : newly selected file
 * - existingUrl (string|null) : already-uploaded image URL (edit mode)
 * - onChange (fn)           : (file) => void
 * - onClear (fn)            : () => void
 * - shape ("square"|"wide") : preview aspect
 */
export default function BrandingUploadTile({
  label,
  hint,
  file,
  existingUrl,
  onChange,
  onClear,
  shape = "square",
}) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
    e.target.value = "";
  };

  return (
    <div className="form-control">
      <label className="label pb-1">
        <span className="label-text text-xs font-semibold">{label}</span>
      </label>

      <div
        className={`relative flex items-center justify-center rounded-xl border-2 border-dashed border-base-300 bg-base-200/30 overflow-hidden group ${
          shape === "wide" ? "h-24" : "h-24 w-24"
        }`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain p-2"
            />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-1 right-1 btn btn-error btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-base-content/30 hover:text-primary transition-colors w-full h-full justify-center"
          >
            <ImageIcon size={20} />
            <span className="text-[10px] font-medium">No image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn btn-ghost btn-xs rounded-lg gap-1.5 mt-1.5 self-start"
      >
        <UploadCloud size={12} />
        {previewUrl ? "Replace" : "Upload"}
      </button>
      {hint && (
        <p className="text-[10px] text-base-content/40 mt-0.5">{hint}</p>
      )}
    </div>
  );
}
