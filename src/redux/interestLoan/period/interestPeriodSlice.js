import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getPeriodsByLoanId,
  getPeriodById,
  syncDuePeriods,
  getTodayCollections,
  getOverdueCollections,
  getCollectionsOverview,
} from "./interestPeriod.service.js";

// =========================================================
// ASYNC THUNKS
// =========================================================

export const fetchPeriodsByLoanId = createAsyncThunk(
  "interestPeriods/fetchByLoanId",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getPeriodsByLoanId(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch periods schedule",
      );
    }
  },
);

export const fetchPeriodById = createAsyncThunk(
  "interestPeriods/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getPeriodById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch period details",
      );
    }
  },
);

export const triggerSyncDuePeriods = createAsyncThunk(
  "interestPeriods/syncDue",
  async (loanId = null, { rejectWithValue, dispatch }) => {
    try {
      const res = await syncDuePeriods(loanId);
      if (loanId) {
        dispatch(fetchPeriodsByLoanId(loanId));
      }
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to synchronize due periods",
      );
    }
  },
);

// Fetch Today's Collections
export const fetchTodayCollections = createAsyncThunk(
  "interestPeriods/fetchTodayCollections",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getTodayCollections(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch today's collections",
      );
    }
  },
);

// Fetch Overdue Collections
export const fetchOverdueCollections = createAsyncThunk(
  "interestPeriods/fetchOverdueCollections",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getOverdueCollections(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch overdue collections",
      );
    }
  },
);

// Fetch Unified Collections Overview
export const fetchCollectionsOverview = createAsyncThunk(
  "interestPeriods/fetchCollectionsOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCollectionsOverview(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch collections overview",
      );
    }
  },
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  periods: [],
  period: null,
  loading: false,
  syncing: false,
  error: null,

  // Collections state
  todayCollections: [],
  todaySummary: {
    total_records: 0,
    total_due_amount: 0,
    total_collected_amount: 0,
    total_outstanding_amount: 0,
  },
  todayLoading: false,

  overdueCollections: [],
  overdueSummary: {
    total_overdue_periods: 0,
    total_loans_overdue: 0,
    total_overdue_amount: 0,
    max_days_overdue: 0,
  },
  overdueLoading: false,

  collectionsOverview: null,
  overviewLoading: false,
  collectionError: null,
};

// =========================================================
// SLICE
// =========================================================

const interestPeriodSlice = createSlice({
  name: "interestPeriods",
  initialState,
  reducers: {
    clearPeriods: (state) => {
      state.periods = [];
      state.period = null;
    },
    clearPeriodError: (state) => {
      state.error = null;
      state.collectionError = null;
    },
    clearCollections: (state) => {
      state.todayCollections = [];
      state.overdueCollections = [];
      state.collectionsOverview = null;
      state.collectionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch By Loan ID
      .addCase(fetchPeriodsByLoanId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeriodsByLoanId.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload.data || [];
      })
      .addCase(fetchPeriodsByLoanId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchPeriodById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeriodById.fulfilled, (state, action) => {
        state.loading = false;
        state.period = action.payload.data;
      })
      .addCase(fetchPeriodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sync Due Periods
      .addCase(triggerSyncDuePeriods.pending, (state) => {
        state.syncing = true;
      })
      .addCase(triggerSyncDuePeriods.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(triggerSyncDuePeriods.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })

      // Today's Collections
      .addCase(fetchTodayCollections.pending, (state) => {
        state.todayLoading = true;
        state.collectionError = null;
      })
      .addCase(fetchTodayCollections.fulfilled, (state, action) => {
        state.todayLoading = false;
        state.todayCollections = action.payload.data?.data || [];
        state.todaySummary = action.payload.data?.summary || state.todaySummary;
      })
      .addCase(fetchTodayCollections.rejected, (state, action) => {
        state.todayLoading = false;
        state.collectionError = action.payload;
      })

      // Overdue Collections
      .addCase(fetchOverdueCollections.pending, (state) => {
        state.overdueLoading = true;
        state.collectionError = null;
      })
      .addCase(fetchOverdueCollections.fulfilled, (state, action) => {
        state.overdueLoading = false;
        state.overdueCollections = action.payload.data?.data || [];
        state.overdueSummary = action.payload.data?.summary || state.overdueSummary;
      })
      .addCase(fetchOverdueCollections.rejected, (state, action) => {
        state.overdueLoading = false;
        state.collectionError = action.payload;
      })

      // Collections Overview
      .addCase(fetchCollectionsOverview.pending, (state) => {
        state.overviewLoading = true;
      })
      .addCase(fetchCollectionsOverview.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.collectionsOverview = action.payload.data;
      })
      .addCase(fetchCollectionsOverview.rejected, (state, action) => {
        state.overviewLoading = false;
        state.collectionError = action.payload;
      });
  },
});

export const { clearPeriods, clearPeriodError, clearCollections } =
  interestPeriodSlice.actions;

export default interestPeriodSlice.reducer;
