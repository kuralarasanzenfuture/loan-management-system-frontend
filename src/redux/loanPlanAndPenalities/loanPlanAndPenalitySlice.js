import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getLoanPlanAndPenalities,
  getLoanPlanAndPenalityById,
  createLoanPlanAndPenality,
  updateLoanPlanAndPenality,
  deleteLoanPlanAndPenality,
} from "./loanPlanAndPenality.service.js";

// Get All Loan Plans & Penalities
export const fetchLoanPlanAndPenalities = createAsyncThunk(
  "loanPlanAndPenalities/fetchLoanPlanAndPenalities",
  async (_, { rejectWithValue }) => {
    try {
      return await getLoanPlanAndPenalities();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Loan Plan & Penality By ID
export const fetchLoanPlanAndPenalityById = createAsyncThunk(
  "loanPlanAndPenalities/fetchLoanPlanAndPenalityById",
  async (id, { rejectWithValue }) => {
    try {
      return await getLoanPlanAndPenalityById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Loan Plan & Penality
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

// Update Loan Plan & Penality
export const editLoanPlanAndPenality = createAsyncThunk(
  "loanPlanAndPenalities/editLoanPlanAndPenality",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateLoanPlanAndPenality(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Loan Plan & Penality
export const removeLoanPlanAndPenality = createAsyncThunk(
  "loanPlanAndPenalities/removeLoanPlanAndPenality",
  async (id, { rejectWithValue }) => {
    try {
      await deleteLoanPlanAndPenality(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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

      // Fetch All
      .addCase(fetchLoanPlanAndPenalities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLoanPlanAndPenalities.fulfilled, (state, action) => {
        state.loading = false;
        state.loanPlanAndPenalities = action.payload.data || action.payload;
      })
      .addCase(fetchLoanPlanAndPenalities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchLoanPlanAndPenalityById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLoanPlanAndPenalityById.fulfilled, (state, action) => {
        state.loading = false;
        state.loanPlanAndPenality = action.payload.data || action.payload;
      })
      .addCase(fetchLoanPlanAndPenalityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;
        state.loanPlanAndPenalities.unshift(
          action.payload.data || action.payload,
        );
      })
      .addCase(addLoanPlanAndPenality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
      })
      .addCase(editLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.loanPlanAndPenalities.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.loanPlanAndPenalities[index] = updated;
        }

        if (state.loanPlanAndPenality?.id === updated.id) {
          state.loanPlanAndPenality = updated;
        }
      })
      .addCase(editLoanPlanAndPenality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeLoanPlanAndPenality.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLoanPlanAndPenality.fulfilled, (state, action) => {
        state.loading = false;

        state.loanPlanAndPenalities = state.loanPlanAndPenalities.filter(
          (item) => item.id !== action.payload,
        );

        if (state.loanPlanAndPenality?.id === action.payload) {
          state.loanPlanAndPenality = null;
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
