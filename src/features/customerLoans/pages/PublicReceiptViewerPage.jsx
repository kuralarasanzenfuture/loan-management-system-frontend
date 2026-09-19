import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { generatePaymentReceiptPdf } from "../utils/whatsappShare.js";
import { getPaymentReceipt } from "../../../redux/loanPayments/loanPayment.service.js";

export default function PublicReceiptViewerPage() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update browser tab title to reflect official verified receipt
  useEffect(() => {
    if (receiptData?.receipt_no) {
      document.title = `Official Receipt ${receiptData.receipt_no} | ${receiptData.company_name || "CM Micro Finance"}`;
    }
  }, [receiptData]);

  useEffect(() => {
    // 1. Try decoding compact URL-safe base64 token (?token=..., ?auth=..., or ?d=...)
    const token =
      searchParams.get("token") ||
      searchParams.get("auth") ||
      searchParams.get("d");

    if (token) {
      try {
        // Convert URL-safe base64 back to standard base64 and pad
        let b64 = token.replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        const jsonStr = decodeURIComponent(escape(atob(b64)));
        const parsed = JSON.parse(jsonStr);

        setReceiptData({
          receipt_no: parsed.r || id || "RCP-OFFICIAL",
          customer_name: parsed.c || "Customer",
          customer_mobile: parsed.m || "",
          loan_no: parsed.l || "LN-OFFICIAL",
          installment_no: parsed.i || 1,
          payment_date: parsed.d || new Date().toLocaleDateString(),
          amount: Number(parsed.a || 0),
          payment_mode: (parsed.p || "CASH").toUpperCase(),
          reference: parsed.ref || "",
          remaining_balance: Number(parsed.b || 0),
          status: parsed.s === "paid" ? "paid" : "partial",
          company_name: parsed.co || "CM Micro Finance",
          company_phone: parsed.cp || "+91 98765 43210",
        });
        setLoading(false);
        return;
      } catch (err) {
        console.warn("Could not decode ?token parameter, attempting fallback", err);
      }
    }

    // 2. Try individual query params (?no=...&amt=...)
    const qNo = searchParams.get("r") || searchParams.get("no");
    if (qNo) {
      setReceiptData({
        receipt_no: qNo,
        customer_name: searchParams.get("name") || "Customer",
        customer_mobile: searchParams.get("m") || "",
        loan_no: searchParams.get("loan") || "LN-OFFICIAL",
        installment_no: searchParams.get("inst") || 1,
        payment_date: searchParams.get("date") || new Date().toLocaleDateString(),
        amount: Number(searchParams.get("amt") || 0),
        payment_mode: (searchParams.get("mode") || "CASH").toUpperCase(),
        reference: searchParams.get("ref") || "",
        remaining_balance: Number(searchParams.get("bal") || 0),
        status: searchParams.get("status") === "paid" ? "paid" : "partial",
        company_name: searchParams.get("co") || "CM Micro Finance",
        company_phone: searchParams.get("phone") || searchParams.get("cp") || "+91 98765 43210",
      });
      setLoading(false);
      return;
    }

    // 3. If ID provided in URL, attempt backend fetch
    const paymentId = id || searchParams.get("id");
    if (paymentId) {
      getPaymentReceipt(paymentId)
        .then((res) => {
          const raw = res?.data || res;
          const p = raw.payment || {};
          const c = raw.customer || {};
          const co = raw.company || {};
          setReceiptData({
            receipt_no: raw.receipt_no || `RCP-${p.id || paymentId}`,
            customer_name: c.name || p.customer_name || "Customer",
            customer_mobile: c.mobile || p.customer_mobile || "",
            loan_no: raw.loan?.loan_no || p.loan_no || `LN-${p.loan_id || ""}`,
            installment_no: p.installment_no || 1,
            payment_date: p.payment_date || new Date().toLocaleDateString(),
            amount: Number(p.payment_amount || 0),
            payment_mode: (p.payment_mode || "CASH").toUpperCase(),
            reference: p.transaction_reference || p.cheque_number || "",
            remaining_balance: Number(p.installment_balance_amount || 0),
            status: p.installment_status || "paid",
            company_name: co.company_name || "CM Micro Finance",
            company_phone: co.phone || "+91 98765 43210",
          });
        })
        .catch((err) => {
          console.error("Failed to load receipt from API:", err);
          setError("Could not load receipt voucher details.");
        })
        .finally(() => setLoading(false));
    } else {
      setError("Receipt reference or details not found in the link.");
      setLoading(false);
    }
  }, [searchParams, id]);

  const handleDownloadPdf = () => {
    if (!receiptData) return;
    try {
      const doc = generatePaymentReceiptPdf({
        loan: {
          loan_no: receiptData.loan_no,
          customer_name: receiptData.customer_name,
          customer_mobile: receiptData.customer_mobile,
        },
        installment: {
          installment_no: receiptData.installment_no,
          balance_amount: receiptData.remaining_balance,
          status: receiptData.status,
        },
        customer: {
          name: receiptData.customer_name,
          mobile: receiptData.customer_mobile,
        },
        company: {
          company_name: receiptData.company_name,
          phone: receiptData.company_phone,
        },
        successData: {
          amountPaidNow: receiptData.amount,
          receiptNo: receiptData.receipt_no,
          paidDate: receiptData.payment_date,
          remainingBalance: receiptData.remaining_balance,
          status: receiptData.status,
          paymentMode: receiptData.payment_mode,
          transactionReference: receiptData.reference,
        },
      });

      doc.save(`Official-Receipt-${receiptData.receipt_no}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try printing the page.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Loading official payment receipt...
        </p>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Receipt Voucher Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          {error || "The receipt link may be invalid or expired. Please check your message link or contact customer support."}
        </p>
        <div className="mt-5">
          <Link to="/" className="btn btn-sm btn-primary rounded-xl px-4">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isCleared = receiptData.status === "paid" || receiptData.remaining_balance <= 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 flex flex-col items-center justify-center">
      {/* Top Header Controls (Hidden during print) */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Verified Official Receipt
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Main Official Receipt Voucher Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Decorative Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        <div className="p-6">
          {/* Company Branding & Header */}
          <div className="text-center pb-5 border-b border-dashed border-slate-200 dark:border-slate-800">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {receiptData.company_name}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Official Payment Voucher • Verified Transaction
            </p>
            {receiptData.company_phone && (
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                Helpline: {receiptData.company_phone}
              </p>
            )}
          </div>

          {/* Receipt Meta (Number & Date) */}
          <div className="flex items-center justify-between py-3 px-3.5 my-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Receipt No</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receiptData.receipt_no}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Payment Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptData.payment_date}</span>
            </div>
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-center my-4">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Amount Paid Received
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              ₹{receiptData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Paid via {receiptData.payment_mode}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 py-3 border-y border-dashed border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Customer Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{receiptData.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Loan Account</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receiptData.loan_no}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Installment Number</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">#{receiptData.installment_no}</span>
            </div>
            {receiptData.reference && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Txn Reference</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{receiptData.reference}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Remaining Balance</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ₹{receiptData.remaining_balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Settlement Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isCleared ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
              }`}>
                {isCleared ? "Cleared in Full" : "Partial Payment"}
              </span>
            </div>
          </div>

          {/* Big Action Button for Mobile Users */}
          <div className="mt-5 print:hidden">
            <button
              onClick={handleDownloadPdf}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Official PDF Receipt
            </button>
          </div>

          {/* Signatures / Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Customer Copy</span>
            <span>Authorized System Receipt</span>
          </div>

          <p className="text-[9px] text-center text-slate-400 mt-3 leading-tight">
            This is a computer-generated official receipt voucher. For any inquiries, please contact {receiptData.company_phone || receiptData.company_name}.
          </p>
        </div>
      </div>
    </div>
  );
}
