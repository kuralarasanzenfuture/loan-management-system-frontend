import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createInterestOnlyLoanPlan,
  getAllInterestOnlyLoanPlans,
  getActiveInterestOnlyLoanPlans,
  getInterestOnlyLoanPlanById,
  updateInterestOnlyLoanPlan,
  updateInterestOnlyLoanPlanStatus,
  deleteInterestOnlyLoanPlan,
} from "./interestLoanPlan.service.js";

// =========================================================
// GET ALL INTEREST ONLY LOAN PLANS
// =========================================================

export const fetchInterestOnlyLoanPlans = createAsyncThunk(
  "interestLoanPlans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllInterestOnlyLoanPlans(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest only loan plans",
      );
    }
  },
);

// =========================================================
// GET ACTIVE INTEREST ONLY LOAN PLANS
// =========================================================

export const fetchActiveInterestOnlyLoanPlans = createAsyncThunk(
  "interestLoanPlans/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      return await getActiveInterestOnlyLoanPlans();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch active interest only loan plans",
      );
    }
  },
);

// =========================================================
// GET INTEREST ONLY LOAN PLAN BY ID
// =========================================================

export const fetchInterestOnlyLoanPlanById = createAsyncThunk(
  "interestLoanPlans/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInterestOnlyLoanPlanById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest only loan plan",
      );
    }
  },
);

// =========================================================
// CREATE INTEREST ONLY LOAN PLAN
// =========================================================

export const addInterestOnlyLoanPlan = createAsyncThunk(
  "interestLoanPlans/create",
  async (formData, { rejectWithValue }) => {
    try {
      return await createInterestOnlyLoanPlan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create interest only loan plan",
      );
    }
  },
);

// =========================================================
// UPDATE INTEREST ONLY LOAN PLAN
// =========================================================

export const editInterestOnlyLoanPlan = createAsyncThunk(
  "interestLoanPlans/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateInterestOnlyLoanPlan(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update interest only loan plan",
      );
    }
  },
);

// =========================================================
// UPDATE STATUS
// =========================================================

export const changeInterestOnlyLoanPlanStatus = createAsyncThunk(
  "interestLoanPlans/updateStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateInterestOnlyLoanPlanStatus(id, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update loan plan status",
      );
    }
  },
);

// =========================================================
// DELETE INTEREST ONLY LOAN PLAN
// =========================================================

export const removeInterestOnlyLoanPlan = createAsyncThunk(
  "interestLoanPlans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteInterestOnlyLoanPlan(id);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete interest only loan plan",
      );
    }
  },
);

// =========================================================
// HELPER
// =========================================================

const unwrapData = (payload) => {
  return payload?.data ?? payload;
};

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  plans: [],
  activePlans: [],
  plan: null,

  loading: false,
  activeLoading: false,
  error: null,
};

// =========================================================
// SLICE
// =========================================================

const interestLoanPlanSlice = createSlice({
  name: "interestLoanPlans",

  initialState,

  reducers: {
    clearInterestLoanPlanError: (state) => {
      state.error = null;
    },

    clearSelectedInterestLoanPlan: (state) => {
      state.plan = null;
    },

    clearInterestLoanPlans: (state) => {
      state.plans = [];
      state.activePlans = [];
      state.plan = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // GET ALL
      // =====================================================

      .addCase(fetchInterestOnlyLoanPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyLoanPlans.fulfilled, (state, action) => {
        state.loading = false;

        const data = unwrapData(action.payload);

        state.plans = Array.isArray(data) ? data : [];
      })

      .addCase(fetchInterestOnlyLoanPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // GET ACTIVE
      // =====================================================

      .addCase(fetchActiveInterestOnlyLoanPlans.pending, (state) => {
        state.activeLoading = true;
        state.error = null;
      })

      .addCase(fetchActiveInterestOnlyLoanPlans.fulfilled, (state, action) => {
        state.activeLoading = false;

        const data = unwrapData(action.payload);

        state.activePlans = Array.isArray(data) ? data : [];
      })

      .addCase(fetchActiveInterestOnlyLoanPlans.rejected, (state, action) => {
        state.activeLoading = false;
        state.error = action.payload;
      })

      // =====================================================
      // GET BY ID
      // =====================================================

      .addCase(fetchInterestOnlyLoanPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInterestOnlyLoanPlanById.fulfilled, (state, action) => {
        state.loading = false;

        state.plan = unwrapData(action.payload);
      })

      .addCase(fetchInterestOnlyLoanPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CREATE
      // =====================================================

      .addCase(addInterestOnlyLoanPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addInterestOnlyLoanPlan.fulfilled, (state, action) => {
        state.loading = false;

        const created = unwrapData(action.payload);

        if (created) {
          state.plans.unshift(created);

          if (created.status === "active") {
            state.activePlans.unshift(created);
          }
        }
      })

      .addCase(addInterestOnlyLoanPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE
      // =====================================================

      .addCase(editInterestOnlyLoanPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editInterestOnlyLoanPlan.fulfilled, (state, action) => {
        state.loading = false;

        const updated = unwrapData(action.payload);

        if (!updated?.id) return;

        // Update main list
        const index = state.plans.findIndex((item) => item.id === updated.id);

        if (index !== -1) {
          state.plans[index] = updated;
        }

        // Update selected plan
        if (state.plan?.id === updated.id) {
          state.plan = updated;
        }

        // Update active list
        const activeIndex = state.activePlans.findIndex(
          (item) => item.id === updated.id,
        );

        if (updated.status === "active") {
          if (activeIndex !== -1) {
            state.activePlans[activeIndex] = updated;
          } else {
            state.activePlans.unshift(updated);
          }
        } else if (activeIndex !== -1) {
          state.activePlans.splice(activeIndex, 1);
        }
      })

      .addCase(editInterestOnlyLoanPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE STATUS
      // =====================================================

      .addCase(changeInterestOnlyLoanPlanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(changeInterestOnlyLoanPlanStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updated = unwrapData(action.payload);

        if (!updated) return;

        const updatedId = updated.id;

        // Update main list
        const index = state.plans.findIndex((item) => item.id === updatedId);

        if (index !== -1) {
          state.plans[index] = {
            ...state.plans[index],
            ...updated,
          };
        }

        // Update selected
        if (state.plan?.id === updatedId) {
          state.plan = {
            ...state.plan,
            ...updated,
          };
        }

        // Active list
        const activeIndex = state.activePlans.findIndex(
          (item) => item.id === updatedId,
        );

        const updatedPlan =
          state.plans.find((item) => item.id === updatedId) || updated;

        if (updatedPlan.status === "active") {
          if (activeIndex !== -1) {
            state.activePlans[activeIndex] = updatedPlan;
          } else {
            state.activePlans.unshift(updatedPlan);
          }
        } else if (activeIndex !== -1) {
          state.activePlans.splice(activeIndex, 1);
        }
      })

      .addCase(changeInterestOnlyLoanPlanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // DELETE
      // =====================================================

      .addCase(removeInterestOnlyLoanPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeInterestOnlyLoanPlan.fulfilled, (state, action) => {
        state.loading = false;

        const id = action.payload;

        state.plans = state.plans.filter((item) => item.id !== id);

        state.activePlans = state.activePlans.filter((item) => item.id !== id);

        if (state.plan?.id === id) {
          state.plan = null;
        }
      })

      .addCase(removeInterestOnlyLoanPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearInterestLoanPlanError,
  clearSelectedInterestLoanPlan,
  clearInterestLoanPlans,
} = interestLoanPlanSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default interestLoanPlanSlice.reducer;
