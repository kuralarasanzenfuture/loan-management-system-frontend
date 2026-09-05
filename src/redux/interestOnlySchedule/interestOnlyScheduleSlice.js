import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getLoanSchedules,
  getPendingSchedules,
  getOverdueSchedules,
  getScheduleById,
  getTodayCollections,
  getOverdueCollectionsGlobal,
} from "./interestOnlySchedule.service.js";

/* =========================================================
   GET TODAY COLLECTIONS
========================================================= */

export const fetchTodayInterestCollections = createAsyncThunk(
  "interestOnlySchedules/fetchTodayInterestCollections",
  async ({ date, status, search } = {}, { rejectWithValue }) => {
    try {
      return await getTodayCollections(date, status, search);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch today interest collections",
      );
    }
  },
);

/* =========================================================
   GET GLOBAL OVERDUE COLLECTIONS
========================================================= */

export const fetchOverdueInterestCollectionsGlobal = createAsyncThunk(
  "interestOnlySchedules/fetchOverdueInterestCollectionsGlobal",
  async (search = "", { rejectWithValue }) => {
    try {
      return await getOverdueCollectionsGlobal(search);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch overdue interest collections",
      );
    }
  },
);


/* =========================================================
   GET FULL LOAN SCHEDULE
========================================================= */

export const fetchLoanSchedules = createAsyncThunk(
  "interestOnlySchedules/fetchLoanSchedules",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getLoanSchedules(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch loan schedules",
      );
    }
  },
);

/* =========================================================
   GET PENDING SCHEDULES
========================================================= */

export const fetchPendingSchedules = createAsyncThunk(
  "interestOnlySchedules/fetchPendingSchedules",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getPendingSchedules(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch pending schedules",
      );
    }
  },
);

/* =========================================================
   GET OVERDUE SCHEDULES
========================================================= */

export const fetchOverdueSchedules = createAsyncThunk(
  "interestOnlySchedules/fetchOverdueSchedules",
  async (loanId, { rejectWithValue }) => {
    try {
      return await getOverdueSchedules(loanId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch overdue schedules",
      );
    }
  },
);

/* =========================================================
   GET SINGLE SCHEDULE
========================================================= */

export const fetchScheduleById = createAsyncThunk(
  "interestOnlySchedules/fetchScheduleById",
  async (id, { rejectWithValue }) => {
    try {
      return await getScheduleById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch schedule",
      );
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const interestOnlyScheduleSlice = createSlice({
  name: "interestOnlySchedules",

  initialState: {
    // Full schedule
    schedules: [],

    // Pending schedules
    pendingSchedules: [],

    // Overdue schedules
    overdueSchedules: [],

    // Selected schedule
    schedule: null,

    // Currently selected loan
    loanId: null,

    // Today collections
    todayCollections: [],
    todaySummary: {
      total_due: 0,
      total_collected: 0,
      total_balance: 0,
      count: 0,
    },

    // Global overdue collections
    overdueCollections: [],
    overdueSummary: {
      count: 0,
      total_overdue_amount: 0,
    },

    collectionLoading: false,
    collectionError: null,

    loading: false,
    error: null,
  },

  reducers: {
    /* -----------------------------------------------------
       CLEAR ERROR
    ----------------------------------------------------- */

    clearInterestOnlyScheduleError: (state) => {
      state.error = null;
      state.collectionError = null;
    },

    /* -----------------------------------------------------
       CLEAR SELECTED SCHEDULE
    ----------------------------------------------------- */

    clearSelectedSchedule: (state) => {
      state.schedule = null;
    },

    /* -----------------------------------------------------
       CLEAR ALL SCHEDULE DATA
    ----------------------------------------------------- */

    clearSchedules: (state) => {
      state.schedules = [];
      state.pendingSchedules = [];
      state.overdueSchedules = [];
      state.schedule = null;
      state.loanId = null;
    },

    /* -----------------------------------------------------
       CLEAR PENDING
    ----------------------------------------------------- */

    clearPendingSchedules: (state) => {
      state.pendingSchedules = [];
    },

    /* -----------------------------------------------------
       CLEAR OVERDUE
    ----------------------------------------------------- */

    clearOverdueSchedules: (state) => {
      state.overdueSchedules = [];
    },

    /* -----------------------------------------------------
       CLEAR COLLECTIONS
    ----------------------------------------------------- */

    clearInterestCollections: (state) => {
      state.todayCollections = [];
      state.todaySummary = {
        total_due: 0,
        total_collected: 0,
        total_balance: 0,
        count: 0,
      };
      state.overdueCollections = [];
      state.overdueSummary = {
        count: 0,
        total_overdue_amount: 0,
      };
      state.collectionError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         TODAY COLLECTIONS
      ===================================================== */

      .addCase(fetchTodayInterestCollections.pending, (state) => {
        state.collectionLoading = true;
        state.collectionError = null;
      })

      .addCase(fetchTodayInterestCollections.fulfilled, (state, action) => {
        state.collectionLoading = false;
        const list = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
            ? action.payload
            : [];
        state.todayCollections = list;
        state.todaySummary = action.payload?.summary || {
          total_due: list.reduce((sum, r) => sum + Number(r.total_due || 0), 0),
          total_collected: list.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0),
          total_balance: list.reduce((sum, r) => sum + Number(r.balance_amount || 0), 0),
          count: list.length,
        };
      })

      .addCase(fetchTodayInterestCollections.rejected, (state, action) => {
        state.collectionLoading = false;
        state.collectionError = action.payload;
      })

      /* =====================================================
         GLOBAL OVERDUE COLLECTIONS
      ===================================================== */

      .addCase(fetchOverdueInterestCollectionsGlobal.pending, (state) => {
        state.collectionLoading = true;
        state.collectionError = null;
      })

      .addCase(
        fetchOverdueInterestCollectionsGlobal.fulfilled,
        (state, action) => {
          state.collectionLoading = false;
          const list = Array.isArray(action.payload?.data)
            ? action.payload.data
            : Array.isArray(action.payload)
              ? action.payload
              : [];
          state.overdueCollections = list;
          state.overdueSummary = {
            count: action.payload?.count ?? list.length,
            total_overdue_amount:
              action.payload?.total_overdue_amount ??
              list.reduce((sum, r) => sum + Number(r.balance_amount || 0), 0),
          };
        },
      )

      .addCase(
        fetchOverdueInterestCollectionsGlobal.rejected,
        (state, action) => {
          state.collectionLoading = false;
          state.collectionError = action.payload;
        },
      )

      /* =====================================================
         FULL LOAN SCHEDULE
      ===================================================== */

      .addCase(fetchLoanSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLoanSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload?.data || [];
      })

      .addCase(fetchLoanSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         PENDING SCHEDULES
      ===================================================== */

      .addCase(fetchPendingSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPendingSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingSchedules = action.payload?.data || [];
      })

      .addCase(fetchPendingSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         OVERDUE SCHEDULES
      ===================================================== */

      .addCase(fetchOverdueSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchOverdueSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueSchedules = action.payload?.data || [];
      })

      .addCase(fetchOverdueSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
         SINGLE SCHEDULE
      ===================================================== */

      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule =
          action.payload?.data ?? action.payload?.schedule ?? action.payload;
      })

      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearInterestOnlyScheduleError,
  clearSelectedSchedule,
  clearSchedules,
  clearPendingSchedules,
  clearOverdueSchedules,
  clearInterestCollections,
} = interestOnlyScheduleSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default interestOnlyScheduleSlice.reducer;
