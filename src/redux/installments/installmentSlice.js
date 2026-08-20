import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getInstallmentsByLoan,
  getInstallmentById,
  updateInstallment,
  payInstallment,
  applyPenalty,
  regenerateInstallments,
  getCurrentDue,
  getOverdueInstallments,
  getLoanSummary,
  calculatePenalty,
} from "./installment.service.js";

// =========================================================
// GET ALL INSTALLMENTS BY LOAN
// =========================================================

export const fetchInstallmentsByLoan = createAsyncThunk(
  "installments/fetchInstallmentsByLoan",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getInstallmentsByLoan(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch installments",
      );
    }
  },
);

// =========================================================
// GET INSTALLMENT BY ID
// =========================================================

export const fetchInstallmentById = createAsyncThunk(
  "installments/fetchInstallmentById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInstallmentById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch installment",
      );
    }
  },
);

// =========================================================
// UPDATE INSTALLMENT
// =========================================================

export const editInstallment = createAsyncThunk(
  "installments/editInstallment",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateInstallment(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update installment",
      );
    }
  },
);

// =========================================================
// PAY INSTALLMENT
// =========================================================

export const payInstallmentAction = createAsyncThunk(
  "installments/payInstallment",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await payInstallment(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to pay installment",
      );
    }
  },
);

// =========================================================
// APPLY PENALTY
// =========================================================

export const applyPenaltyAction = createAsyncThunk(
  "installments/applyPenalty",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await applyPenalty(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to apply penalty",
      );
    }
  },
);

// =========================================================
// REGENERATE INSTALLMENTS
// =========================================================

export const regenerateInstallmentsAction = createAsyncThunk(
  "installments/regenerateInstallments",
  async ({ loanId, formData }, { rejectWithValue }) => {
    try {
      return await regenerateInstallments(loanId, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to regenerate installments",
      );
    }
  },
);

// =========================================================
// GET CURRENT DUE
// =========================================================

export const fetchCurrentDue = createAsyncThunk(
  "installments/fetchCurrentDue",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getCurrentDue(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch current due",
      );
    }
  },
);

// =========================================================
// GET OVERDUE INSTALLMENTS
// =========================================================

export const fetchOverdueInstallments = createAsyncThunk(
  "installments/fetchOverdueInstallments",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getOverdueInstallments(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch overdue installments",
      );
    }
  },
);

// =========================================================
// GET LOAN SUMMARY
// =========================================================

export const fetchLoanSummary = createAsyncThunk(
  "installments/fetchLoanSummary",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getLoanSummary(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch loan summary",
      );
    }
  },
);

// =========================================================
// CALCULATE PENALTY
// =========================================================

export const fetchPenalty = createAsyncThunk(
  "installments/fetchPenalty",
  async (id, { rejectWithValue }) => {
    try {
      return await calculatePenalty(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to calculate penalty",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const installmentSlice = createSlice({
  name: "installments",

  initialState: {
    // Main installment list
    installments: [],

    // Single installment
    installment: null,

    // Loan information
    loanMeta: null,

    // Loan summary
    summary: null,

    // Current due
    currentDue: null,

    // Overdue installments
    overdueInstallments: [],

    // Calculated penalty
    penalty: null,

    // Result from pay installment
    paymentResult: null,

    // Result from apply penalty
    penaltyResult: null,

    // Result from regenerate
    regenerateResult: null,

    loading: false,
    error: null,
  },

  reducers: {
    // =====================================================
    // CLEAR ERROR
    // =====================================================

    clearInstallmentError: (state) => {
      state.error = null;
    },

    // =====================================================
    // CLEAR SELECTED INSTALLMENT
    // =====================================================

    clearSelectedInstallment: (state) => {
      state.installment = null;
    },

    // =====================================================
    // CLEAR INSTALLMENTS
    // =====================================================

    clearInstallments: (state) => {
      state.installments = [];
      state.loanMeta = null;
      state.summary = null;
      state.currentDue = null;
      state.overdueInstallments = [];
      state.penalty = null;
    },

    // =====================================================
    // CLEAR PAYMENT RESULT
    // =====================================================

    clearPaymentResult: (state) => {
      state.paymentResult = null;
    },

    // =====================================================
    // CLEAR PENALTY
    // =====================================================

    clearPenalty: (state) => {
      state.penalty = null;
      state.penaltyResult = null;
    },

    // =====================================================
    // CLEAR REGENERATE RESULT
    // =====================================================

    clearRegenerateResult: (state) => {
      state.regenerateResult = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH INSTALLMENTS BY LOAN
      // =====================================================

      .addCase(fetchInstallmentsByLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInstallmentsByLoan.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        /*
          Possible backend response:

          {
            success: true,
            data: {
              loan: {},
              summary: {},
              installments: []
            }
          }
        */

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
        state.installments = [];
      })

      // =====================================================
      // FETCH INSTALLMENT BY ID
      // =====================================================

      .addCase(fetchInstallmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInstallmentById.fulfilled, (state, action) => {
        state.loading = false;

        state.installment = action.payload?.data ?? action.payload;
      })

      .addCase(fetchInstallmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE INSTALLMENT
      // =====================================================

      .addCase(editInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editInstallment.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        const updated = payload?.installment ?? payload?.data ?? payload;

        if (!updated?.id) {
          return;
        }

        const index = state.installments.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.installments[index] = updated;
        }

        if (state.installment?.id === updated.id) {
          state.installment = updated;
        }
      })

      .addCase(editInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // PAY INSTALLMENT
      // =====================================================

      .addCase(payInstallmentAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentResult = null;
      })

      .addCase(payInstallmentAction.fulfilled, (state, action) => {
        state.loading = false;

        state.paymentResult = action.payload?.data ?? action.payload;

        const payload = action.payload;

        const updated = payload?.installment ?? payload?.data?.installment;

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

      .addCase(payInstallmentAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // APPLY PENALTY
      // =====================================================

      .addCase(applyPenaltyAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.penaltyResult = null;
      })

      .addCase(applyPenaltyAction.fulfilled, (state, action) => {
        state.loading = false;

        state.penaltyResult = action.payload?.data ?? action.payload;

        const payload = action.payload;

        const updated = payload?.installment ?? payload?.data?.installment;

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

      .addCase(applyPenaltyAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // REGENERATE INSTALLMENTS
      // =====================================================

      .addCase(regenerateInstallmentsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.regenerateResult = null;
      })

      .addCase(regenerateInstallmentsAction.fulfilled, (state, action) => {
        state.loading = false;

        state.regenerateResult = action.payload?.data ?? action.payload;

        /*
         * If backend returns regenerated installments,
         * replace the current list.
         */

        const result = action.payload?.data ?? action.payload;

        if (Array.isArray(result)) {
          state.installments = result;
        } else if (Array.isArray(result?.installments)) {
          state.installments = result.installments;
        }
      })

      .addCase(regenerateInstallmentsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CURRENT DUE
      // =====================================================

      .addCase(fetchCurrentDue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCurrentDue.fulfilled, (state, action) => {
        state.loading = false;

        state.currentDue = action.payload?.data ?? action.payload;
      })

      .addCase(fetchCurrentDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // OVERDUE INSTALLMENTS
      // =====================================================

      .addCase(fetchOverdueInstallments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchOverdueInstallments.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        /*
         * Support:
         * { data: [] }
         * { data: { installments: [] } }
         */

        if (Array.isArray(data)) {
          state.overdueInstallments = data;
        } else {
          state.overdueInstallments = Array.isArray(data?.installments)
            ? data.installments
            : [];
        }
      })

      .addCase(fetchOverdueInstallments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.overdueInstallments = [];
      })

      // =====================================================
      // LOAN SUMMARY
      // =====================================================

      .addCase(fetchLoanSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLoanSummary.fulfilled, (state, action) => {
        state.loading = false;

        state.summary = action.payload?.data ?? action.payload;
      })

      .addCase(fetchLoanSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CALCULATE PENALTY
      // =====================================================

      .addCase(fetchPenalty.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.penalty = null;
      })

      .addCase(fetchPenalty.fulfilled, (state, action) => {
        state.loading = false;

        state.penalty = action.payload?.data ?? action.payload;
      })

      .addCase(fetchPenalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearInstallmentError,
  clearSelectedInstallment,
  clearInstallments,
  clearPaymentResult,
  clearPenalty,
  clearRegenerateResult,
} = installmentSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default installmentSlice.reducer;
