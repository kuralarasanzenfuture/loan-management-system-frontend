import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  recordPayment,
  previewPaymentAllocation,
  getAllPayments,
  getPaymentSummary,
  getPaymentById,
  getLoanPayments,
  reversePayment,
} from "./interestLoanPayment.service.js";

const DEFAULT_PAGINATION = {
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
};

const extractPaymentsPayload = (payload) => {
  if (!payload) {
    return { payments: [], pagination: DEFAULT_PAGINATION, item: null };
  }

  const layer = payload.data !== undefined ? payload.data : payload;

  if (Array.isArray(layer)) {
    return {
      payments: layer,
      pagination: payload.pagination || {
        ...DEFAULT_PAGINATION,
        total: layer.length,
        limit: layer.length || 10,
        pages: 1,
      },
      item: null,
    };
  }

  if (layer && typeof layer === "object") {
    if (Array.isArray(layer.payments)) {
      return {
        payments: layer.payments,
        pagination: layer.pagination || payload.pagination || DEFAULT_PAGINATION,
        item: null,
      };
    }

    if (layer.payment && typeof layer.payment === "object") {
      return {
        payments: [layer.payment],
        pagination: layer.pagination || payload.pagination || DEFAULT_PAGINATION,
        item: layer.payment,
      };
    }

    if (layer.id != null || layer.payment_amount != null) {
      return {
        payments: [layer],
        pagination: layer.pagination || payload.pagination || DEFAULT_PAGINATION,
        item: layer,
      };
    }
  }

  if (Array.isArray(payload.payments)) {
    return {
      payments: payload.payments,
      pagination: payload.pagination || DEFAULT_PAGINATION,
      item: null,
    };
  }

  return { payments: [], pagination: DEFAULT_PAGINATION, item: null };
};

// =========================================================
// ASYNC THUNKS
// =========================================================

// Fetch all payments with filters and pagination
export const fetchPayments = createAsyncThunk(
  "interestLoanPayments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await getAllPayments(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch summary metrics
export const fetchPaymentSummary = createAsyncThunk(
  "interestLoanPayments/fetchSummary",
  async (params, { rejectWithValue }) => {
    try {
      return await getPaymentSummary(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single payment receipt
export const fetchPaymentById = createAsyncThunk(
  "interestLoanPayments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getPaymentById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch payments for a specific loan
export const fetchPaymentsByLoan = createAsyncThunk(
  "interestLoanPayments/fetchByLoan",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getLoanPayments(loanId);
    } catch (error) {
      try {
        return await getAllPayments({ loan_id: loanId, limit: 200 });
      } catch {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Preview payment allocation
export const previewAllocation = createAsyncThunk(
  "interestLoanPayments/previewAllocation",
  async (data, { rejectWithValue }) => {
    try {
      return await previewPaymentAllocation(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Record new payment
export const createPayment = createAsyncThunk(
  "interestLoanPayments/create",
  async (data, { rejectWithValue }) => {
    try {
      return await recordPayment(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reverse / void payment
export const reversePaymentThunk = createAsyncThunk(
  "interestLoanPayments/reverse",
  async (id, { rejectWithValue }) => {
    try {
      const response = await reversePayment(id);
      return { id, data: response?.data, message: response?.message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =========================================================
// INITIAL STATE
// =========================================================
const initialState = {
  payments: [],
  loanPayments: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  summary: null,
  selectedPayment: null,
  previewData: null,

  loading: false,
  loanPaymentsLoading: false,
  summaryLoading: false,
  previewLoading: false,
  submitting: false,
  reversing: false,

  error: null,
  previewError: null,
  submitError: null,
};

// =========================================================
// SLICE DEFINITION
// =========================================================
const interestLoanPaymentSlice = createSlice({
  name: "interestLoanPayments",
  initialState,
  reducers: {
    clearPreview: (state) => {
      state.previewData = null;
      state.previewError = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    clearPaymentErrors: (state) => {
      state.error = null;
      state.previewError = null;
      state.submitError = null;
    },
    clearLoanPayments: (state) => {
      state.loanPayments = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        const parsed = extractPaymentsPayload(action.payload);
        state.payments = parsed.payments;
        state.pagination = parsed.pagination;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payments";
      });

    // Fetch summary
    builder
      .addCase(fetchPaymentSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload?.data ?? action.payload;
      })
      .addCase(fetchPaymentSummary.rejected, (state) => {
        state.summaryLoading = false;
      });

    // Fetch single payment
    builder
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        const parsed = extractPaymentsPayload(action.payload);
        state.selectedPayment = parsed.item || parsed.payments[0] || null;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payment details";
      });

    // Fetch loan payments
    builder
      .addCase(fetchPaymentsByLoan.pending, (state) => {
        state.loanPaymentsLoading = true;
      })
      .addCase(fetchPaymentsByLoan.fulfilled, (state, action) => {
        state.loanPaymentsLoading = false;
        state.loanPayments = extractPaymentsPayload(action.payload).payments;
      })
      .addCase(fetchPaymentsByLoan.rejected, (state) => {
        state.loanPaymentsLoading = false;
        state.loanPayments = [];
      });

    // Preview allocation
    builder
      .addCase(previewAllocation.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
      })
      .addCase(previewAllocation.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewData = action.payload?.data ?? action.payload;
      })
      .addCase(previewAllocation.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload || "Failed to preview allocation";
      });

    // Create payment
    builder
      .addCase(createPayment.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.submitting = false;
        state.previewData = null;
        const created =
          extractPaymentsPayload(action.payload).item ||
          action.payload?.data ||
          action.payload;
        if (created && typeof created === "object" && !Array.isArray(created)) {
          state.payments = [created, ...state.payments];
          state.loanPayments = [created, ...state.loanPayments];
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload || "Failed to record payment";
      });

    // Reverse payment
    builder
      .addCase(reversePaymentThunk.pending, (state) => {
        state.reversing = true;
      })
      .addCase(reversePaymentThunk.fulfilled, (state, action) => {
        state.reversing = false;
        const reversedId = action.payload.id;
        state.payments = state.payments.filter((p) => p.id !== reversedId);
        state.loanPayments = state.loanPayments.filter((p) => p.id !== reversedId);
        if (state.selectedPayment?.id === reversedId) {
          state.selectedPayment = null;
        }
      })
      .addCase(reversePaymentThunk.rejected, (state, action) => {
        state.reversing = false;
        state.error = action.payload || "Failed to reverse payment";
      });
  },
});

export const {
  clearPreview,
  clearSelectedPayment,
  clearPaymentErrors,
  clearLoanPayments,
} = interestLoanPaymentSlice.actions;

export default interestLoanPaymentSlice.reducer;
