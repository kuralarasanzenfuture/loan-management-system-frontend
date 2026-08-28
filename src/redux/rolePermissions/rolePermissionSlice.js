import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  setRolePermissions,
  getRolePermissions,
  getTreeRolePermissions,
} from "./rolePermission.service.js";

// =========================================================
// GET ROLE PERMISSIONS
// =========================================================

export const fetchRolePermissions = createAsyncThunk(
  "rolePermissions/fetchRolePermissions",

  async (roleId, { rejectWithValue }) => {
    try {
      return await getRolePermissions(roleId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch role permissions",
      );
    }
  },
);

// =========================================================
// GET ROLE PERMISSIONS TREE
// =========================================================

export const fetchTreeRolePermissions = createAsyncThunk(
  "rolePermissions/fetchTreeRolePermissions",

  async (roleId, { rejectWithValue }) => {
    try {
      return await getTreeRolePermissions(roleId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch role permissions tree",
      );
    }
  },
);

// =========================================================
// SET ROLE PERMISSIONS - BULK
// =========================================================

export const saveRolePermissions = createAsyncThunk(
  "rolePermissions/saveRolePermissions",

  async (formData, { rejectWithValue }) => {
    try {
      return await setRolePermissions(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to save role permissions",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const rolePermissionSlice = createSlice({
  name: "rolePermissions",

  initialState: {
    permissions: [],
    tree: [],

    selectedRoleId: null,

    loading: false,
    treeLoading: false,
    saving: false,

    error: null,
    saveError: null,

    saveSuccess: false,
  },

  reducers: {
    // =====================================================
    // CLEAR ERROR
    // =====================================================

    clearRolePermissionError: (state) => {
      state.error = null;
      state.saveError = null;
    },

    // =====================================================
    // CLEAR TREE
    // =====================================================

    clearRolePermissionTree: (state) => {
      state.tree = [];
    },

    // =====================================================
    // CLEAR PERMISSIONS
    // =====================================================

    clearRolePermissions: (state) => {
      state.permissions = [];
      state.tree = [];
      state.selectedRoleId = null;
    },

    // =====================================================
    // SET SELECTED ROLE
    // =====================================================

    setSelectedRole: (state, action) => {
      state.selectedRoleId = action.payload;
    },

    // =====================================================
    // RESET SAVE STATUS
    // =====================================================

    resetRolePermissionSaveStatus: (state) => {
      state.saveSuccess = false;
      state.saveError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH ROLE PERMISSIONS
      // =====================================================

      .addCase(fetchRolePermissions.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        state.selectedRoleId = action.meta.arg;
      })

      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.permissions = Array.isArray(data)
          ? data
          : Array.isArray(data?.permissions)
            ? data.permissions
            : [];
      })

      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FETCH ROLE PERMISSIONS TREE
      // =====================================================

      .addCase(fetchTreeRolePermissions.pending, (state, action) => {
        state.treeLoading = true;
        state.error = null;

        state.selectedRoleId = action.meta.arg;
      })

      .addCase(fetchTreeRolePermissions.fulfilled, (state, action) => {
        state.treeLoading = false;

        const data = action.payload?.data ?? action.payload;

        state.tree = Array.isArray(data)
          ? data
          : Array.isArray(data?.tree)
            ? data.tree
            : [];
      })

      .addCase(fetchTreeRolePermissions.rejected, (state, action) => {
        state.treeLoading = false;
        state.error = action.payload;
      })

      // =====================================================
      // SAVE ROLE PERMISSIONS
      // =====================================================

      .addCase(saveRolePermissions.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        state.saveSuccess = false;
      })

      .addCase(saveRolePermissions.fulfilled, (state, action) => {
        state.saving = false;
        state.saveSuccess = true;

        const data = action.payload?.data ?? action.payload;

        // If backend returns updated permissions,
        // keep Redux state synchronized.
        if (Array.isArray(data)) {
          state.permissions = data;
        } else if (Array.isArray(data?.permissions)) {
          state.permissions = data.permissions;
        }
      })

      .addCase(saveRolePermissions.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload;
        state.saveSuccess = false;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearRolePermissionError,
  clearRolePermissionTree,
  clearRolePermissions,
  setSelectedRole,
  resetRolePermissionSaveStatus,
} = rolePermissionSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default rolePermissionSlice.reducer;
