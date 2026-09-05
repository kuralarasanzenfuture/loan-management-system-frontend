import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createInterestOnlyLoan,
  getInterestOnlyLoans,
  getInterestOnlyLoanById,
  getInterestOnlyLoansByCustomer,
  updateInterestOnlyLoanStatus,
  deleteInterestOnlyLoan,
  regenerateInterestOnlyLoanSchedule,
} from "./interestLoan.service.js";

/* =========================================================
   GET ALL INTEREST ONLY LOANS
========================================================= */

export const fetchInterestOnlyLoans = createAsyncThunk(
  "interestOnlyLoans/fetchInterestOnlyLoans",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getInterestOnlyLoans(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest only loans",
      );
    }
  },
);

/* =========================================================
   GET INTEREST ONLY LOAN BY ID
========================================================= */

export const fetchInterestOnlyLoanById = createAsyncThunk(
  "interestOnlyLoans/fetchInterestOnlyLoanById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInterestOnlyLoanById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest only loan",
      );
    }
  },
);

/* =========================================================
   GET LOANS BY CUSTOMER
========================================================= */

export const fetchInterestOnlyLoansByCustomer = createAsyncThunk(
  "interestOnlyLoans/fetchInterestOnlyLoansByCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      return await getInterestOnlyLoansByCustomer(customerId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch customer loans",
      );
    }
  },
);

/* =========================================================
   CREATE INTEREST ONLY LOAN
========================================================= */

export const addInterestOnlyLoan = createAsyncThunk(
  "interestOnlyLoans/addInterestOnlyLoan",
  async (formData, { rejectWithValue }) => {
    try {
      return await createInterestOnlyLoan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create interest only loan",
      );
    }
  },
);

/* =========================================================
   UPDATE LOAN STATUS
========================================================= */

export const editInterestOnlyLoanStatus = createAsyncThunk(
  "interestOnlyLoans/editInterestOnlyLoanStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateInterestOnlyLoanStatus(id, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update loan status",
      );
    }
  },
);

/* =========================================================
   DELETE INTEREST ONLY LOAN
========================================================= */

export const removeInterestOnlyLoan = createAsyncThunk(
  "interestOnlyLoans/removeInterestOnlyLoan",
  async (id, { rejectWithValue }) => {
    try {
      await deleteInterestOnlyLoan(id);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete interest only loan",
      );
    }
  },
);

/* =========================================================
   REGENERATE SCHEDULE
========================================================= */

export const regenerateLoanScheduleAction = createAsyncThunk(
  "interestOnlyLoans/regenerateLoanSchedule",
  async ({ id, data = {} }, { rejectWithValue }) => {
    try {
      return await regenerateInterestOnlyLoanSchedule(id, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to regenerate schedule",
      );
    }
  },
);


/* =========================================================
   SLICE
========================================================= */

const interestLoanSlice = createSlice({
  name: "interestOnlyLoans",

  initialState: {
    loans: [],
    loan: null,

    // Customer-specific loans
    customerLoans: [],

    // Useful when API returns schedules with loan
    schedules: [],

    // Store current filters
    filters: {},

    loading: false,
    error: null,
  },

  reducers: {
    /* -----------------------------------------------------
       CLEAR ERROR
    ----------------------------------------------------- */

    clearInterestOnlyLoanError: (state) => {
      state.error = null;
    },

    /* -----------------------------------------------------
       CLEAR SELECTED LOAN
    ----------------------------------------------------- */

    clearSelectedInterestOnlyLoan: (state) => {
      state.loan = null;
      state.schedules = [];
    },

    /* -----------------------------------------------------
       CLEAR CUSTOMER LOANS
    ----------------------------------------------------- */

    clearCustomerInterestOnlyLoans: (state) => {
      state.customerLoans = [];
    },

    /* -----------------------------------------------------
       CLEAR ALL LOANS
    ----------------------------------------------------- */

    clearInterestOnlyLoans: (state) => {
      state.loans = [];
      state.loan = null;
      state.customerLoans = [];
      state.schedules = [];
    },

    /* -----------------------------------------------------
       SET FILTERS
    ----------------------------------------------------- */

    setInterestOnlyLoanFilters: (state, action) => {
      state.filters = action.payload || {};
    },

    /* -----------------------------------------------------
       CLEAR FILTERS
    ----------------------------------------------------- */

    clearInterestOnlyLoanFilters: (state) => {
      state.filters = {};
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         GET ALL LOANS
      ===================================================== */

      .addCase(fetchInterestOnlyLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyLoans.fulfilled, (state, action) => {
        state.loading = false;

        const data =
          action.payload?.data ?? action.payload?.loans ?? action.payload;

        state.loans = Array.isArray(data) ? data : [];
      })

      .addCase(fetchInterestOnlyLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         GET LOAN BY ID
      ===================================================== */

      .addCase(fetchInterestOnlyLoanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyLoanById.fulfilled, (state, action) => {
        state.loading = false;

        const data =
          action.payload?.data ?? action.payload?.loan ?? action.payload;

        state.loan = data || null;

        /*
         * If backend returns:
         *
         * {
         *   data: {
         *     loan: {...},
         *     schedules: [...]
         *   }
         * }
         */

        const inner = action.payload?.data ?? action.payload;

        state.schedules = Array.isArray(inner?.schedules)
          ? inner.schedules
          : Array.isArray(inner?.repayment_schedules)
            ? inner.repayment_schedules
            : [];
      })

      .addCase(fetchInterestOnlyLoanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         GET LOANS BY CUSTOMER
      ===================================================== */

      .addCase(fetchInterestOnlyLoansByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyLoansByCustomer.fulfilled, (state, action) => {
        state.loading = false;

        const data =
          action.payload?.data ?? action.payload?.loans ?? action.payload;

        state.customerLoans = Array.isArray(data) ? data : [];
      })

      .addCase(fetchInterestOnlyLoansByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         CREATE LOAN
      ===================================================== */

      .addCase(addInterestOnlyLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addInterestOnlyLoan.fulfilled, (state, action) => {
        state.loading = false;

        const created =
          action.payload?.data ?? action.payload?.loan ?? action.payload;

        if (created) {
          state.loans.unshift(created);
        }
      })

      .addCase(addInterestOnlyLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         UPDATE STATUS
      ===================================================== */

      .addCase(editInterestOnlyLoanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editInterestOnlyLoanStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updated =
          action.payload?.data ?? action.payload?.loan ?? action.payload;

        if (!updated?.id) {
          return;
        }

        /* Update main list */

        const index = state.loans.findIndex((item) => item.id === updated.id);

        if (index !== -1) {
          state.loans[index] = {
            ...state.loans[index],
            ...updated,
          };
        }

        /* Update customer list */

        const customerIndex = state.customerLoans.findIndex(
          (item) => item.id === updated.id,
        );

        if (customerIndex !== -1) {
          state.customerLoans[customerIndex] = {
            ...state.customerLoans[customerIndex],
            ...updated,
          };
        }

        /* Update selected loan */

        if (state.loan?.id === updated.id) {
          state.loan = {
            ...state.loan,
            ...updated,
          };
        }
      })

      .addCase(editInterestOnlyLoanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         DELETE LOAN
      ===================================================== */

      .addCase(removeInterestOnlyLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeInterestOnlyLoan.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        state.loans = state.loans.filter((item) => item.id !== deletedId);

        state.customerLoans = state.customerLoans.filter(
          (item) => item.id !== deletedId,
        );

        if (state.loan?.id === deletedId) {
          state.loan = null;
          state.schedules = [];
        }
      })

      .addCase(removeInterestOnlyLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         REGENERATE SCHEDULE
      ===================================================== */

      .addCase(regenerateLoanScheduleAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(regenerateLoanScheduleAction.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data;
        if (updated && state.loan?.id === updated.id) {
          state.loan = {
            ...state.loan,
            ...updated,
          };
        }
      })

      .addCase(regenerateLoanScheduleAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearInterestOnlyLoanError,
  clearSelectedInterestOnlyLoan,
  clearCustomerInterestOnlyLoans,
  clearInterestOnlyLoans,
  setInterestOnlyLoanFilters,
  clearInterestOnlyLoanFilters,
} = interestLoanSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default interestLoanSlice.reducer;
