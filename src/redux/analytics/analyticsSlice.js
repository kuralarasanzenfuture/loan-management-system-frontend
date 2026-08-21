import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboard } from "./analytics.service.js";

// =========================================================
// GET DASHBOARD
// =========================================================

export const fetchDashboard = createAsyncThunk(
  "analytics/fetchDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getDashboard(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const analyticsSlice = createSlice({
  name: "analytics",

  initialState: {
    dashboard: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },

    clearAnalytics: (state) => {
      state.dashboard = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH DASHBOARD
      // =====================================================

      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload?.data ?? action.payload;
      })

      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearAnalyticsError,
  clearAnalytics,
  clearDashboardError,
  clearDashboard,
} = analyticsSlice.actions;

// Backward-compatibility aliases
analyticsSlice.actions.clearDashboardError = analyticsSlice.actions.clearAnalyticsError;
analyticsSlice.actions.clearDashboard = analyticsSlice.actions.clearAnalytics;

// =========================================================
// REDUCER
// =========================================================

export default analyticsSlice.reducer;

