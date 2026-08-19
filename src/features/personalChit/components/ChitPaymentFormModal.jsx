// import React, { useState, useEffect } from "react";
// import { X, Loader2, Receipt } from "lucide-react";
// import { formatCurrency } from "../utils/chitHelpers.js";

// const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];
// const STATUS_OPTIONS = ["pending", "partial", "paid", "overdue"];

// /**
//  * ChitPaymentFormModal
//  * Handles create (installment_no is next auto-suggested) and edit
//  * (record an actual payment against an existing due installment).
//  *
//  * Props:
//  * - open (bool)
//  * - initialData (object|null) : null = create new installment,
//  *     {...payment} = edit/record payment against it
//  * - suggestedInstallmentNo (number) : for create mode
//  * - loading (bool)
//  * - error (string|object|null)
//  * - onClose (fn)
//  * - onSubmit (fn)
//  */
// export default function ChitPaymentFormModal({
//   open,
//   initialData,
//   suggestedInstallmentNo,
//   loading,
//   error,
//   onClose,
//   onSubmit,
// }) {
//   const isEdit = Boolean(initialData?.id);
//   const [form, setForm] = useState({
//     installment_no: suggestedInstallmentNo || 1,
//     due_date: "",
//     payment_date: "",
//     due_amount: "",
//     paid_amount: "",
//     payment_mode: "cash",
//     transaction_reference: "",
//     status: "pending",
//     remarks: "",
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (!open) return;
//     if (isEdit) {
//       setForm({
//         installment_no: initialData.installment_no,
//         due_date: initialData.due_date ? initialData.due_date.slice(0, 10) : "",
//         payment_date: initialData.payment_date
//           ? initialData.payment_date.slice(0, 10)
//           : new Date().toISOString().slice(0, 10),
//         due_amount: initialData.due_amount ?? "",
//         paid_amount: initialData.paid_amount || initialData.due_amount || "",
//         payment_mode: initialData.payment_mode || "cash",
//         transaction_reference: initialData.transaction_reference || "",
//         status: initialData.status === "pending" ? "paid" : initialData.status,
//         remarks: initialData.remarks || "",
//       });
//     } else {
//       setForm({
//         installment_no: suggestedInstallmentNo || 1,
//         due_date: "",
//         payment_date: "",
//         due_amount: "",
//         paid_amount: "",
//         payment_mode: "cash",
//         transaction_reference: "",
//         status: "pending",
//         remarks: "",
//       });
//     }
//     setFieldErrors({});
//   }, [open, initialData, isEdit, suggestedInstallmentNo]);

//   if (!open) return null;

//   const handleChange = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//     setFieldErrors((prev) => ({ ...prev, [field]: null }));
//   };

//   const validate = () => {
//     const errors = {};
//     if (!form.due_date) errors.due_date = "Select a due date";
//     if (!form.due_amount || Number(form.due_amount) <= 0)
//       errors.due_amount = "Enter a valid due amount";
//     if (form.paid_amount !== "" && Number(form.paid_amount) < 0)
//       errors.paid_amount = "Paid amount cannot be negative";
//     if (
//       form.paid_amount !== "" &&
//       Number(form.paid_amount) > Number(form.due_amount)
//     )
//       errors.paid_amount = "Paid amount cannot exceed due amount";
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const paidAmt = form.paid_amount === "" ? 0 : Number(form.paid_amount);
//     const dueAmt = Number(form.due_amount);

//     onSubmit({
//       installment_no: Number(form.installment_no),
//       due_date: form.due_date,
//       payment_date: form.payment_date || null,
//       due_amount: dueAmt,
//       paid_amount: paidAmt,
//       pending_amount: Math.max(dueAmt - paidAmt, 0),
//       payment_mode: form.payment_mode,
//       transaction_reference: form.transaction_reference.trim() || null,
//       status: form.status,
//       remarks: form.remarks.trim() || null,
//     });
//   };

//   const inputClass = (field) =>
//     `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
//   const FieldError = ({ field }) =>
//     fieldErrors[field] ? (
//       <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
//     ) : null;

//   return (
//     <div className="modal modal-open">
//       <div className="modal-box max-w-md rounded-2xl">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold text-lg flex items-center gap-2">
//             <Receipt size={18} className="text-primary" />
//             {isEdit
//               ? `Record Payment #${form.installment_no}`
//               : "New Installment"}
//           </h3>
//           <button
//             type="button"
//             onClick={onClose}
//             className="btn btn-ghost btn-sm btn-square"
//             aria-label="Close"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {error && (
//           <div className="alert alert-error text-sm py-2 mb-4">
//             <span>
//               {typeof error === "string" ? error : "Something went wrong."}
//             </span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isEdit && (
//             <div className="form-control">
//               <label className="label pb-1">
//                 <span className="label-text text-xs font-semibold">
//                   Installment No. *
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 value={form.installment_no}
//                 onChange={handleChange("installment_no")}
//                 className={inputClass("installment_no")}
//               />
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3">
//             <div className="form-control">
//               <label className="label pb-1">
//                 <span className="label-text text-xs font-semibold">
//                   Due Date *
//                 </span>
//               </label>
//               <input
//                 type="date"
//                 value={form.due_date}
//                 onChange={handleChange("due_date")}
//                 className={inputClass("due_date")}
//               />
//               <FieldError field="due_date" />
//             </div>
//             <div className="form-control">
//               <label className="label pb-1">
//                 <span className="label-text text-xs font-semibold">
//                   Due Amount (₹) *
//                 </span>
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={form.due_amount}
//                 onChange={handleChange("due_amount")}
//                 className={inputClass("due_amount")}
//               />
//               <FieldError field="due_amount" />
//             </div>
//           </div>

//           {isEdit && (
//             <>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="form-control">
//                   <label className="label pb-1">
//                     <span className="label-text text-xs font-semibold">
//                       Paid Amount (₹)
//                     </span>
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={form.paid_amount}
//                     onChange={handleChange("paid_amount")}
//                     className={inputClass("paid_amount")}
//                   />
//                   <FieldError field="paid_amount" />
//                 </div>
//                 <div className="form-control">
//                   <label className="label pb-1">
//                     <span className="label-text text-xs font-semibold">
//                       Payment Date
//                     </span>
//                   </label>
//                   <input
//                     type="date"
//                     value={form.payment_date}
//                     onChange={handleChange("payment_date")}
//                     className={inputClass("payment_date")}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="form-control">
//                   <label className="label pb-1">
//                     <span className="label-text text-xs font-semibold">
//                       Payment Mode
//                     </span>
//                   </label>
//                   <select
//                     value={form.payment_mode}
//                     onChange={handleChange("payment_mode")}
//                     className="select select-bordered select-sm rounded-lg w-full capitalize"
//                   >
//                     {PAYMENT_MODES.map((p) => (
//                       <option key={p} value={p} className="capitalize">
//                         {p.charAt(0).toUpperCase() + p.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-control">
//                   <label className="label pb-1">
//                     <span className="label-text text-xs font-semibold">
//                       Status
//                     </span>
//                   </label>
//                   <select
//                     value={form.status}
//                     onChange={handleChange("status")}
//                     className="select select-bordered select-sm rounded-lg w-full capitalize"
//                   >
//                     {STATUS_OPTIONS.map((s) => (
//                       <option key={s} value={s} className="capitalize">
//                         {s.charAt(0).toUpperCase() + s.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">
//                     Transaction Reference
//                   </span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.transaction_reference}
//                   onChange={handleChange("transaction_reference")}
//                   className={inputClass("transaction_reference")}
//                 />
//               </div>
//             </>
//           )}

//           <div className="form-control">
//             <label className="label pb-1">
//               <span className="label-text text-xs font-semibold">Remarks</span>
//             </label>
//             <textarea
//               value={form.remarks}
//               onChange={handleChange("remarks")}
//               rows={2}
//               className="textarea textarea-bordered textarea-sm rounded-lg w-full"
//             />
//           </div>

//           <div className="modal-action mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="btn btn-ghost btn-sm rounded-lg"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn btn-primary btn-sm rounded-lg gap-1.5"
//             >
//               {loading && <Loader2 size={14} className="animate-spin" />}
//               {isEdit ? "Save Payment" : "Add Installment"}
//             </button>
//           </div>
//         </form>
//       </div>
//       <div className="modal-backdrop bg-black/40" onClick={onClose} />
//     </div>
//   );
// }

/*====================================================*/

// import React, { useState, useMemo, useEffect } from "react";
// import { X, Loader2, Wallet2, ListChecks, Sparkles, RotateCcw } from "lucide-react";

// /**
//  * ChitPaymentFormModal
//  * Two modes:
//  * - "single": your original one-installment form (used for create AND edit).
//  * - "bulk":   auto-generates N installments from the chit's total amount /
//  *             member count / frequency, each row still individually
//  *             editable before submit. Only available when creating fresh
//  *             (not when editing one existing payment).
//  *
//  * Props:
//  * - open (bool)
//  * - initialData (object|null) : existing payment to edit, or null to create
//  * - chit (object)              : the parent personal_chits row — needed for
//  *                                 chit_amount, total_members, payment_frequency,
//  *                                 payment_interval, start_date, payment_schedule_type
//  * - existingPayments (array)   : already-recorded installments, used to work
//  *                                 out the next due date / remaining amount
//  * - suggestedInstallmentNo (number)
//  * - loading (bool)
//  * - error (string|null)
//  * - onClose (fn)
//  * - onSubmitSingle (fn)        : called with one payload object
//  * - onSubmitBulk (fn)          : called with an array of payload objects
//  */

// const FREQUENCY_LABELS = {
//   weekly: "Weekly",
//   monthly: "Monthly",
//   quarterly: "Quarterly",
//   custom: "Custom (days)",
// };

// // Advances a date by one payment cycle. Monthly/quarterly use setMonth
// // (so "5th of every month" stays the 5th, rather than drifting the way a
// // flat +30-days approach would); weekly/custom step in days.
// function addInterval(dateStr, frequency, interval) {
//   const d = new Date(dateStr);
//   const n = Number(interval) || 1;
//   switch (frequency) {
//     case "weekly":
//       d.setDate(d.getDate() + 7 * n);
//       break;
//     case "monthly":
//       d.setMonth(d.getMonth() + n);
//       break;
//     case "quarterly":
//       d.setMonth(d.getMonth() + 3 * n);
//       break;
//     case "custom":
//     default:
//       d.setDate(d.getDate() + n); // custom = interval in days
//       break;
//   }
//   return d.toISOString().slice(0, 10);
// }

// // Splits totalAmount across `count` rows as evenly as possible. Uses floor
// // division and pushes the leftover onto the LAST row, so the rows always
// // sum to exactly totalAmount instead of drifting from rounding.
// function generateRows({ count, startDate, frequency, interval, totalAmount, startInstallmentNo }) {
//   const n = Math.max(1, Number(count) || 1);
//   const total = Number(totalAmount) || 0;
//   const base = Math.floor(total / n);
//   const remainder = total - base * n;

//   const rows = [];
//   for (let i = 0; i < n; i++) {
//     const dueDate = i === 0 ? startDate : addInterval(rows[i - 1].due_date, frequency, interval);
//     const val = base + (i === n - 1 ? remainder : 0);
//     rows.push({
//       installment_no: startInstallmentNo + i,
//       due_date: dueDate,
//       due_amount: val,
//       amount: val,
//     });
//   }
//   return rows;
// }

// export default function ChitPaymentFormModal({
//   open,
//   initialData = null,
//   chit,
//   existingPayments = [],
//   suggestedInstallmentNo = 1,
//   loading = false,
//   error = null,
//   onClose,
//   onSubmitSingle,
//   onSubmitBulk,
// }) {
//   const isEdit = Boolean(initialData?.id);

//   // Default the starting tab to match how this chit is actually scheduled,
//   // so the modal opens on the mode that's most likely what the user wants.
//   const [mode, setMode] = useState(
//     chit?.payment_schedule_type === "auto" ? "bulk" : "single",
//   );

//   // ---- Single-installment form state ----
//   const [singleForm, setSingleForm] = useState({
//     installment_no: suggestedInstallmentNo,
//     due_date: new Date().toISOString().slice(0, 10),
//     amount: "",
//     due_amount: "",
//     paid_amount: "",
//     payment_date: "",
//     payment_mode: "",
//     transaction_reference: "",
//     status: "pending",
//     notes: "",
//     remarks: "",
//   });
//   const [singleErrors, setSingleErrors] = useState({});

//   // ---- Bulk form state ----
//   const remainingAmount = useMemo(() => {
//     const scheduled = existingPayments.reduce(
//       (sum, p) => sum + (Number(p.due_amount ?? p.amount) || 0),
//       0,
//     );
//     return Math.max(0, Number(chit?.chit_amount || 0) - scheduled);
//   }, [chit, existingPayments]);

//   const defaultStartDate = useMemo(() => {
//     if (existingPayments.length === 0) return chit?.start_date?.slice(0, 10) || new Date().toISOString().slice(0, 10);
//     const last = [...existingPayments].sort((a, b) => (b.installment_no || 0) - (a.installment_no || 0))[0];
//     return addInterval(
//       last.due_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
//       chit?.payment_frequency || "monthly",
//       chit?.payment_interval || 1,
//     );
//   }, [chit, existingPayments]);

//   const [bulkConfig, setBulkConfig] = useState({
//     count: chit?.total_members || 1,
//     totalAmount: remainingAmount,
//     startDate: defaultStartDate,
//     frequency: chit?.payment_frequency || "monthly",
//     interval: chit?.payment_interval || 1,
//   });
//   const [bulkRows, setBulkRows] = useState([]);
//   const [bulkErrors, setBulkErrors] = useState({});

//   useEffect(() => {
//     if (!open) return;
//     setMode(chit?.payment_schedule_type === "auto" ? "bulk" : "single");
//     const initAmount = initialData?.due_amount ?? initialData?.amount ?? "";
//     const initRemarks = initialData?.remarks ?? initialData?.notes ?? "";
//     setSingleForm({
//       installment_no: initialData?.installment_no ?? suggestedInstallmentNo,
//       due_date: initialData?.due_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
//       amount: initAmount,
//       due_amount: initAmount,
//       paid_amount: initialData?.paid_amount !== undefined && initialData?.paid_amount !== null ? initialData.paid_amount : "",
//       payment_date: initialData?.payment_date ? initialData.payment_date.slice(0, 10) : "",
//       payment_mode: initialData?.payment_mode || "",
//       transaction_reference: initialData?.transaction_reference || "",
//       status: initialData?.status || "pending",
//       notes: initRemarks,
//       remarks: initRemarks,
//     });
//     setSingleErrors({});

//     const cfg = {
//       count: chit?.total_members || 1,
//       totalAmount: remainingAmount,
//       startDate: defaultStartDate,
//       frequency: chit?.payment_frequency || "monthly",
//       interval: chit?.payment_interval || 1,
//     };
//     setBulkConfig(cfg);
//     setBulkRows(
//       generateRows({ ...cfg, startInstallmentNo: suggestedInstallmentNo }),
//     );
//     setBulkErrors({});
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, initialData]);

//   if (!open) return null;

//   const regenerateRows = (overrides = {}) => {
//     const cfg = { ...bulkConfig, ...overrides };
//     setBulkConfig(cfg);
//     setBulkRows(generateRows({ ...cfg, startInstallmentNo: suggestedInstallmentNo }));
//   };

//   const updateRow = (index, field, value) => {
//     setBulkRows((rows) =>
//       rows.map((row, i) =>
//         i === index
//           ? {
//               ...row,
//               [field]: value,
//               ...(field === "amount" ? { due_amount: value } : {}),
//               ...(field === "due_amount" ? { amount: value } : {}),
//             }
//           : row,
//       ),
//     );
//   };

//   const bulkTotal = bulkRows.reduce((sum, r) => sum + (Number(r.due_amount ?? r.amount) || 0), 0);
//   const bulkTotalMismatch = Math.abs(bulkTotal - Number(bulkConfig.totalAmount || 0)) > 0.01;

//   // ---- Submit handlers ----
//   const handleSingleSubmit = (e) => {
//     e.preventDefault();
//     const errs = {};
//     if (!singleForm.due_date) errs.due_date = "Select a due date.";
//     const amt = Number(singleForm.due_amount ?? singleForm.amount);
//     if (!amt || amt <= 0) errs.amount = "Enter a valid due amount.";

//     const paidAmt = singleForm.paid_amount !== "" ? Number(singleForm.paid_amount) : null;
//     if (paidAmt !== null) {
//       if (paidAmt < 0) errs.paid_amount = "Paid amount cannot be negative.";
//       if (paidAmt > amt) errs.paid_amount = "Paid amount cannot exceed due amount.";
//     }

//     setSingleErrors(errs);
//     if (Object.keys(errs).length) return;

//     const payload = {
//       installment_no: Number(singleForm.installment_no),
//       due_date: singleForm.due_date,
//       due_amount: amt,
//       remarks: (singleForm.remarks || singleForm.notes || "").trim() || null,
//     };

//     if (isEdit) {
//       if (paidAmt !== null) {
//         payload.paid_amount = paidAmt;
//       }
//       if (singleForm.payment_date) {
//         payload.payment_date = singleForm.payment_date;
//       }
//       if (singleForm.payment_mode) {
//         payload.payment_mode = singleForm.payment_mode;
//       }
//       if (singleForm.transaction_reference) {
//         payload.transaction_reference = singleForm.transaction_reference.trim() || null;
//       }
//       if (singleForm.status) {
//         payload.status = singleForm.status;
//       }
//     }

//     onSubmitSingle(payload);
//   };

//   const handleBulkSubmit = (e) => {
//     e.preventDefault();
//     const errs = {};
//     if (!bulkConfig.count || Number(bulkConfig.count) < 1) errs.count = "Enter at least 1 installment.";
//     if (!bulkConfig.totalAmount || Number(bulkConfig.totalAmount) <= 0)
//       errs.totalAmount = "Enter a valid total amount.";
//     if (!bulkConfig.startDate) errs.startDate = "Select a start date.";
//     if (
//       bulkRows.some(
//         (r) =>
//           !r.due_date ||
//           (r.due_amount === undefined && r.amount === undefined) ||
//           Number(r.due_amount ?? r.amount) <= 0,
//       )
//     )
//       errs.rows = "Every row needs a date and an amount greater than zero.";
//     setBulkErrors(errs);
//     if (Object.keys(errs).length) return;

//     onSubmitBulk(
//       bulkRows.map((r) => ({
//         installment_no: Number(r.installment_no),
//         due_date: r.due_date,
//         due_amount: Number(r.due_amount ?? r.amount),
//       })),
//     );
//   };

//   return (
//     <div className="modal modal-open">
//       <div className="modal-box max-w-2xl rounded-2xl">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-bold text-lg flex items-center gap-2">
//             <Wallet2 size={18} className="text-primary" />
//             {isEdit ? "Edit Installment" : "Add Installments"}
//           </h3>
//           <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-square" aria-label="Close">
//             <X size={18} />
//           </button>
//         </div>

//         {/* Tabs — bulk only makes sense when creating fresh, not editing one row */}
//         {!isEdit && (
//           <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit mb-5">
//             <button
//               type="button"
//               role="tab"
//               className={`tab gap-1.5 ${mode === "single" ? "tab-active" : ""}`}
//               onClick={() => setMode("single")}
//             >
//               <Wallet2 size={13} />
//               Single
//             </button>
//             <button
//               type="button"
//               role="tab"
//               className={`tab gap-1.5 ${mode === "bulk" ? "tab-active" : ""}`}
//               onClick={() => setMode("bulk")}
//             >
//               <Sparkles size={13} />
//               Auto-generate
//             </button>
//           </div>
//         )}

//         {error && (
//           <div className="alert alert-error text-sm py-2 mb-4">
//             <span>{typeof error === "string" ? error : "Something went wrong."}</span>
//           </div>
//         )}

//         {/* ============ SINGLE ============ */}
//         {mode === "single" && (
//           <form onSubmit={handleSingleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Installment #</span>
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={singleForm.installment_no}
//                   onChange={(e) => setSingleForm((f) => ({ ...f, installment_no: e.target.value }))}
//                   className="input input-bordered input-sm rounded-lg w-full"
//                 />
//               </div>
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Due Date *</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={singleForm.due_date}
//                   onChange={(e) => setSingleForm((f) => ({ ...f, due_date: e.target.value }))}
//                   className={`input input-bordered input-sm rounded-lg w-full ${singleErrors.due_date ? "input-error" : ""}`}
//                 />
//                 {singleErrors.due_date && (
//                   <span className="text-[11px] text-error mt-1">{singleErrors.due_date}</span>
//                 )}
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label pb-1">
//                 <span className="label-text text-xs font-semibold">Amount (₹) *</span>
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={singleForm.amount}
//                 onChange={(e) => setSingleForm((f) => ({ ...f, amount: e.target.value }))}
//                 className={`input input-bordered input-sm rounded-lg w-full ${singleErrors.amount ? "input-error" : ""}`}
//                 placeholder="e.g. 50000"
//               />
//               {singleErrors.amount && (
//                 <span className="text-[11px] text-error mt-1">{singleErrors.amount}</span>
//               )}
//             </div>

//             <div className="form-control">
//               <label className="label pb-1">
//                 <span className="label-text text-xs font-semibold">Notes / Remarks</span>
//               </label>
//               <textarea
//                 rows={2}
//                 value={singleForm.notes}
//                 onChange={(e) => setSingleForm((f) => ({ ...f, notes: e.target.value, remarks: e.target.value }))}
//                 className="textarea textarea-bordered textarea-sm rounded-lg w-full"
//                 placeholder="Optional remarks"
//               />
//             </div>

//             {isEdit && (
//               <div className="pt-2 border-t border-base-200 space-y-3">
//                 <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
//                   Payment Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="form-control">
//                     <label className="label pb-1">
//                       <span className="label-text text-xs font-semibold">Paid Amount (₹)</span>
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={singleForm.paid_amount}
//                       onChange={(e) => setSingleForm((f) => ({ ...f, paid_amount: e.target.value }))}
//                       className={`input input-bordered input-sm rounded-lg w-full ${singleErrors.paid_amount ? "input-error" : ""}`}
//                       placeholder="0.00"
//                     />
//                     {singleErrors.paid_amount && (
//                       <span className="text-[11px] text-error mt-1">{singleErrors.paid_amount}</span>
//                     )}
//                   </div>
//                   <div className="form-control">
//                     <label className="label pb-1">
//                       <span className="label-text text-xs font-semibold">Payment Date</span>
//                     </label>
//                     <input
//                       type="date"
//                       value={singleForm.payment_date}
//                       onChange={(e) => setSingleForm((f) => ({ ...f, payment_date: e.target.value }))}
//                       className="input input-bordered input-sm rounded-lg w-full"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="form-control">
//                     <label className="label pb-1">
//                       <span className="label-text text-xs font-semibold">Payment Mode</span>
//                     </label>
//                     <select
//                       value={singleForm.payment_mode}
//                       onChange={(e) => setSingleForm((f) => ({ ...f, payment_mode: e.target.value }))}
//                       className="select select-bordered select-sm rounded-lg w-full capitalize"
//                     >
//                       <option value="">Select mode</option>
//                       <option value="cash">Cash</option>
//                       <option value="bank">Bank</option>
//                       <option value="upi">UPI</option>
//                       <option value="cheque">Cheque</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
//                   <div className="form-control">
//                     <label className="label pb-1">
//                       <span className="label-text text-xs font-semibold">Transaction Reference</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={singleForm.transaction_reference}
//                       onChange={(e) => setSingleForm((f) => ({ ...f, transaction_reference: e.target.value }))}
//                       className="input input-bordered input-sm rounded-lg w-full"
//                       placeholder="e.g. UPI / Cheque #"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="modal-action mt-6">
//               <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-lg">
//                 Cancel
//               </button>
//               <button type="submit" disabled={loading} className="btn btn-primary btn-sm rounded-lg gap-1.5">
//                 {loading && <Loader2 size={14} className="animate-spin" />}
//                 {isEdit ? "Save changes" : "Add installment"}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* ============ BULK / AUTO-GENERATE ============ */}
//         {mode === "bulk" && !isEdit && (
//           <form onSubmit={handleBulkSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Number of installments</span>
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="60"
//                   value={bulkConfig.count}
//                   onChange={(e) => regenerateRows({ count: e.target.value })}
//                   className={`input input-bordered input-sm rounded-lg w-full ${bulkErrors.count ? "input-error" : ""}`}
//                 />
//                 <span className="text-[11px] text-base-content/40 mt-1">
//                   Defaults to total members ({chit?.total_members || 0}).
//                 </span>
//               </div>
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Total amount to schedule (₹)</span>
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={bulkConfig.totalAmount}
//                   onChange={(e) => regenerateRows({ totalAmount: e.target.value })}
//                   className={`input input-bordered input-sm rounded-lg w-full ${bulkErrors.totalAmount ? "input-error" : ""}`}
//                 />
//                 <span className="text-[11px] text-base-content/40 mt-1">
//                   Remaining balance on this chit: ₹{remainingAmount.toLocaleString("en-IN")}
//                 </span>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Start date</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={bulkConfig.startDate}
//                   onChange={(e) => regenerateRows({ startDate: e.target.value })}
//                   className="input input-bordered input-sm rounded-lg w-full"
//                 />
//               </div>
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">Frequency</span>
//                 </label>
//                 <select
//                   value={bulkConfig.frequency}
//                   onChange={(e) => regenerateRows({ frequency: e.target.value })}
//                   className="select select-bordered select-sm rounded-lg w-full"
//                 >
//                   {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
//                     <option key={value} value={value}>{label}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-control">
//                 <label className="label pb-1">
//                   <span className="label-text text-xs font-semibold">
//                     {bulkConfig.frequency === "custom" ? "Every (days)" : "Every (cycles)"}
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={bulkConfig.interval}
//                   onChange={(e) => regenerateRows({ interval: e.target.value })}
//                   className="input input-bordered input-sm rounded-lg w-full"
//                 />
//               </div>
//             </div>

//             {/* Preview / editable rows */}
//             <div className="rounded-xl border border-base-300 overflow-hidden">
//               <div className="flex items-center justify-between px-3 py-2 bg-base-200/50 border-b border-base-300">
//                 <span className="text-xs font-semibold flex items-center gap-1.5 text-base-content/60">
//                   <ListChecks size={13} />
//                   {bulkRows.length} installments generated
//                 </span>
//                 <button
//                   type="button"
//                   onClick={() => regenerateRows()}
//                   className="btn btn-ghost btn-xs gap-1"
//                   title="Discard manual row edits and recompute from the fields above"
//                 >
//                   <RotateCcw size={11} />
//                   Reset rows
//                 </button>
//               </div>
//               <div className="max-h-56 overflow-y-auto divide-y divide-base-200">
//                 {bulkRows.map((row, i) => (
//                   <div key={i} className="flex items-center gap-2 px-3 py-1.5">
//                     <span className="text-xs text-base-content/40 w-8 shrink-0">#{row.installment_no}</span>
//                     <input
//                       type="date"
//                       value={row.due_date}
//                       onChange={(e) => updateRow(i, "due_date", e.target.value)}
//                       className="input input-bordered input-xs rounded-md flex-1"
//                     />
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={row.amount}
//                       onChange={(e) => updateRow(i, "amount", e.target.value)}
//                       className="input input-bordered input-xs rounded-md w-28"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {bulkTotalMismatch && (
//               <p className="text-[11px] text-warning">
//                 Rows currently total ₹{bulkTotal.toLocaleString("en-IN")}, which doesn't match the
//                 scheduled ₹{Number(bulkConfig.totalAmount || 0).toLocaleString("en-IN")} above — that's fine
//                 if intentional (e.g. an auction chit with uneven installments).
//               </p>
//             )}
//             {bulkErrors.rows && <p className="text-[11px] text-error">{bulkErrors.rows}</p>}

//             <div className="modal-action mt-4">
//               <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-lg">
//                 Cancel
//               </button>
//               <button type="submit" disabled={loading} className="btn btn-primary btn-sm rounded-lg gap-1.5">
//                 {loading && <Loader2 size={14} className="animate-spin" />}
//                 Create {bulkRows.length} installments
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//       <div className="modal-backdrop bg-black/40" onClick={onClose} />
//     </div>
//   );
// }

/*========================================================================*/

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Loader2,
  Wallet2,
  ListChecks,
  Sparkles,
  RotateCcw,
} from "lucide-react";

/**
 * ChitPaymentFormModal
 * SCHEDULE ONLY — creates/edits installment rows (installment_no, due_date,
 * due_amount, remarks). It does NOT record payments; use
 * RecordChitPaymentModal for that (paid_amount, bit_benefit_amount,
 * payment_mode, etc. live there instead, matching the real
 * personal_chit_payments schema).
 *
 * Two modes:
 * - "single": one installment (create or edit).
 * - "bulk":   auto-generates N installments from the chit's total amount /
 *             member count / frequency, each row still individually
 *             editable before submit. Only available when creating fresh.
 *
 * Props:
 * - open (bool)
 * - initialData (object|null) : existing installment row to edit, or null to create
 * - chit (object)              : parent personal_chits row — chit_amount,
 *                                 total_members, payment_frequency,
 *                                 payment_interval, start_date, payment_schedule_type
 * - existingPayments (array)   : already-scheduled installments
 * - suggestedInstallmentNo (number)
 * - loading (bool)
 * - error (string|null)
 * - onClose (fn)
 * - onSubmitSingle (fn)        : called with one payload object
 * - onSubmitBulk (fn)          : called with an array of payload objects
 */

const FREQUENCY_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  custom: "Custom (days)",
};

// Advances a date by one payment cycle using real calendar-month arithmetic
// for monthly/quarterly (so "5th of the month" stays the 5th instead of
// drifting the way flat +30-day math would). Weekly/custom step in days.
function addInterval(dateStr, frequency, interval) {
  const d = new Date(dateStr);
  const n = Number(interval) || 1;
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7 * n);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + n);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3 * n);
      break;
    case "custom":
    default:
      d.setDate(d.getDate() + n); // custom = interval in days
      break;
  }
  return d.toISOString().slice(0, 10);
}

// Splits totalAmount across `count` rows as evenly as possible, pushing the
// rounding leftover onto the LAST row so rows always sum to exactly totalAmount.
function generateRows({
  count,
  startDate,
  frequency,
  interval,
  totalAmount,
  startInstallmentNo,
}) {
  const n = Math.max(1, Number(count) || 1);
  const total = Number(totalAmount) || 0;
  const base = Math.floor(total / n);
  const remainder = total - base * n;

  const rows = [];
  for (let i = 0; i < n; i++) {
    const dueDate =
      i === 0
        ? startDate
        : addInterval(rows[i - 1].due_date, frequency, interval);
    rows.push({
      installment_no: startInstallmentNo + i,
      due_date: dueDate,
      due_amount: base + (i === n - 1 ? remainder : 0),
    });
  }
  return rows;
}

export default function ChitPaymentFormModal({
  open,
  initialData = null,
  chit,
  existingPayments = [],
  suggestedInstallmentNo = 1,
  loading = false,
  error = null,
  onClose,
  onSubmitSingle,
  onSubmitBulk,
}) {
  const isEdit = Boolean(initialData?.id);

  const [mode, setMode] = useState(
    chit?.payment_schedule_type === "auto" ? "bulk" : "single",
  );

  const [singleForm, setSingleForm] = useState({
    installment_no: suggestedInstallmentNo,
    due_date: new Date().toISOString().slice(0, 10),
    due_amount: "",
    remarks: "",
  });
  const [singleErrors, setSingleErrors] = useState({});

  const remainingAmount = useMemo(() => {
    const scheduled = existingPayments.reduce(
      (sum, p) => sum + (Number(p.due_amount) || 0),
      0,
    );
    return Math.max(0, Number(chit?.chit_amount || 0) - scheduled);
  }, [chit, existingPayments]);

  const defaultStartDate = useMemo(() => {
    if (existingPayments.length === 0)
      return (
        chit?.start_date?.slice(0, 10) || new Date().toISOString().slice(0, 10)
      );
    const last = [...existingPayments].sort(
      (a, b) => (b.installment_no || 0) - (a.installment_no || 0),
    )[0];
    return addInterval(
      last.due_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      chit?.payment_frequency || "monthly",
      chit?.payment_interval || 1,
    );
  }, [chit, existingPayments]);

  const [bulkConfig, setBulkConfig] = useState({
    count: chit?.total_members || 1,
    totalAmount: remainingAmount,
    startDate: defaultStartDate,
    frequency: chit?.payment_frequency || "monthly",
    interval: chit?.payment_interval || 1,
  });
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setMode(chit?.payment_schedule_type === "auto" ? "bulk" : "single");
    setSingleForm({
      installment_no: initialData?.installment_no ?? suggestedInstallmentNo,
      due_date:
        initialData?.due_date?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10),
      due_amount: initialData?.due_amount ?? "",
      remarks: initialData?.remarks ?? "",
    });
    setSingleErrors({});

    const cfg = {
      count: chit?.total_members || 1,
      totalAmount: remainingAmount,
      startDate: defaultStartDate,
      frequency: chit?.payment_frequency || "monthly",
      interval: chit?.payment_interval || 1,
    };
    setBulkConfig(cfg);
    setBulkRows(
      generateRows({ ...cfg, startInstallmentNo: suggestedInstallmentNo }),
    );
    setBulkErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const regenerateRows = (overrides = {}) => {
    const cfg = { ...bulkConfig, ...overrides };
    setBulkConfig(cfg);
    setBulkRows(
      generateRows({ ...cfg, startInstallmentNo: suggestedInstallmentNo }),
    );
  };

  const updateRow = (index, field, value) => {
    setBulkRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const bulkTotal = bulkRows.reduce(
    (sum, r) => sum + (Number(r.due_amount) || 0),
    0,
  );
  const bulkTotalMismatch =
    Math.abs(bulkTotal - Number(bulkConfig.totalAmount || 0)) > 0.01;

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!singleForm.due_date) errs.due_date = "Select a due date.";
    if (!singleForm.due_amount || Number(singleForm.due_amount) <= 0)
      errs.due_amount = "Enter a valid amount.";
    setSingleErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmitSingle({
      ...(isEdit ? { id: initialData.id } : {}),
      installment_no: Number(singleForm.installment_no),
      due_date: singleForm.due_date,
      due_amount: Number(singleForm.due_amount),
      remarks: singleForm.remarks.trim() || null,
    });
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!bulkConfig.count || bulkConfig.count < 1)
      errs.count = "Enter at least 1 installment.";
    if (!bulkConfig.totalAmount || Number(bulkConfig.totalAmount) <= 0)
      errs.totalAmount = "Enter a valid total amount.";
    if (!bulkConfig.startDate) errs.startDate = "Select a start date.";
    if (
      bulkRows.some(
        (r) => !r.due_date || !r.due_amount || Number(r.due_amount) <= 0,
      )
    )
      errs.rows = "Every row needs a date and an amount greater than zero.";
    setBulkErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmitBulk(
      bulkRows.map((r) => ({
        installment_no: Number(r.installment_no),
        due_date: r.due_date,
        due_amount: Number(r.due_amount),
      })),
    );
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Wallet2 size={18} className="text-primary" />
            {isEdit ? "Edit Installment Schedule" : "Add Installments"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!isEdit && (
          <div
            role="tablist"
            className="tabs tabs-boxed bg-base-200 w-fit mb-5"
          >
            <button
              type="button"
              role="tab"
              className={`tab gap-1.5 ${mode === "single" ? "tab-active" : ""}`}
              onClick={() => setMode("single")}
            >
              <Wallet2 size={13} />
              Single
            </button>
            <button
              type="button"
              role="tab"
              className={`tab gap-1.5 ${mode === "bulk" ? "tab-active" : ""}`}
              onClick={() => setMode("bulk")}
            >
              <Sparkles size={13} />
              Auto-generate
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        {mode === "single" && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Installment #
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={singleForm.installment_no}
                  onChange={(e) =>
                    setSingleForm((f) => ({
                      ...f,
                      installment_no: e.target.value,
                    }))
                  }
                  className="input input-bordered input-sm rounded-lg w-full"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Due Date *
                  </span>
                </label>
                <input
                  type="date"
                  value={singleForm.due_date}
                  onChange={(e) =>
                    setSingleForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                  className={`input input-bordered input-sm rounded-lg w-full ${singleErrors.due_date ? "input-error" : ""}`}
                />
                {singleErrors.due_date && (
                  <span className="text-[11px] text-error mt-1">
                    {singleErrors.due_date}
                  </span>
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Due Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={singleForm.due_amount}
                onChange={(e) =>
                  setSingleForm((f) => ({ ...f, due_amount: e.target.value }))
                }
                className={`input input-bordered input-sm rounded-lg w-full ${singleErrors.due_amount ? "input-error" : ""}`}
                placeholder="e.g. 50000"
              />
              {singleErrors.due_amount && (
                <span className="text-[11px] text-error mt-1">
                  {singleErrors.due_amount}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Remarks
                </span>
              </label>
              <textarea
                rows={2}
                value={singleForm.remarks}
                onChange={(e) =>
                  setSingleForm((f) => ({ ...f, remarks: e.target.value }))
                }
                className="textarea textarea-bordered textarea-sm rounded-lg w-full"
              />
            </div>

            <div className="modal-action mt-6">
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
                {isEdit ? "Save changes" : "Add installment"}
              </button>
            </div>
          </form>
        )}

        {mode === "bulk" && !isEdit && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Number of installments
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={bulkConfig.count}
                  onChange={(e) => regenerateRows({ count: e.target.value })}
                  className={`input input-bordered input-sm rounded-lg w-full ${bulkErrors.count ? "input-error" : ""}`}
                />
                <span className="text-[11px] text-base-content/40 mt-1">
                  Defaults to total members ({chit?.total_members || 0}).
                </span>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Total amount to schedule (₹)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bulkConfig.totalAmount}
                  onChange={(e) =>
                    regenerateRows({ totalAmount: e.target.value })
                  }
                  className={`input input-bordered input-sm rounded-lg w-full ${bulkErrors.totalAmount ? "input-error" : ""}`}
                />
                <span className="text-[11px] text-base-content/40 mt-1">
                  Unscheduled balance: ₹
                  {remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Start date
                  </span>
                </label>
                <input
                  type="date"
                  value={bulkConfig.startDate}
                  onChange={(e) =>
                    regenerateRows({ startDate: e.target.value })
                  }
                  className="input input-bordered input-sm rounded-lg w-full"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Frequency
                  </span>
                </label>
                <select
                  value={bulkConfig.frequency}
                  onChange={(e) =>
                    regenerateRows({ frequency: e.target.value })
                  }
                  className="select select-bordered select-sm rounded-lg w-full"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    {bulkConfig.frequency === "custom"
                      ? "Every (days)"
                      : "Every (cycles)"}
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkConfig.interval}
                  onChange={(e) => regenerateRows({ interval: e.target.value })}
                  className="input input-bordered input-sm rounded-lg w-full"
                />
              </div>
            </div>

            <div className="rounded-xl border border-base-300 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-base-200/50 border-b border-base-300">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-base-content/60">
                  <ListChecks size={13} />
                  {bulkRows.length} installments generated
                </span>
                <button
                  type="button"
                  onClick={() => regenerateRows()}
                  className="btn btn-ghost btn-xs gap-1"
                  title="Discard manual row edits and recompute"
                >
                  <RotateCcw size={11} />
                  Reset rows
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-base-200">
                {bulkRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-xs text-base-content/40 w-8 shrink-0">
                      #{row.installment_no}
                    </span>
                    <input
                      type="date"
                      value={row.due_date}
                      onChange={(e) => updateRow(i, "due_date", e.target.value)}
                      className="input input-bordered input-xs rounded-md flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.due_amount}
                      onChange={(e) =>
                        updateRow(i, "due_amount", e.target.value)
                      }
                      className="input input-bordered input-xs rounded-md w-28"
                    />
                  </div>
                ))}
              </div>
            </div>

            {bulkTotalMismatch && (
              <p className="text-[11px] text-warning">
                Rows currently total ₹{bulkTotal.toLocaleString("en-IN")}, which
                doesn't match ₹
                {Number(bulkConfig.totalAmount || 0).toLocaleString("en-IN")}{" "}
                above — fine if intentional.
              </p>
            )}
            {bulkErrors.rows && (
              <p className="text-[11px] text-error">{bulkErrors.rows}</p>
            )}

            <div className="modal-action mt-4">
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
                Create {bulkRows.length} installments
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
