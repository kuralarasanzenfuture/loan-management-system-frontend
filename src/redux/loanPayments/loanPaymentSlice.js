import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  payInstallment,
  payLoanAutoAllocate,
  bulkPayInstallments,
  getAllPayments,
  getPaymentSummary,
  getPaymentReceipt,
  getPaymentsByLoan,
  getPaymentsByInstallment,
  getPaymentById,
  revertPayment,
} from "./loanPayment.service.js";

/* =========================================================
   ASYNC THUNKS
========================================================= */

// Record payment for single installment
export const recordInstallmentPayment = createAsyncThunk(
  "loanPayments/recordInstallmentPayment",
  async (payload, { rejectWithValue }) => {
    try {
      return await payInstallment(payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to record payment"
      );
    }
  }
);

// Lump sum auto-allocated payment across a loan's installments
export const payLoanLumpSum = createAsyncThunk(
  "loanPayments/payLoanLumpSum",
  async (payload, { rejectWithValue }) => {
    try {
      return await payLoanAutoAllocate(payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to auto-allocate payment"
      );
    }
  }
);

// Bulk batch payments
export const bulkPayInstallmentsAction = createAsyncThunk(
  "loanPayments/bulkPayInstallments",
  async (payload, { rejectWithValue }) => {
    try {
      return await bulkPayInstallments(payload);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to process bulk payments"
      );
    }
  }
);

// Fetch payments for a specific loan
export const fetchPaymentsByLoan = createAsyncThunk(
  "loanPayments/fetchPaymentsByLoan",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getPaymentsByLoan(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch loan payments"
      );
    }
  }
);

// Fetch payments for a specific installment
export const fetchPaymentsByInstallment = createAsyncThunk(
  "loanPayments/fetchPaymentsByInstallment",
  async (installmentId, { rejectWithValue }) => {
    try {
      return await getPaymentsByInstallment(installmentId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch installment payments"
      );
    }
  }
);

// Fetch payment receipt voucher
export const fetchPaymentReceipt = createAsyncThunk(
  "loanPayments/fetchPaymentReceipt",
  async (id, { rejectWithValue }) => {
    try {
      return await getPaymentReceipt(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch payment receipt"
      );
    }
  }
);

// Fetch paginated payments list
export const fetchAllPayments = createAsyncThunk(
  "loanPayments/fetchAllPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllPayments(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch payments"
      );
    }
  }
);

// Fetch payment summary / metrics
export const fetchPaymentSummary = createAsyncThunk(
  "loanPayments/fetchPaymentSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPaymentSummary(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch payment summary"
      );
    }
  }
);

// Revert a payment
export const revertLoanPayment = createAsyncThunk(
  "loanPayments/revertLoanPayment",
  async (arg, { rejectWithValue }) => {
    try {
      const id = typeof arg === "object" ? arg.id : arg;
      return await revertPayment(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to revert payment"
      );
    }
  }
);

export const revertPaymentAction = revertLoanPayment;

/* =========================================================
   SLICE DEFINITION
========================================================= */

const initialState = {
  // All payments (paginated)
  payments: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Payments for current loan view
  loanPayments: [],

  // Payments for specific installment
  installmentPayments: [],

  // Printable receipt voucher data
  receipt: null,

  // Financial summary & payment mode breakdown
  summary: null,

  // Loading & error flags
  loading: false,
  loanPaymentsLoading: false,
  receiptLoading: false,
  actionLoading: false,
  error: null,
};

const loanPaymentSlice = createSlice({
  name: "loanPayments",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearReceiptData: (state) => {
      state.receipt = null;
    },
    clearLoanPayments: (state) => {
      state.loanPayments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Record Installment Payment
      .addCase(recordInstallmentPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(recordInstallmentPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.payment) {
          state.loanPayments.unshift(action.payload.payment);
        }
      })
      .addCase(recordInstallmentPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Pay Loan Lump Sum Auto-Allocate
      .addCase(payLoanLumpSum.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(payLoanLumpSum.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(payLoanLumpSum.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Payments by Loan
      .addCase(fetchPaymentsByLoan.pending, (state) => {
        state.loanPaymentsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsByLoan.fulfilled, (state, action) => {
        state.loanPaymentsLoading = false;
        const data = action.payload?.data || action.payload || [];
        state.loanPayments = Array.isArray(data) ? data : [];
      })
      .addCase(fetchPaymentsByLoan.rejected, (state, action) => {
        state.loanPaymentsLoading = false;
        state.error = action.payload;
      })

      // Fetch Payments by Installment
      .addCase(fetchPaymentsByInstallment.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentsByInstallment.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload || [];
        state.installmentPayments = Array.isArray(data) ? data : [];
      })
      .addCase(fetchPaymentsByInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Receipt
      .addCase(fetchPaymentReceipt.pending, (state) => {
        state.receiptLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentReceipt.fulfilled, (state, action) => {
        state.receiptLoading = false;
        state.receipt = action.payload?.data || action.payload;
      })
      .addCase(fetchPaymentReceipt.rejected, (state, action) => {
        state.receiptLoading = false;
        state.error = action.payload;
      })

      // Fetch All Payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload?.data || [];
        state.pagination = {
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 10,
          total: action.payload?.total || 0,
          totalPages: action.payload?.total_pages || 1,
        };
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Summary
      .addCase(fetchPaymentSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload?.data || action.payload;
      })
      .addCase(fetchPaymentSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Revert Loan Payment
      .addCase(revertLoanPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(revertLoanPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const revertedId = action.meta.arg;
        state.loanPayments = state.loanPayments.filter((p) => p.id !== revertedId);
      })
      .addCase(revertLoanPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearReceiptData,
  clearLoanPayments,
} = loanPaymentSlice.actions;

export default loanPaymentSlice.reducer;
