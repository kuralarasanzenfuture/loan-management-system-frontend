import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getInstallmentsByLoan,
  getInstallmentById,
  updateInstallment,
} from "./installment.service.js";

// Get Installments By Loan
// API returns: { success, data: { loan, summary, installments[] } }
export const fetchInstallmentsByLoan = createAsyncThunk(
  "installments/fetchInstallmentsByLoan",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getInstallmentsByLoan(loanId);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Installment By ID
export const fetchInstallmentById = createAsyncThunk(
  "installments/fetchInstallmentById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInstallmentById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Update Installment / Payment
export const editInstallment = createAsyncThunk(
  "installments/editInstallment",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateInstallment(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

const installmentSlice = createSlice({
  name: "installments",

  initialState: {
    installments: [],
    loanMeta: null,      // loan info returned alongside installments
    summary: null,       // summary { total_due, total_paid, ... }
    installment: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearInstallmentError: (state) => {
      state.error = null;
    },
    clearSelectedInstallment: (state) => {
      state.installment = null;
    },
    clearInstallments: (state) => {
      state.installments = [];
      state.loanMeta = null;
      state.summary = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch Installments By Loan
      // Response shape: { success, data: { loan, summary, installments } }
      .addCase(fetchInstallmentsByLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstallmentsByLoan.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        // Handle both possible shapes:
        // { data: { loan, summary, installments } }  or  { installments }
        const inner = payload?.data ?? payload;

        if (Array.isArray(inner)) {
          state.installments = inner;
          state.loanMeta = null;
          state.summary = null;
        } else {
          state.installments = Array.isArray(inner?.installments)
            ? inner.installments
            : [];
          state.loanMeta = inner?.loan ?? null;
          state.summary = inner?.summary ?? null;
        }
      })
      .addCase(fetchInstallmentsByLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Installment By ID
      .addCase(fetchInstallmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInstallmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.installment = action.payload?.data ?? action.payload;
      })
      .addCase(fetchInstallmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Installment
      // Response shape: { success, message, installment: {...} }
      .addCase(editInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editInstallment.fulfilled, (state, action) => {
        state.loading = false;

        // Backend returns { message, installment }
        const payload = action.payload;
        const updated = payload?.installment ?? payload?.data ?? payload;

        if (updated?.id) {
          const index = state.installments.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.installments[index] = updated;
          }
          if (state.installment?.id === updated.id) {
            state.installment = updated;
          }
        }
      })
      .addCase(editInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInstallmentError, clearSelectedInstallment, clearInstallments } =
  installmentSlice.actions;

export default installmentSlice.reducer;
