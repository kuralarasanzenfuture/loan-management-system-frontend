import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getLoanPlanAndPenalities,
  getLoanPlanAndPenalityById,
  createLoanPlanAndPenality,
  updateLoanPlanAndPenality,
  deleteLoanPlanAndPenality,
} from "./loanPlanAndPenality.service.js";

// ─── Fetch All ─────────────────────────────────────────────────────────────
export const fetchLoanPlanAndPenalities = createAsyncThunk(
  "loanPlanAndPenalities/fetchLoanPlanAndPenalities",
  async (_, { rejectWithValue }) => {
    try {
      return await getLoanPlanAndPenalities();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ─── Fetch By ID ───────────────────────────────────────────────────────────
export const fetchLoanPlanAndPenalityById = createAsyncThunk(
  "loanPlanAndPenalities/fetchLoanPlanAndPenalityById",
  async (id, { rejectWithValue }) => {
    try {
      return await getLoanPlanAndPenalityById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ─── Create ────────────────────────────────────────────────────────────────
export const addLoanPlanAndPenality = createAsyncThunk(
  "loanPlanAndPenalities/addLoanPlanAndPenality",
  async (formData, { rejectWithValue }) => {
    try {
      return await createLoanPlanAndPenality(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// ─── Update ────────────────────────────────────────────────────────────────
export const editLoanPlanAndPenality = createAsyncThunk(
  "loanPlanAndPenalities/editLoanPlanAndPenality",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateLoanPlanAndPenality(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ─── Delete ────────────────────────────────────────────────────────────────
export const removeLoanPlanAndPenality = createAsyncThunk(
  "loanPlanAndPenalities/removeLoanPlanAndPenality",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteLoanPlanAndPenality(id);
      // Backend may soft-deactivate instead of delete (plan in use)
      // Return both the id and the full response so the reducer can handle both
      return { id: Number(id), response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const loanPlanAndPenalitySlice = createSlice({
  name: "loanPlanAndPenalities",
  initialState: {
    loanPlanAndPenalities: [],
    loanPlanAndPenality: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearLoanPlanAndPenalityError: (state) => {
      state.error = null;
    },
    clearSelectedLoanPlanAndPenality: (state) => {
      state.loanPlanAndPenality = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Fetch All ───────────────────────────────────────────────────────
      .addCase(fetchLoanPlanAndPenalities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanPlanAndPenalities.fulfilled, (state, action) => {
        state.loading = false;
        // Backend: { success: true, data: [...] }
        state.loanPlanAndPenalities = action.payload?.data ?? action.payload;
      })
      .addCase(fetchLoanPlanAndPenalities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By ID ─────────────────────────────────────────────────────
      .addCase(fetchLoanPlanAndPenalityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanPlanAndPenalityById.fulfilled, (state, action) => {
        state.loading = false;
        state.loanPlanAndPenality = action.payload?.data ?? action.payload;
      })
      .addCase(fetchLoanPlanAndPenalityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Create ──────────────────────────────────────────────────────────
      .addCase(addLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;
        // Backend: { success, message, data: newPlan }
        const newPlan = action.payload?.data ?? action.payload;
        if (newPlan?.id) {
          state.loanPlanAndPenalities.unshift(newPlan);
        }
      })
      .addCase(addLoanPlanAndPenality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update ──────────────────────────────────────────────────────────
      .addCase(editLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;
        // Backend: { success, message, data: updatedPlan }
        const updated = action.payload?.data ?? action.payload;

        if (updated?.id) {
          const index = state.loanPlanAndPenalities.findIndex(
            (item) => Number(item.id) === Number(updated.id),
          );
          if (index !== -1) {
            state.loanPlanAndPenalities[index] = updated;
          }

          if (Number(state.loanPlanAndPenality?.id) === Number(updated.id)) {
            state.loanPlanAndPenality = updated;
          }
        }
      })
      .addCase(editLoanPlanAndPenality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete ──────────────────────────────────────────────────────────
      .addCase(removeLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;
        const { id, response } = action.payload;
        const numId = Number(id);

        if (response?.deactivated) {
          // Plan was in use — backend soft-deactivated it, update status in store
          const index = state.loanPlanAndPenalities.findIndex(
            (item) => Number(item.id) === numId,
          );
          if (index !== -1) {
            state.loanPlanAndPenalities[index] = {
              ...state.loanPlanAndPenalities[index],
              status: "inactive",
            };
          }
          if (Number(state.loanPlanAndPenality?.id) === numId) {
            state.loanPlanAndPenality = {
              ...state.loanPlanAndPenality,
              status: "inactive",
            };
          }
        } else {
          // Truly deleted — remove from list
          state.loanPlanAndPenalities = state.loanPlanAndPenalities.filter(
            (item) => Number(item.id) !== numId,
          );
          if (Number(state.loanPlanAndPenality?.id) === numId) {
            state.loanPlanAndPenality = null;
          }
        }
      })
      .addCase(removeLoanPlanAndPenality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearLoanPlanAndPenalityError,
  clearSelectedLoanPlanAndPenality,
} = loanPlanAndPenalitySlice.actions;

export default loanPlanAndPenalitySlice.reducer;
