import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createInterestLoan,
  getAllInterestLoans,
  getInterestLoanSummary,
  getInterestLoanById,
  getInterestLoansByCustomer,
  updateInterestLoan,
  deleteInterestLoan,
} from "./interestLoan.service.js";

// =========================================================
// ASYNC THUNKS
// =========================================================

export const fetchInterestLoanSummary = createAsyncThunk(
  "interestLoans/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await getInterestLoanSummary();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest loan summary",
      );
    }
  },
);

export const fetchInterestLoans = createAsyncThunk(
  "interestLoans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllInterestLoans(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest loans",
      );
    }
  },
);

export const fetchInterestLoanById = createAsyncThunk(
  "interestLoans/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInterestLoanById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest loan details",
      );
    }
  },
);

export const fetchInterestLoansByCustomer = createAsyncThunk(
  "interestLoans/fetchByCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      return await getInterestLoansByCustomer(customerId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch customer interest loans",
      );
    }
  },
);

export const addInterestLoan = createAsyncThunk(
  "interestLoans/addLoan",
  async (formData, { rejectWithValue }) => {
    try {
      return await createInterestLoan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create interest loan",
      );
    }
  },
);

export const editInterestLoan = createAsyncThunk(
  "interestLoans/editLoan",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateInterestLoan(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update interest loan",
      );
    }
  },
);

export const removeInterestLoan = createAsyncThunk(
  "interestLoans/removeLoan",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteInterestLoan(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete interest loan",
      );
    }
  },
);


// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  loans: [],
  loan: null,
  summary: {
    total_loans: 0,
    active_loans: 0,
    completed_loans: 0,
    closed_loans: 0,
    cancelled_loans: 0,
    total_principal_disbursed: "0.00",
    total_outstanding_principal: "0.00",
    total_principal_paid: "0.00",
    total_interest_accrued: "0.00",
    total_interest_paid: "0.00",
    total_outstanding_interest: "0.00",
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  summaryLoading: false,
  saving: false,
  error: null,
};

// =========================================================
// SLICE
// =========================================================

const interestLoanSlice = createSlice({
  name: "interestLoans",
  initialState,
  reducers: {
    clearSelectedInterestLoan: (state) => {
      state.loan = null;
    },
    clearInterestLoanError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchInterestLoanSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchInterestLoanSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload.data || state.summary;
      })
      .addCase(fetchInterestLoanSummary.rejected, (state) => {
        state.summaryLoading = false;
      })

      // Fetch All
      .addCase(fetchInterestLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterestLoans.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload.data;
        if (payloadData && payloadData.loans && payloadData.pagination) {
          state.loans = payloadData.loans;
          state.pagination = payloadData.pagination;
        } else if (Array.isArray(payloadData)) {
          state.loans = payloadData;
          state.pagination = {
            total: payloadData.length,
            page: 1,
            limit: payloadData.length,
            totalPages: 1,
          };
        } else {
          state.loans = [];
        }
      })
      .addCase(fetchInterestLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchInterestLoanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterestLoanById.fulfilled, (state, action) => {
        state.loading = false;
        state.loan = action.payload.data;
      })
      .addCase(fetchInterestLoanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Loan
      .addCase(addInterestLoan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addInterestLoan.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload.data) {
          state.loans.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(addInterestLoan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Edit Loan
      .addCase(editInterestLoan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editInterestLoan.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload.data;
        if (updated) {
          state.loan = updated;
          const idx = state.loans.findIndex((l) => l.id === updated.id);
          if (idx !== -1) {
            state.loans[idx] = { ...state.loans[idx], ...updated };
          }
        }
      })
      .addCase(editInterestLoan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // Remove Loan
      .addCase(removeInterestLoan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeInterestLoan.fulfilled, (state, action) => {
        state.saving = false;
        const deletedId = action.meta?.arg || action.payload?.id;
        if (deletedId) {
          state.loans = state.loans.filter((l) => l.id !== Number(deletedId));
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
        if (state.loan?.id === Number(deletedId)) {
          state.loan = null;
        }
      })
      .addCase(removeInterestLoan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },

});

export const { clearSelectedInterestLoan, clearInterestLoanError } =
  interestLoanSlice.actions;

export default interestLoanSlice.reducer;
