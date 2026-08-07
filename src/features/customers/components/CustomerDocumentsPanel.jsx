import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  FileText,
  X,
  Eye,
} from "lucide-react";

const DOCUMENT_TYPES = [
  { key: "photo", label: "Photo" },
  { key: "aadhaar", label: "Aadhaar" },
  { key: "pan", label: "PAN" },
  { key: "driving_license", label: "Driving License" },
  { key: "voter_id", label: "Voter ID" },
  { key: "passport", label: "Passport" },
  { key: "ration_card", label: "Ration Card" },
  { key: "bank_passbook", label: "Bank Passbook" },
  { key: "salary_slip", label: "Salary Slip" },
  { key: "electricity_bill", label: "Electricity Bill" },
  { key: "gas_bill", label: "Gas Bill" },
];

/**
 * CustomerDocumentsPanel
 * Props:
 * - documents (array) : [{ document_type, file_name, file_url, url, verified, document_number }]
 * - onUpload (fn)      : (documentType, file) => Promise
 * - onRemove (fn)      : (documentType) => Promise
 * - uploading (object)  : { [documentType]: bool }
 */
export default function CustomerDocumentsPanel({
  documents = [],
  photo = null,
  onUpload,
  onRemove,
  uploading = {},
}) {
  const fileInputRefs = useRef({});
  const [previewImage, setPreviewImage] = useState(null);

  const docMap = Object.fromEntries(documents.map((d) => [d.document_type, d]));

  if (photo && !docMap.photo) {
    docMap.photo = {
      document_type: "photo",
      file_name: photo,
      url: photo,
      verified: 1,
    };
  }

  const handlePick = (docType) => {
    fileInputRefs.current[docType]?.click();
  };

  const handleFileChange = (docType) => (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload?.(docType, file);
    e.target.value = ""; // allow re-selecting the same file
  };

  // Helper to check if the document is an image file
  const isImageFile = (fileName = "", url = "") => {
    const target = fileName || url || "";
    return /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(target) || target.startsWith("data:image/") || target.includes("/uploads/customers/");
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-base-200 bg-base-200/20">
        <h3 className="font-bold text-sm">KYC Documents</h3>
        <p className="text-[11px] text-base-content/40 mt-0.5">
          Upload required identity and income documents.
        </p>
      </div>

      {/* Document List */}
      <div className="divide-y divide-base-200">
        {DOCUMENT_TYPES.map(({ key, label }) => {
          const doc = docMap[key];
          const isUploading = uploading[key];
          const fileUrl =
            doc?.file_url ||
            doc?.url ||
            (typeof doc?.file_name === "string" && (doc.file_name.startsWith("http") || doc.file_name.startsWith("/"))
              ? doc.file_name
              : null);

          const isImage =
            doc &&
            (isImageFile(doc.file_name, fileUrl) ||
              doc.file_type?.startsWith("image/"));

          const cleanFileName =
            doc?.file_name && typeof doc.file_name === "string"
              ? doc.file_name.split("/").pop()
              : "Uploaded File";

          const handleViewDoc = () => {
            if (fileUrl) {
              setPreviewImage({
                src: fileUrl,
                title: `${label} - ${cleanFileName}`,
                isImage: isImage,
              });
            }
          };

          return (
            <div
              key={key}
              className="flex items-center gap-4 px-5 py-3 hover:bg-base-200/30 transition-colors"
            >
              {/* Document Label */}
              <div className="w-40 shrink-0">
                <span className="text-xs font-semibold text-base-content">
                  {label}
                </span>
              </div>

              {/* Document Details & Thumbnail */}
              <div className="flex-1 min-w-0">
                {doc ? (
                  <div className="flex items-center gap-2 text-xs">
                    {/* Thumbnail or Status Icon */}
                    {isImage && fileUrl ? (
                      <div
                        onClick={handleViewDoc}
                        className="w-7 h-7 rounded object-cover cursor-pointer hover:opacity-80 border border-base-300 overflow-hidden shrink-0"
                        title="Click to view image"
                      >
                        <img
                          src={fileUrl}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : doc.verified ? (
                      <CheckCircle2
                        size={14}
                        className="text-success shrink-0"
                      />
                    ) : (
                      <AlertTriangle
                        size={14}
                        className="text-warning shrink-0"
                      />
                    )}

                    {/* File Name & Document Number */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        onClick={fileUrl ? handleViewDoc : undefined}
                        className={`truncate text-base-content/70 ${
                          fileUrl
                            ? "cursor-pointer hover:underline hover:text-primary font-medium"
                            : ""
                        }`}
                        title={cleanFileName}
                      >
                        {cleanFileName}
                      </span>
                      {doc.document_number && (
                        <span className="text-[11px] text-base-content/40 bg-base-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                          #{doc.document_number}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`badge badge-xs font-medium shrink-0 ${
                        doc.verified
                          ? "badge-success badge-outline"
                          : "badge-warning badge-outline"
                      }`}
                    >
                      {doc.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-base-content/30 italic">
                    No file uploaded
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  ref={(el) => (fileInputRefs.current[key] = el)}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange(key)}
                />

                {/* VIEW BUTTON */}
                {doc && fileUrl && (
                  <button
                    type="button"
                    onClick={handleViewDoc}
                    className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10"
                    title="View file"
                  >
                    <Eye size={15} />
                  </button>
                )}

                {/* UPLOAD / REPLACE BUTTON */}
                <button
                  type="button"
                  onClick={() => handlePick(key)}
                  disabled={isUploading}
                  className="btn btn-ghost btn-xs btn-square"
                  title={doc ? "Replace file" : "Upload file"}
                >
                  {isUploading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <UploadCloud size={15} className="text-base-content/50" />
                  )}
                </button>

                {/* REMOVE BUTTON */}
                {doc && (
                  <button
                    type="button"
                    onClick={() => onRemove?.(key)}
                    className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                    title="Remove file"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* High-Quality Image / File Preview Modal */}
      {previewImage && (
        <dialog className="modal modal-open bg-black/80 backdrop-blur-sm z-50">
          <div className="relative max-w-4xl w-full bg-base-100 rounded-2xl shadow-2xl overflow-hidden p-4 flex flex-col items-center">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-base-200 mb-3">
              <h3 className="text-sm font-bold text-base-content truncate pr-4">
                {previewImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="btn btn-sm btn-circle btn-ghost"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* High Quality Content Display */}
            <div className="w-full max-h-[75vh] flex justify-center items-center bg-base-200/50 rounded-xl overflow-auto p-2 min-h-[300px]">
              {previewImage.isImage ? (
                <img
                  src={previewImage.src}
                  alt={previewImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <FileText size={48} className="text-base-content/40" />
                  <p className="text-xs text-base-content/60">
                    PDF / Non-image Document
                  </p>
                  <a
                    href={previewImage.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm rounded-lg"
                  >
                    Open Document in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="w-full flex justify-end pt-3 mt-1">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="btn btn-sm btn-ghost"
              >
                Close
              </button>
            </div>
          </div>

          {/* Backdrop click to close */}
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setPreviewImage(null)}
          >
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
