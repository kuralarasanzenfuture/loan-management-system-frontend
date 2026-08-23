import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getLoanReports,
  getLoanInstallmentsReport,
  getCustomerLoanSummary,
} from "./loanReports.service.js";

// =====================================================
// Customer Loan Reports
// =====================================================

export const fetchLoanReports = createAsyncThunk(
  "loanReports/fetchLoanReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getLoanReports(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch loan reports");
    }
  },
);

// =====================================================
// Loan Installment Reports
// =====================================================

export const fetchLoanInstallmentsReport = createAsyncThunk(
  "loanReports/fetchLoanInstallmentsReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getLoanInstallmentsReport(params);
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to fetch installment reports",
      );
    }
  },
);

// =====================================================
// Customer Loan Summary
// =====================================================

export const fetchCustomerLoanSummary = createAsyncThunk(
  "loanReports/fetchCustomerLoanSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCustomerLoanSummary(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch loan summary");
    }
  },
);

const initialState = {
  loanReportsSummary: null,
  loanReportsCharts: null,
  loanReportsLoading: false,
  loanReportsError: null,

  installmentReports: [],
  installmentReportsCount: 0,
  installmentReportsMeta: null,
  installmentReportsLoading: false,
  installmentReportsError: null,

  customerSummaries: [],
  customerSummaryCount: 0,
  customerSummaryTotals: null,
  customerSummaryLoading: false,
  customerSummaryError: null,
};

const loanReportsSlice = createSlice({
  name: "loanReports",

  initialState,

  reducers: {
    clearLoanReportsError: (state) => {
      state.loanReportsError = null;
    },

    clearInstallmentReportsError: (state) => {
      state.installmentReportsError = null;
    },

    clearSummaryError: (state) => {
      state.customerSummaryError = null;
    },

    clearLoanReports: (state) => {
      state.loanReportsSummary = null;
      state.loanReportsCharts = null;
    },

    clearInstallmentReports: (state) => {
      state.installmentReports = [];
      state.installmentReportsCount = 0;
      state.installmentReportsMeta = null;
    },

    clearSummary: (state) => {
      state.customerSummaries = [];
      state.customerSummaryCount = 0;
      state.customerSummaryTotals = null;
      state.customerSummaryError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // LOAN REPORTS
      // =================================================

      .addCase(fetchLoanReports.pending, (state) => {
        state.loanReportsLoading = true;
        state.loanReportsError = null;
      })

      .addCase(fetchLoanReports.fulfilled, (state, action) => {
        state.loanReportsLoading = false;

        const response = action.payload;

        state.loanReportsSummary = response?.summary || null;
        state.loanReportsCharts = response?.charts || null;
      })

      .addCase(fetchLoanReports.rejected, (state, action) => {
        state.loanReportsLoading = false;
        state.loanReportsError =
          action.payload || "Failed to fetch loan reports";
      })

      // =================================================
      // INSTALLMENT REPORTS
      // =================================================

      .addCase(fetchLoanInstallmentsReport.pending, (state) => {
        state.installmentReportsLoading = true;
        state.installmentReportsError = null;
      })

      .addCase(fetchLoanInstallmentsReport.fulfilled, (state, action) => {
        state.installmentReportsLoading = false;

        const response = action.payload;

        state.installmentReports = response?.data || response || [];
        state.installmentReportsCount = response?.count ?? (response?.data?.length || 0);
        state.installmentReportsMeta = response?.meta || null;
      })

      .addCase(fetchLoanInstallmentsReport.rejected, (state, action) => {
        state.installmentReportsLoading = false;

        state.installmentReportsError =
          action.payload || "Failed to fetch installment reports";
      })

      // =================================================
      // CUSTOMER LOAN SUMMARY
      // =================================================

      .addCase(fetchCustomerLoanSummary.pending, (state) => {
        state.customerSummaryLoading = true;
        state.customerSummaryError = null;
      })

      .addCase(fetchCustomerLoanSummary.fulfilled, (state, action) => {
        state.customerSummaryLoading = false;

        const response = action.payload;

        // Support both nested object { data: { data: [...], summary: {...} } } and flat array
        const rawList = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];

        state.customerSummaries = rawList.map((item) => ({
          ...item,
          id: item.id || item.customer_id,
          total_loan: item.total_loan ?? item.total_amount ?? 0,
        }));

        state.customerSummaryCount =
          response?.count ??
          (response?.data?.summary?.total_customers ?? state.customerSummaries.length);

        state.customerSummaryTotals =
          response?.data?.summary || response?.summary || null;
      })

      .addCase(fetchCustomerLoanSummary.rejected, (state, action) => {
        state.customerSummaryLoading = false;
        state.customerSummaryError = action.payload || "Failed to fetch loan summary";
      });
  },
});

export const {
  clearLoanReportsError,
  clearInstallmentReportsError,
  clearSummaryError,
  clearLoanReports,
  clearInstallmentReports,
  clearSummary,
} = loanReportsSlice.actions;

export default loanReportsSlice.reducer;
