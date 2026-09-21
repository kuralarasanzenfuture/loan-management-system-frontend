import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createInterestPlan,
  getAllInterestPlans,
  getActiveInterestPlans,
  getInterestPlanById,
  updateInterestPlan,
  updateInterestPlanStatus,
  deleteInterestPlan,
} from "./interestPlan.service.js";

// =========================================================
// ASYNC THUNKS
// =========================================================

export const fetchInterestPlans = createAsyncThunk(
  "interestPlans/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllInterestPlans(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest plans",
      );
    }
  },
);

export const fetchActiveInterestPlans = createAsyncThunk(
  "interestPlans/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      return await getActiveInterestPlans();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch active interest plans",
      );
    }
  },
);

export const fetchInterestPlanById = createAsyncThunk(
  "interestPlans/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getInterestPlanById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch interest plan",
      );
    }
  },
);

export const addInterestPlan = createAsyncThunk(
  "interestPlans/create",
  async (formData, { rejectWithValue }) => {
    try {
      return await createInterestPlan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create interest plan",
      );
    }
  },
);

export const editInterestPlan = createAsyncThunk(
  "interestPlans/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateInterestPlan(id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update interest plan",
      );
    }
  },
);

export const changeInterestPlanStatus = createAsyncThunk(
  "interestPlans/updateStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateInterestPlanStatus(id, data);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update interest plan status",
      );
    }
  },
);

export const removeInterestPlan = createAsyncThunk(
  "interestPlans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteInterestPlan(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete interest plan",
      );
    }
  },
);

// Helper
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
  pagination: null,
  loading: false,
  activeLoading: false,
  error: null,
};

// =========================================================
// SLICE
// =========================================================
const interestPlanSlice = createSlice({
  name: "interestPlans",
  initialState,
  reducers: {
    clearInterestPlanError: (state) => {
      state.error = null;
    },
    clearSelectedInterestPlan: (state) => {
      state.plan = null;
    },
    clearInterestPlans: (state) => {
      state.plans = [];
      state.activePlans = [];
      state.plan = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(fetchInterestPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterestPlans.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrapData(action.payload);
        if (Array.isArray(data)) {
          state.plans = data;
          state.pagination = null;
        } else if (data && Array.isArray(data.plans)) {
          state.plans = data.plans;
          state.pagination = data.pagination;
        } else {
          state.plans = [];
          state.pagination = null;
        }
      })
      .addCase(fetchInterestPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ACTIVE
      .addCase(fetchActiveInterestPlans.pending, (state) => {
        state.activeLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveInterestPlans.fulfilled, (state, action) => {
        state.activeLoading = false;
        const data = unwrapData(action.payload);
        state.activePlans = Array.isArray(data) ? data : [];
      })
      .addCase(fetchActiveInterestPlans.rejected, (state, action) => {
        state.activeLoading = false;
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(fetchInterestPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterestPlanById.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrapData(action.payload);
        state.plan = data?.plan || data;
      })
      .addCase(fetchInterestPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(addInterestPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInterestPlan.fulfilled, (state, action) => {
        state.loading = false;
        const created = unwrapData(action.payload);
        if (created && created.id) {
          state.plans.unshift(created);
          if (created.status === "active") {
            state.activePlans.unshift(created);
          }
        }
      })
      .addCase(addInterestPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(editInterestPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editInterestPlan.fulfilled, (state, action) => {
        state.loading = false;
        const updated = unwrapData(action.payload);
        if (updated && updated.id) {
          state.plan = updated;
          const idx = state.plans.findIndex((p) => p.id === updated.id);
          if (idx !== -1) state.plans[idx] = updated;

          const activeIdx = state.activePlans.findIndex((p) => p.id === updated.id);
          if (updated.status === "active") {
            if (activeIdx !== -1) {
              state.activePlans[activeIdx] = updated;
            } else {
              state.activePlans.unshift(updated);
            }
          } else if (activeIdx !== -1) {
            state.activePlans.splice(activeIdx, 1);
          }
        }
      })
      .addCase(editInterestPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE STATUS
      .addCase(changeInterestPlanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeInterestPlanStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = unwrapData(action.payload);
        if (updated && updated.id) {
          if (state.plan?.id === updated.id) state.plan = updated;
          const idx = state.plans.findIndex((p) => p.id === updated.id);
          if (idx !== -1) state.plans[idx] = updated;

          const activeIdx = state.activePlans.findIndex((p) => p.id === updated.id);
          if (updated.status === "active") {
            if (activeIdx !== -1) {
              state.activePlans[activeIdx] = updated;
            } else {
              state.activePlans.unshift(updated);
            }
          } else if (activeIdx !== -1) {
            state.activePlans.splice(activeIdx, 1);
          }
        }
      })
      .addCase(changeInterestPlanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(removeInterestPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeInterestPlan.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.plans = state.plans.filter(
          (p) => p.id !== id && String(p.id) !== String(id),
        );
        state.activePlans = state.activePlans.filter(
          (p) => p.id !== id && String(p.id) !== String(id),
        );
        if (state.plan?.id === id || String(state.plan?.id) === String(id)) {
          state.plan = null;
        }
      })
      .addCase(removeInterestPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearInterestPlanError,
  clearSelectedInterestPlan,
  clearInterestPlans,
} = interestPlanSlice.actions;

export default interestPlanSlice.reducer;
