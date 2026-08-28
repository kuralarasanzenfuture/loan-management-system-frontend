import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getModulesActionsTree,
  getModulesActionsFlat,
} from "./modulesActions.service.js";

// =========================================================
// GET MODULES + ACTIONS TREE
// =========================================================

export const fetchModulesActionsTree = createAsyncThunk(
  "modulesActions/fetchTree",
  async (_, { rejectWithValue }) => {
    try {
      return await getModulesActionsTree();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch modules and actions tree",
      );
    }
  },
);

// =========================================================
// GET MODULES + ACTIONS FLAT
// =========================================================

export const fetchModulesActionsFlat = createAsyncThunk(
  "modulesActions/fetchFlat",
  async (_, { rejectWithValue }) => {
    try {
      return await getModulesActionsFlat();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch modules and actions",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const modulesActionsSlice = createSlice({
  name: "modulesActions",

  initialState: {
    tree: [],
    flat: [],

    treeLoading: false,
    flatLoading: false,

    error: null,
  },

  reducers: {
    clearModulesActionsError: (state) => {
      state.error = null;
    },

    clearModulesActions: (state) => {
      state.tree = [];
      state.flat = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // TREE
      // =====================================================

      .addCase(fetchModulesActionsTree.pending, (state) => {
        state.treeLoading = true;
        state.error = null;
      })

      .addCase(fetchModulesActionsTree.fulfilled, (state, action) => {
        state.treeLoading = false;

        const data = action.payload?.data ?? action.payload;

        state.tree = Array.isArray(data) ? data : [];
      })

      .addCase(fetchModulesActionsTree.rejected, (state, action) => {
        state.treeLoading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FLAT
      // =====================================================

      .addCase(fetchModulesActionsFlat.pending, (state) => {
        state.flatLoading = true;
        state.error = null;
      })

      .addCase(fetchModulesActionsFlat.fulfilled, (state, action) => {
        state.flatLoading = false;

        const data = action.payload?.data ?? action.payload;

        state.flat = Array.isArray(data) ? data : [];
      })

      .addCase(fetchModulesActionsFlat.rejected, (state, action) => {
        state.flatLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearModulesActionsError, clearModulesActions } =
  modulesActionsSlice.actions;

export default modulesActionsSlice.reducer;
