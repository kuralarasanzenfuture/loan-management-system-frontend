import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getPersonalChits,
  getPersonalChitById,
  createPersonalChit,
  updatePersonalChit,
  deletePersonalChit,
  markChitTaken,
  updateChitStatus,
} from "./personalChit.service.js";

// =========================================================
// GET ALL PERSONAL CHITS
// =========================================================

export const fetchPersonalChits = createAsyncThunk(
  "personalChits/fetchPersonalChits",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPersonalChits(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// GET PERSONAL CHIT BY ID
// =========================================================

export const fetchPersonalChitById = createAsyncThunk(
  "personalChits/fetchPersonalChitById",
  async (id, { rejectWithValue }) => {
    try {
      return await getPersonalChitById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// CREATE PERSONAL CHIT
// =========================================================

export const addPersonalChit = createAsyncThunk(
  "personalChits/addPersonalChit",
  async (formData, { rejectWithValue }) => {
    try {
      return await createPersonalChit(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// =========================================================
// UPDATE PERSONAL CHIT
// =========================================================

export const editPersonalChit = createAsyncThunk(
  "personalChits/editPersonalChit",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updatePersonalChit(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// DELETE PERSONAL CHIT
// =========================================================

export const removePersonalChit = createAsyncThunk(
  "personalChits/removePersonalChit",
  async (id, { rejectWithValue }) => {
    try {
      await deletePersonalChit(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// MARK CHIT AS TAKEN
// =========================================================

export const takePersonalChit = createAsyncThunk(
  "personalChits/takePersonalChit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await markChitTaken(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// UPDATE CHIT STATUS
// =========================================================

export const changeChitStatus = createAsyncThunk(
  "personalChits/changeChitStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateChitStatus(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const personalChitSlice = createSlice({
  name: "personalChits",

  initialState: {
    personalChits: [],
    personalChit: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearPersonalChitError: (state) => {
      state.error = null;
    },

    clearSelectedPersonalChit: (state) => {
      state.personalChit = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH ALL
      // =====================================================

      .addCase(fetchPersonalChits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPersonalChits.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.personalChits = Array.isArray(data) ? data : [];
      })

      .addCase(fetchPersonalChits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FETCH BY ID
      // =====================================================

      .addCase(fetchPersonalChitById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPersonalChitById.fulfilled, (state, action) => {
        state.loading = false;

        state.personalChit = action.payload?.data ?? action.payload;
      })

      .addCase(fetchPersonalChitById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CREATE
      // =====================================================

      .addCase(addPersonalChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addPersonalChit.fulfilled, (state, action) => {
        state.loading = false;

        const created = action.payload?.data ?? action.payload;

        if (created) {
          state.personalChits.unshift(created);
        }
      })

      .addCase(addPersonalChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE
      // =====================================================

      .addCase(editPersonalChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editPersonalChit.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload?.data ?? action.payload;

        if (!updated) return;

        const index = state.personalChits.findIndex(
          (chit) => chit.id === updated.id,
        );

        if (index !== -1) {
          state.personalChits[index] = updated;
        }

        if (state.personalChit?.id === updated.id) {
          state.personalChit = updated;
        }
      })

      .addCase(editPersonalChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // DELETE
      // =====================================================

      .addCase(removePersonalChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removePersonalChit.fulfilled, (state, action) => {
        state.loading = false;

        state.personalChits = state.personalChits.filter(
          (chit) => chit.id !== action.payload,
        );

        if (state.personalChit?.id === action.payload) {
          state.personalChit = null;
        }
      })

      .addCase(removePersonalChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // MARK CHIT TAKEN
      // =====================================================

      .addCase(takePersonalChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(takePersonalChit.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload?.data ?? action.payload;

        if (!updated) return;

        const index = state.personalChits.findIndex(
          (chit) => chit.id === updated.id,
        );

        if (index !== -1) {
          state.personalChits[index] = updated;
        }

        if (state.personalChit?.id === updated.id) {
          state.personalChit = updated;
        }
      })

      .addCase(takePersonalChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE STATUS
      // =====================================================

      .addCase(changeChitStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(changeChitStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload?.data ?? action.payload;

        if (!updated) return;

        const index = state.personalChits.findIndex(
          (chit) => chit.id === updated.id,
        );

        if (index !== -1) {
          state.personalChits[index] = updated;
        }

        if (state.personalChit?.id === updated.id) {
          state.personalChit = updated;
        }
      })

      .addCase(changeChitStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPersonalChitError, clearSelectedPersonalChit } =
  personalChitSlice.actions;

export default personalChitSlice.reducer;
