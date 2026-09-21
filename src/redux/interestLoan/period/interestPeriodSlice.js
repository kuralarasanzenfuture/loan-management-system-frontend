import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getPeriodsByLoanId,
  getPeriodById,
  syncDuePeriods,
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

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  periods: [],
  period: null,
  loading: false,
  syncing: false,
  error: null,
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
      });
  },
});

export const { clearPeriods, clearPeriodError } = interestPeriodSlice.actions;

export default interestPeriodSlice.reducer;
