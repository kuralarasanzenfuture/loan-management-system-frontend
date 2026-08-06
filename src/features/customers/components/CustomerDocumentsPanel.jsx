import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  FileText,
  X,
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
 * - documents (array) : [{ document_type, file_name, verified, document_number }]
 * - onUpload (fn)      : (documentType, file) => Promise
 * - onRemove (fn)       : (documentType) => Promise
 * - uploading (object)  : { [documentType]: bool }
 */
export default function CustomerDocumentsPanel({
  documents = [],
  onUpload,
  onRemove,
  uploading = {},
}) {
  const fileInputRefs = useRef({});

  const docMap = Object.fromEntries(documents.map((d) => [d.document_type, d]));

  const handlePick = (docType) => {
    fileInputRefs.current[docType]?.click();
  };

  const handleFileChange = (docType) => (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload?.(docType, file);
    e.target.value = ""; // allow re-selecting the same file
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-base-200 bg-base-200/20">
        <h3 className="font-bold text-sm">KYC Documents</h3>
        <p className="text-[11px] text-base-content/40 mt-0.5">
          Upload required identity and income documents.
        </p>
      </div>

      <div className="divide-y divide-base-200">
        {DOCUMENT_TYPES.map(({ key, label }) => {
          const doc = docMap[key];
          const isUploading = uploading[key];

          return (
            <div key={key} className="flex items-center gap-4 px-5 py-3">
              <div className="w-40 shrink-0">
                <span className="text-xs font-semibold text-base-content">
                  {label}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {doc ? (
                  <div className="flex items-center gap-2 text-xs">
                    {doc.verified ? (
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
                    <span className="truncate text-base-content/70">
                      {doc.file_name}
                    </span>
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
                  <span className="text-xs text-base-content/30">
                    No file uploaded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  ref={(el) => (fileInputRefs.current[key] = el)}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange(key)}
                />
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
    </div>
  );
}
