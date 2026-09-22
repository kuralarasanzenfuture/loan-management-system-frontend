import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getReportOverview,
  getLoansReport,
  getCollectionsReport,
  getPaymentsReport,
} from "./interestLoanReport.service.js";

// =========================================================
// ASYNC THUNKS
// =========================================================

export const fetchInterestLoanReportOverview = createAsyncThunk(
  "interestLoanReports/fetchOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getReportOverview(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch reports overview");
    }
  }
);

export const fetchInterestLoanLoansReport = createAsyncThunk(
  "interestLoanReports/fetchLoansReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getLoansReport(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch loans report");
    }
  }
);

export const fetchInterestLoanCollectionsReport = createAsyncThunk(
  "interestLoanReports/fetchCollectionsReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCollectionsReport(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch collections report");
    }
  }
);

export const fetchInterestLoanPaymentsReport = createAsyncThunk(
  "interestLoanReports/fetchPaymentsReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPaymentsReport(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch payments report");
    }
  }
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  // 1. Overview & Analytics
  overview: null,
  overviewLoading: false,
  overviewError: null,

  // 2. Loans Portfolio Report
  loansReport: {
    data: [],
    pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
  },
  loansLoading: false,
  loansError: null,

  // 3. Collections Ledger Report
  collectionsReport: {
    today: [],
    overdue: [],
    todaySummary: {},
    overdueSummary: {},
  },
  collectionsLoading: false,
  collectionsError: null,

  // 4. Payments Ledger Report
  paymentsReport: {
    data: [],
    pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
  },
  paymentsLoading: false,
  paymentsError: null,

  // Active subtab: 'overview' | 'loans' | 'collections' | 'payments'
  activeSubTab: "overview",

  // Global filters
  filters: {
    from_date: "",
    to_date: "",
    status: "",
    interest_frequency: "",
    payment_mode: "",
    search: "",
  },
};

// =========================================================
// SLICE
// =========================================================

const interestLoanReportSlice = createSlice({
  name: "interestLoanReports",
  initialState,
  reducers: {
    setActiveSubTab: (state, action) => {
      state.activeSubTab = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        from_date: "",
        to_date: "",
        status: "",
        interest_frequency: "",
        payment_mode: "",
        search: "",
      };
    },
    clearReportsError: (state) => {
      state.overviewError = null;
      state.loansError = null;
      state.collectionsError = null;
      state.paymentsError = null;
    },
  },
  extraReducers: (builder) => {
    // Overview
    builder
      .addCase(fetchInterestLoanReportOverview.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(fetchInterestLoanReportOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchInterestLoanReportOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload;
      });

    // Loans Report
    builder
      .addCase(fetchInterestLoanLoansReport.pending, (state) => {
        state.loansLoading = true;
        state.loansError = null;
      })
      .addCase(fetchInterestLoanLoansReport.fulfilled, (state, action) => {
        state.loansLoading = false;
        const res = action.payload.data || action.payload;
        state.loansReport = {
          data: Array.isArray(res) ? res : res?.loans || [],
          pagination: action.payload.pagination || state.loansReport.pagination,
        };
      })
      .addCase(fetchInterestLoanLoansReport.rejected, (state, action) => {
        state.loansLoading = false;
        state.loansError = action.payload;
      });

    // Collections Report
    builder
      .addCase(fetchInterestLoanCollectionsReport.pending, (state) => {
        state.collectionsLoading = true;
        state.collectionsError = null;
      })
      .addCase(fetchInterestLoanCollectionsReport.fulfilled, (state, action) => {
        state.collectionsLoading = false;
        const data = action.payload.data || {};
        state.collectionsReport = {
          today: data.today_collections || [],
          overdue: data.overdue_collections || [],
          todaySummary: data.today_summary || {},
          overdueSummary: data.overdue_summary || {},
        };
      })
      .addCase(fetchInterestLoanCollectionsReport.rejected, (state, action) => {
        state.collectionsLoading = false;
        state.collectionsError = action.payload;
      });

    // Payments Report
    builder
      .addCase(fetchInterestLoanPaymentsReport.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchInterestLoanPaymentsReport.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        const res = action.payload.data || action.payload;
        state.paymentsReport = {
          data: Array.isArray(res) ? res : res?.payments || [],
          pagination: action.payload.pagination || state.paymentsReport.pagination,
        };
      })
      .addCase(fetchInterestLoanPaymentsReport.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload;
      });
  },
});

export const {
  setActiveSubTab,
  setFilters,
  resetFilters,
  clearReportsError,
} = interestLoanReportSlice.actions;

export default interestLoanReportSlice.reducer;
