import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getDashboardOverview,
  getPortfolioTrends,
  getLoanPlanMix,
  getPortfolioHealth,
  getRecentLoans,
  getQuickInsights,
  getTopLoanOfficers,
} from "./dashboard.service.js";

// =========================================================
// DASHBOARD OVERVIEW
// =========================================================

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchDashboardOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getDashboardOverview(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard overview",
      );
    }
  },
);

// =========================================================
// PORTFOLIO TRENDS
// =========================================================

export const fetchPortfolioTrends = createAsyncThunk(
  "dashboard/fetchPortfolioTrends",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPortfolioTrends(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch portfolio trends",
      );
    }
  },
);

// =========================================================
// LOAN PLAN MIX
// =========================================================

export const fetchLoanPlanMix = createAsyncThunk(
  "dashboard/fetchLoanPlanMix",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getLoanPlanMix(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch loan plan mix",
      );
    }
  },
);

// =========================================================
// PORTFOLIO HEALTH
// =========================================================

export const fetchPortfolioHealth = createAsyncThunk(
  "dashboard/fetchPortfolioHealth",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPortfolioHealth(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch portfolio health",
      );
    }
  },
);

// =========================================================
// RECENT LOANS
// =========================================================

export const fetchRecentLoans = createAsyncThunk(
  "dashboard/fetchRecentLoans",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getRecentLoans(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch recent loans",
      );
    }
  },
);

// =========================================================
// QUICK INSIGHTS
// =========================================================

export const fetchQuickInsights = createAsyncThunk(
  "dashboard/fetchQuickInsights",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getQuickInsights(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch quick insights",
      );
    }
  },
);

// =========================================================
// TOP LOAN OFFICERS
// =========================================================

export const fetchTopLoanOfficers = createAsyncThunk(
  "dashboard/fetchTopLoanOfficers",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getTopLoanOfficers(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch top loan officers",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState: {
    overview: null,
    portfolioTrends: { portfolio: [], collections: [], overdue: [] },
    loanPlanMix: [],
    portfolioHealth: null,
    recentLoans: [],
    quickInsights: null,
    topLoanOfficers: [],

    loading: false,
    error: null,
  },

  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },

    clearDashboard: (state) => {
      state.overview = null;
      state.portfolioTrends = { portfolio: [], collections: [], overdue: [] };
      state.loanPlanMix = [];
      state.portfolioHealth = null;
      state.recentLoans = [];
      state.quickInsights = null;
      state.topLoanOfficers = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // DASHBOARD OVERVIEW
      // =====================================================

      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;

        state.overview = action.payload?.data ?? action.payload;
      })

      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // PORTFOLIO TRENDS
      // =====================================================

      .addCase(fetchPortfolioTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPortfolioTrends.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.portfolioTrends = data && typeof data === "object" && !Array.isArray(data)
          ? {
              portfolio: Array.isArray(data.portfolio) ? data.portfolio : [],
              collections: Array.isArray(data.collections) ? data.collections : [],
              overdue: Array.isArray(data.overdue) ? data.overdue : [],
            }
          : { portfolio: [], collections: [], overdue: [] };
      })

      .addCase(fetchPortfolioTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // LOAN PLAN MIX
      // =====================================================

      .addCase(fetchLoanPlanMix.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLoanPlanMix.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.loanPlanMix = Array.isArray(data) ? data : [];
      })

      .addCase(fetchLoanPlanMix.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // PORTFOLIO HEALTH
      // =====================================================

      .addCase(fetchPortfolioHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPortfolioHealth.fulfilled, (state, action) => {
        state.loading = false;

        state.portfolioHealth = action.payload?.data ?? action.payload;
      })

      .addCase(fetchPortfolioHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // RECENT LOANS
      // =====================================================

      .addCase(fetchRecentLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchRecentLoans.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.recentLoans = Array.isArray(data) ? data : [];
      })

      .addCase(fetchRecentLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // QUICK INSIGHTS
      // =====================================================

      .addCase(fetchQuickInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchQuickInsights.fulfilled, (state, action) => {
        state.loading = false;

        state.quickInsights = action.payload?.data ?? action.payload;
      })

      .addCase(fetchQuickInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // TOP LOAN OFFICERS
      // =====================================================

      .addCase(fetchTopLoanOfficers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTopLoanOfficers.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.topLoanOfficers = Array.isArray(data) ? data : [];
      })

      .addCase(fetchTopLoanOfficers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const { clearDashboardError, clearDashboard } = dashboardSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default dashboardSlice.reducer;
