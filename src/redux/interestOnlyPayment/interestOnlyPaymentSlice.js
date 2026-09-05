import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createPayment,
  getPaymentsByLoan,
  getPaymentById,
  deletePayment,
  getInterestCollectionReports,
} from "./interestOnlyPayment.service.js";

/* =========================================================
   GET INTEREST COLLECTION REPORTS
========================================================= */

export const fetchInterestCollectionReports = createAsyncThunk(
  "interestOnlyPayments/fetchInterestCollectionReports",
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await getInterestCollectionReports(filters);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest collection reports",
      );
    }
  },
);


/* =========================================================
   GET PAYMENTS BY LOAN
========================================================= */

export const fetchInterestOnlyPayments = createAsyncThunk(
  "interestOnlyPayments/fetchInterestOnlyPayments",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getPaymentsByLoan(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch payments",
      );
    }
  },
);

/* =========================================================
   GET PAYMENT BY ID
========================================================= */

export const fetchInterestOnlyPaymentById = createAsyncThunk(
  "interestOnlyPayments/fetchInterestOnlyPaymentById",
  async (id, { rejectWithValue }) => {
    try {
      return await getPaymentById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch payment",
      );
    }
  },
);

/* =========================================================
   CREATE PAYMENT
========================================================= */

export const addInterestOnlyPayment = createAsyncThunk(
  "interestOnlyPayments/addInterestOnlyPayment",
  async (formData, { rejectWithValue }) => {
    try {
      return await createPayment(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create payment",
      );
    }
  },
);

/* =========================================================
   DELETE / REVERSE PAYMENT
========================================================= */

export const removeInterestOnlyPayment = createAsyncThunk(
  "interestOnlyPayments/removeInterestOnlyPayment",
  async (id, { rejectWithValue }) => {
    try {
      await deletePayment(id);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to reverse payment",
      );
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const interestOnlyPaymentSlice = createSlice({
  name: "interestOnlyPayments",

  initialState: {
    // All payments for selected loan
    payments: [],

    // Selected payment
    payment: null,

    // Current loan
    loanId: null,

    loading: false,
    error: null,

    // Interest collection reports
    collectionReports: [],
    collectionReportsSummary: null,
    collectionReportsLoading: false,
    collectionReportsError: null,
  },

  reducers: {
    /* -----------------------------------------------------
       CLEAR INTEREST COLLECTION REPORTS
    ----------------------------------------------------- */

    clearInterestCollectionReports: (state) => {
      state.collectionReports = [];
      state.collectionReportsSummary = null;
      state.collectionReportsError = null;
    },

    /* -----------------------------------------------------
       CLEAR ERROR
    ----------------------------------------------------- */

    clearInterestOnlyPaymentError: (state) => {
      state.error = null;
    },

    /* -----------------------------------------------------
       CLEAR SELECTED PAYMENT
    ----------------------------------------------------- */

    clearSelectedInterestOnlyPayment: (state) => {
      state.payment = null;
    },

    /* -----------------------------------------------------
       CLEAR PAYMENTS
    ----------------------------------------------------- */

    clearInterestOnlyPayments: (state) => {
      state.payments = [];
      state.payment = null;
      state.loanId = null;
    },

    /* -----------------------------------------------------
       SET LOAN ID
    ----------------------------------------------------- */

    setInterestOnlyPaymentLoanId: (state, action) => {
      state.loanId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         GET PAYMENTS BY LOAN
      ===================================================== */

      .addCase(fetchInterestOnlyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyPayments.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        /*
         * Supports:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         *
         * OR
         *
         * {
         *   success: true,
         *   data: {
         *      payments: [...]
         *   }
         * }
         */

        const data = payload?.data ?? payload?.payments ?? payload;

        if (Array.isArray(data)) {
          state.payments = data;
        } else if (Array.isArray(data?.payments)) {
          state.payments = data.payments;
        } else {
          state.payments = [];
        }

        const inner = payload?.data ?? payload;

        state.loanId = inner?.loan_id ?? inner?.loanId ?? state.loanId;
      })

      .addCase(fetchInterestOnlyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         GET PAYMENT BY ID
      ===================================================== */

      .addCase(fetchInterestOnlyPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyPaymentById.fulfilled, (state, action) => {
        state.loading = false;

        state.payment =
          action.payload?.data ?? action.payload?.payment ?? action.payload;
      })

      .addCase(fetchInterestOnlyPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         CREATE PAYMENT
      ===================================================== */

      .addCase(addInterestOnlyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addInterestOnlyPayment.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        /*
         * Supports:
         *
         * { data: payment }
         * { payment: payment }
         * payment
         */

        const created = payload?.payment ?? payload?.data ?? payload;

        if (created) {
          /*
           * If backend returns an array of allocated
           * payments/schedules instead of one payment,
           * don't push the entire response as a payment.
           */

          if (!Array.isArray(created)) {
            state.payments.unshift(created);
          }
        }
      })

      .addCase(addInterestOnlyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         DELETE / REVERSE PAYMENT
      ===================================================== */

      .addCase(removeInterestOnlyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeInterestOnlyPayment.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        state.payments = state.payments.filter((item) => item.id !== deletedId);

        if (state.payment?.id === deletedId) {
          state.payment = null;
        }
      })

      .addCase(removeInterestOnlyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         INTEREST COLLECTION REPORTS
      ===================================================== */

      .addCase(fetchInterestCollectionReports.pending, (state) => {
        state.collectionReportsLoading = true;
        state.collectionReportsError = null;
      })

      .addCase(fetchInterestCollectionReports.fulfilled, (state, action) => {
        state.collectionReportsLoading = false;
        const payload = action.payload;
        state.collectionReports = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        state.collectionReportsSummary = payload?.summary || null;
      })

      .addCase(fetchInterestCollectionReports.rejected, (state, action) => {
        state.collectionReportsLoading = false;
        state.collectionReportsError = action.payload;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearInterestOnlyPaymentError,
  clearSelectedInterestOnlyPayment,
  clearInterestOnlyPayments,
  setInterestOnlyPaymentLoanId,
  clearInterestCollectionReports,
} = interestOnlyPaymentSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default interestOnlyPaymentSlice.reducer;

