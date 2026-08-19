// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Pencil,
//   Plus,
//   Wallet2,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   Receipt,
// } from "lucide-react";
// import {
//   fetchPersonalChitById,
//   editPersonalChit,
//   takePersonalChit,
//   clearSelectedPersonalChit,
//   clearPersonalChitError,
// } from "../../../redux/personalChits/personalChitSlice.js";
// import {
//   fetchPayments,
//   addPayment,
//   editPayment,
//   removePayment,
//   clearPaymentError,
// } from "../../../redux/personalChitPayment/personalChitPaymentSlice.js";
// import PersonalChitFormModal from "../components/PersonalChitFormModal.jsx";
// import MarkChitTakenModal from "../components/MarkChitTakenModal.jsx";
// import ChitPaymentTable from "../components/ChitPaymentTable.jsx";
// import ChitPaymentFormModal from "../components/ChitPaymentFormModal.jsx";
// import ChitPaymentDeleteModal from "../components/ChitPaymentDeleteModal.jsx";
// import {
//   STATUS_STYLES,
//   FREQUENCY_LABELS,
//   formatCurrency,
//   formatDate,
// } from "../utils/chitHelpers.js";

// function InfoRow({ label, value }) {
//   return (
//     <div className="flex justify-between gap-4 py-2 text-sm">
//       <span className="text-base-content/40">{label}</span>
//       <span className="font-medium text-right">
//         {value || <span className="text-base-content/30">—</span>}
//       </span>
//     </div>
//   );
// }

// export default function PersonalChitViewPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const {
//     personalChit: chit,
//     loading,
//     error,
//   } = useSelector((state) => state.personalChits);
//   const {
//     payments,
//     loading: paymentsLoading,
//     error: paymentsError,
//   } = useSelector((state) => state.personalChitPayments);

//   const [editOpen, setEditOpen] = useState(false);
//   const [editSubmitting, setEditSubmitting] = useState(false);

//   const [takenOpen, setTakenOpen] = useState(false);
//   const [takenSubmitting, setTakenSubmitting] = useState(false);

//   const [paymentModal, setPaymentModal] = useState(null); // null closed, {} new installment, {...payment} record/edit
//   const [paymentSubmitting, setPaymentSubmitting] = useState(false);

//   const [deletePaymentTarget, setDeletePaymentTarget] = useState(null);
//   const [deletePaymentSubmitting, setDeletePaymentSubmitting] = useState(false);

//   useEffect(() => {
//     dispatch(fetchPersonalChitById(id));
//     dispatch(fetchPayments(id));
//     return () => dispatch(clearSelectedPersonalChit());
//   }, [dispatch, id]);

//   const handleEditSubmit = async (formData) => {
//     setEditSubmitting(true);
//     try {
//       const action = await dispatch(editPersonalChit({ id, formData }));
//       if (editPersonalChit.fulfilled.match(action)) {
//         setEditOpen(false);
//         dispatch(fetchPersonalChitById(id));
//       }
//     } finally {
//       setEditSubmitting(false);
//     }
//   };

//   const handleTakenConfirm = async (takenData) => {
//     setTakenSubmitting(true);
//     try {
//       const action = await dispatch(takePersonalChit({ id, data: takenData }));
//       if (takePersonalChit.fulfilled.match(action)) {
//         setTakenOpen(false);
//         dispatch(fetchPersonalChitById(id));
//       }
//     } finally {
//       setTakenSubmitting(false);
//     }
//   };

//   const handlePaymentSubmit = async (formData) => {
//     setPaymentSubmitting(true);
//     try {
//       const isEdit = Boolean(paymentModal?.id);
//       const action = isEdit
//         ? await dispatch(
//             editPayment({ chitId: id, id: paymentModal.id, formData }),
//           )
//         : await dispatch(addPayment({ chitId: id, formData }));

//       const wasFulfilled = isEdit
//         ? editPayment.fulfilled.match(action)
//         : addPayment.fulfilled.match(action);
//       if (wasFulfilled) {
//         setPaymentModal(null);
//         dispatch(fetchPersonalChitById(id)); // refresh summary totals
//         dispatch(fetchPayments(id));
//       }
//     } finally {
//       setPaymentSubmitting(false);
//     }
//   };

//   const handleDeletePaymentConfirm = async () => {
//     if (!deletePaymentTarget) return;
//     setDeletePaymentSubmitting(true);
//     try {
//       const action = await dispatch(
//         removePayment({ chitId: id, id: deletePaymentTarget.id }),
//       );
//       if (removePayment.fulfilled.match(action)) {
//         setDeletePaymentTarget(null);
//         dispatch(fetchPersonalChitById(id));
//       }
//     } finally {
//       setDeletePaymentSubmitting(false);
//     }
//   };

//   if (loading && !chit) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
//         <span className="loading loading-spinner loading-md" />
//         <p className="text-sm">Loading chit…</p>
//       </div>
//     );
//   }

//   if (!chit) return null;

//   const nextInstallmentNo =
//     (payments?.reduce((max, p) => Math.max(max, p.installment_no || 0), 0) ||
//       0) + 1;
//   const paidPercent =
//     chit.chit_amount > 0
//       ? Math.round(
//           (Number(chit.total_paid_amount) / Number(chit.chit_amount)) * 100,
//         )
//       : 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between flex-wrap gap-3">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate(-1)}
//             className="btn btn-ghost btn-sm btn-square"
//           >
//             <ArrowLeft size={18} />
//           </button>
//           <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
//             <Wallet2 size={20} />
//           </span>
//           <div>
//             <h1 className="text-xl font-bold">{chit.chit_name}</h1>
//             <p className="text-xs text-base-content/40 font-mono">
//               {chit.chit_no}
//             </p>
//           </div>
//           <span
//             className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[chit.status] || "badge-ghost"}`}
//           >
//             <span className="w-1.5 h-1.5 rounded-full bg-current" />
//             {chit.status?.charAt(0).toUpperCase() + chit.status?.slice(1)}
//           </span>
//           {chit.is_taken && (
//             <span className="badge badge-success badge-outline gap-1.5 font-medium">
//               <CheckCircle2 size={11} /> Taken
//             </span>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           {!chit.is_taken && (
//             <button
//               onClick={() => {
//                 dispatch(clearPersonalChitError());
//                 setTakenOpen(true);
//               }}
//               className="btn btn-success btn-sm gap-1.5"
//             >
//               <CheckCircle2 size={15} />
//               Mark Taken
//             </button>
//           )}
//           <button
//             onClick={() => {
//               dispatch(clearPersonalChitError());
//               setEditOpen(true);
//             }}
//             className="btn btn-outline btn-sm gap-1.5 border-base-300"
//           >
//             <Pencil size={15} />
//             Edit
//           </button>
//         </div>
//       </div>

//       {/* Financial summary strip */}
//       <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//         <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
//           <div className="text-xs text-base-content/50">Chit Value</div>
//           <div className="text-lg font-semibold leading-tight">
//             {formatCurrency(chit.chit_amount)}
//           </div>
//         </div>
//         <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
//           <div className="text-xs text-base-content/50">Total Paid</div>
//           <div className="text-lg font-semibold leading-tight text-success">
//             {formatCurrency(chit.total_paid_amount)}
//           </div>
//         </div>
//         <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
//           <div className="text-xs text-base-content/50">Pending</div>
//           <div className="text-lg font-semibold leading-tight text-error">
//             {formatCurrency(chit.total_pending_amount)}
//           </div>
//         </div>
//         <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
//           <div className="text-xs text-base-content/50">Received (Taken)</div>
//           <div className="text-lg font-semibold leading-tight text-primary">
//             {chit.is_taken ? formatCurrency(chit.chit_received_amount) : "—"}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Provider info */}
//         <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
//             <Building2 size={13} /> Provider Details
//           </h3>
//           <div className="divide-y divide-base-200">
//             <InfoRow label="Provider Name" value={chit.chit_provider} />
//             <InfoRow label="Mobile" value={chit.provider_mobile} />
//             <InfoRow
//               label="Alternate Mobile"
//               value={chit.provider_alternate_mobile}
//             />
//             <InfoRow label="Address" value={chit.provider_address} />
//           </div>
//         </div>

//         {/* Schedule & dates */}
//         <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
//             <CalendarDays size={13} /> Schedule & Dates
//           </h3>
//           <div className="divide-y divide-base-200">
//             <InfoRow
//               label="Schedule Type"
//               value={
//                 chit.payment_schedule_type?.charAt(0).toUpperCase() +
//                 chit.payment_schedule_type?.slice(1)
//               }
//             />
//             <InfoRow
//               label="Frequency"
//               value={`${FREQUENCY_LABELS[chit.payment_frequency] || chit.payment_frequency} (every ${chit.payment_interval})`}
//             />
//             <InfoRow label="Start Date" value={formatDate(chit.start_date)} />
//             <InfoRow
//               label="Expected End"
//               value={formatDate(chit.expected_end_date)}
//             />
//             <InfoRow
//               label="Actual End"
//               value={formatDate(chit.actual_end_date)}
//             />
//             <InfoRow label="Taken Date" value={formatDate(chit.taken_date)} />
//           </div>
//         </div>

//         {/* Progress + Remarks */}
//         <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
//               Payment Progress
//             </h3>
//             <span className="text-xs font-bold text-primary">
//               {paidPercent}%
//             </span>
//           </div>
//           <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
//             <div
//               className="bg-primary h-full rounded-full transition-all"
//               style={{ width: `${paidPercent}%` }}
//             />
//           </div>

//           {chit.remarks && (
//             <div className="mt-4 pt-3 border-t border-base-200">
//               <p className="text-xs text-base-content/40 mb-1">Remarks</p>
//               <p className="text-sm text-base-content/70">{chit.remarks}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Payment schedule */}
//       <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
//         <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-200 bg-base-200/20">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
//             <Receipt size={13} /> Payment Schedule
//           </h3>
//           <button
//             onClick={() => {
//               dispatch(clearPaymentError());
//               setPaymentModal({});
//             }}
//             className="btn btn-primary btn-xs rounded-lg gap-1"
//           >
//             <Plus size={12} />
//             Add Installment
//           </button>
//         </div>
//         <ChitPaymentTable
//           payments={payments}
//           loading={paymentsLoading}
//           onEdit={(p) => {
//             dispatch(clearPaymentError());
//             setPaymentModal(p);
//           }}
//           onRecordPayment={(p) => {
//             dispatch(clearPaymentError());
//             setPaymentModal(p);
//           }}
//           onDelete={setDeletePaymentTarget}
//         />
//       </div>

//       {/* Modals */}
//       <PersonalChitFormModal
//         open={editOpen}
//         initialData={chit}
//         loading={editSubmitting}
//         error={editOpen ? error : null}
//         onClose={() => {
//           setEditOpen(false);
//           dispatch(clearPersonalChitError());
//         }}
//         onSubmit={handleEditSubmit}
//       />

//       <MarkChitTakenModal
//         open={takenOpen}
//         chit={chit}
//         loading={takenSubmitting}
//         error={takenOpen ? error : null}
//         onConfirm={handleTakenConfirm}
//         onClose={() => {
//           setTakenOpen(false);
//           dispatch(clearPersonalChitError());
//         }}
//       />

//       <ChitPaymentFormModal
//         open={Boolean(paymentModal)}
//         initialData={paymentModal?.id ? paymentModal : null}
//         suggestedInstallmentNo={nextInstallmentNo}
//         loading={paymentSubmitting}
//         error={paymentModal ? paymentsError : null}
//         onClose={() => {
//           setPaymentModal(null);
//           dispatch(clearPaymentError());
//         }}
//         onSubmit={handlePaymentSubmit}
//       />

//       <ChitPaymentDeleteModal
//         open={Boolean(deletePaymentTarget)}
//         payment={deletePaymentTarget}
//         loading={deletePaymentSubmitting}
//         error={deletePaymentTarget ? paymentsError : null}
//         onConfirm={handleDeletePaymentConfirm}
//         onClose={() => setDeletePaymentTarget(null)}
//       />
//     </div>
//   );
// }


/*=============================================================================*/

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Wallet2,
  Building2,
  CalendarDays,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import {
  fetchPersonalChitById,
  editPersonalChit,
  takePersonalChit,
  clearSelectedPersonalChit,
  clearPersonalChitError,
} from "../../../redux/personalChits/personalChitSlice.js";
import {
  fetchPayments,
  addPayment,
  editPayment,
  removePayment,
  manualBulkInstallment,
  clearPaymentError,
} from "../../../redux/personalChitPayment/personalChitPaymentSlice.js";
import PersonalChitFormModal from "../components/PersonalChitFormModal.jsx";
import MarkChitTakenModal from "../components/MarkChitTakenModal.jsx";
import ChitPaymentTable from "../components/ChitPaymentTable.jsx";
import ChitPaymentFormModal from "../components/ChitPaymentFormModal.jsx";
import ChitPaymentDeleteModal from "../components/ChitPaymentDeleteModal.jsx";
import {
  STATUS_STYLES,
  FREQUENCY_LABELS,
  formatCurrency,
  formatDate,
} from "../utils/chitHelpers.js";

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

export default function PersonalChitViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    personalChit: chit,
    loading,
    error,
  } = useSelector((state) => state.personalChits);
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
  } = useSelector((state) => state.personalChitPayments);

  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [takenOpen, setTakenOpen] = useState(false);
  const [takenSubmitting, setTakenSubmitting] = useState(false);

  const [paymentModal, setPaymentModal] = useState(null); // null closed, {} new installment, {...payment} record/edit
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [deletePaymentTarget, setDeletePaymentTarget] = useState(null);
  const [deletePaymentSubmitting, setDeletePaymentSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPersonalChitById(id));
    dispatch(fetchPayments(id));
    return () => dispatch(clearSelectedPersonalChit());
  }, [dispatch, id]);

  const handleEditSubmit = async (formData) => {
    setEditSubmitting(true);
    try {
      const action = await dispatch(editPersonalChit({ id, formData }));
      if (editPersonalChit.fulfilled.match(action)) {
        setEditOpen(false);
        dispatch(fetchPersonalChitById(id));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleTakenConfirm = async (takenData) => {
    setTakenSubmitting(true);
    try {
      const action = await dispatch(takePersonalChit({ id, data: takenData }));
      if (takePersonalChit.fulfilled.match(action)) {
        setTakenOpen(false);
        dispatch(fetchPersonalChitById(id));
      }
    } finally {
      setTakenSubmitting(false);
    }
  };

  // Single installment — create or edit
  const handlePaymentSubmit = async (formData) => {
    setPaymentSubmitting(true);
    try {
      const isEdit = Boolean(paymentModal?.id);
      const action = isEdit
        ? await dispatch(
            editPayment({ chitId: id, id: paymentModal.id, formData }),
          )
        : await dispatch(addPayment({ chitId: id, formData }));

      const wasFulfilled = isEdit
        ? editPayment.fulfilled.match(action)
        : addPayment.fulfilled.match(action);
      if (wasFulfilled) {
        setPaymentModal(null);
        dispatch(fetchPersonalChitById(id)); // refresh summary totals
        dispatch(fetchPayments(id));
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Bulk / auto-generated installments
  const handleBulkSubmit = async (installments) => {
    setPaymentSubmitting(true);
    try {
      // NOTE: verify the exact payload shape your manualBulkInstallments
      // service/endpoint expects — this assumes { installments: [...] }.
      // Adjust the key if your backend expects something else (e.g. a bare
      // array, or { payments: [...] }).
      const action = await dispatch(
        manualBulkInstallment({ chitId: id, formData: { installments } }),
      );
      if (manualBulkInstallment.fulfilled.match(action)) {
        setPaymentModal(null);
        dispatch(fetchPersonalChitById(id));
        dispatch(fetchPayments(id));
      }
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDeletePaymentConfirm = async () => {
    if (!deletePaymentTarget) return;
    setDeletePaymentSubmitting(true);
    try {
      const action = await dispatch(
        removePayment({ chitId: id, id: deletePaymentTarget.id }),
      );
      if (removePayment.fulfilled.match(action)) {
        setDeletePaymentTarget(null);
        dispatch(fetchPersonalChitById(id));
      }
    } finally {
      setDeletePaymentSubmitting(false);
    }
  };

  if (loading && !chit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading chit…</p>
      </div>
    );
  }

  if (!chit) return null;

  const nextInstallmentNo =
    (payments?.reduce((max, p) => Math.max(max, p.installment_no || 0), 0) ||
      0) + 1;
  const paidPercent =
    chit.chit_amount > 0
      ? Math.round(
          (Number(chit.total_paid_amount) / Number(chit.chit_amount)) * 100,
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
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
            <Wallet2 size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">{chit.chit_name}</h1>
            <p className="text-xs text-base-content/40 font-mono">
              {chit.chit_no}
            </p>
          </div>
          <span
            className={`badge gap-1.5 font-medium ml-2 ${STATUS_STYLES[chit.status] || "badge-ghost"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {chit.status?.charAt(0).toUpperCase() + chit.status?.slice(1)}
          </span>
          {chit.is_taken && (
            <span className="badge badge-success badge-outline gap-1.5 font-medium">
              <CheckCircle2 size={11} /> Taken
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!chit.is_taken && (
            <button
              onClick={() => {
                dispatch(clearPersonalChitError());
                setTakenOpen(true);
              }}
              className="btn btn-success btn-sm gap-1.5"
            >
              <CheckCircle2 size={15} />
              Mark Taken
            </button>
          )}
          <button
            onClick={() => {
              dispatch(clearPersonalChitError());
              setEditOpen(true);
            }}
            className="btn btn-outline btn-sm gap-1.5 border-base-300"
          >
            <Pencil size={15} />
            Edit
          </button>
        </div>
      </div>

      {/* Financial summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Chit Value</div>
          <div className="text-lg font-semibold leading-tight">
            {formatCurrency(chit.chit_amount)}
          </div>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Total Paid</div>
          <div className="text-lg font-semibold leading-tight text-success">
            {formatCurrency(chit.total_paid_amount)}
          </div>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Pending</div>
          <div className="text-lg font-semibold leading-tight text-error">
            {formatCurrency(chit.total_pending_amount)}
          </div>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <div className="text-xs text-base-content/50">Received (Taken)</div>
          <div className="text-lg font-semibold leading-tight text-primary">
            {chit.is_taken ? formatCurrency(chit.chit_received_amount) : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider info */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <Building2 size={13} /> Provider Details
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow label="Provider Name" value={chit.chit_provider} />
            <InfoRow label="Mobile" value={chit.provider_mobile} />
            <InfoRow
              label="Alternate Mobile"
              value={chit.provider_alternate_mobile}
            />
            <InfoRow label="Address" value={chit.provider_address} />
          </div>
        </div>

        {/* Schedule & dates */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 flex items-center gap-1.5">
            <CalendarDays size={13} /> Schedule & Dates
          </h3>
          <div className="divide-y divide-base-200">
            <InfoRow
              label="Schedule Type"
              value={
                chit.payment_schedule_type?.charAt(0).toUpperCase() +
                chit.payment_schedule_type?.slice(1)
              }
            />
            <InfoRow
              label="Frequency"
              value={`${FREQUENCY_LABELS[chit.payment_frequency] || chit.payment_frequency} (every ${chit.payment_interval})`}
            />
            <InfoRow label="Start Date" value={formatDate(chit.start_date)} />
            <InfoRow
              label="Expected End"
              value={formatDate(chit.expected_end_date)}
            />
            <InfoRow
              label="Actual End"
              value={formatDate(chit.actual_end_date)}
            />
            <InfoRow label="Taken Date" value={formatDate(chit.taken_date)} />
          </div>
        </div>

        {/* Progress + Remarks */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Payment Progress
            </h3>
            <span className="text-xs font-bold text-primary">
              {paidPercent}%
            </span>
          </div>
          <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>

          {chit.remarks && (
            <div className="mt-4 pt-3 border-t border-base-200">
              <p className="text-xs text-base-content/40 mb-1">Remarks</p>
              <p className="text-sm text-base-content/70">{chit.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment schedule */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-200 bg-base-200/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
            <Receipt size={13} /> Payment Schedule
          </h3>
          <button
            onClick={() => {
              dispatch(clearPaymentError());
              setPaymentModal({});
            }}
            className="btn btn-primary btn-xs rounded-lg gap-1"
          >
            <Plus size={12} />
            Add Installment
          </button>
        </div>
        <ChitPaymentTable
          payments={payments}
          loading={paymentsLoading}
          onEdit={(p) => {
            dispatch(clearPaymentError());
            setPaymentModal(p);
          }}
          onRecordPayment={(p) => {
            dispatch(clearPaymentError());
            setPaymentModal(p);
          }}
          onDelete={setDeletePaymentTarget}
        />
      </div>

      {/* Modals */}
      <PersonalChitFormModal
        open={editOpen}
        initialData={chit}
        loading={editSubmitting}
        error={editOpen ? error : null}
        onClose={() => {
          setEditOpen(false);
          dispatch(clearPersonalChitError());
        }}
        onSubmit={handleEditSubmit}
      />

      <MarkChitTakenModal
        open={takenOpen}
        chit={chit}
        loading={takenSubmitting}
        error={takenOpen ? error : null}
        onConfirm={handleTakenConfirm}
        onClose={() => {
          setTakenOpen(false);
          dispatch(clearPersonalChitError());
        }}
      />

      <ChitPaymentFormModal
        open={Boolean(paymentModal)}
        initialData={paymentModal?.id ? paymentModal : null}
        chit={chit}
        existingPayments={payments}
        suggestedInstallmentNo={nextInstallmentNo}
        loading={paymentSubmitting}
        error={paymentModal ? paymentsError : null}
        onClose={() => {
          setPaymentModal(null);
          dispatch(clearPaymentError());
        }}
        onSubmitSingle={handlePaymentSubmit}
        onSubmitBulk={handleBulkSubmit}
      />

      <ChitPaymentDeleteModal
        open={Boolean(deletePaymentTarget)}
        payment={deletePaymentTarget}
        loading={deletePaymentSubmitting}
        error={deletePaymentTarget ? paymentsError : null}
        onConfirm={handleDeletePaymentConfirm}
        onClose={() => setDeletePaymentTarget(null)}
      />
    </div>
  );
}