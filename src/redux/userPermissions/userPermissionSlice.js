import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  setUserPermissions,
  getUserPermissions,
  getTreeUserPermissions,
} from "./userPermission.service.js";

// =========================================================
// GET USER PERMISSIONS
// =========================================================

export const fetchUserPermissions = createAsyncThunk(
  "userPermissions/fetchUserPermissions",

  async (userId, { rejectWithValue }) => {
    try {
      return await getUserPermissions(userId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch user permissions",
      );
    }
  },
);

// =========================================================
// GET USER PERMISSIONS TREE
// =========================================================

export const fetchTreeUserPermissions = createAsyncThunk(
  "userPermissions/fetchTreeUserPermissions",

  async (userId, { rejectWithValue }) => {
    try {
      return await getTreeUserPermissions(userId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch user permissions tree",
      );
    }
  },
);

// =========================================================
// SET USER PERMISSIONS - BULK
// =========================================================

export const saveUserPermissions = createAsyncThunk(
  "userPermissions/saveUserPermissions",

  async (formData, { rejectWithValue }) => {
    try {
      return await setUserPermissions(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to save user permissions",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const userPermissionSlice = createSlice({
  name: "userPermissions",

  initialState: {
    permissions: [],
    tree: [],

    selectedUserId: null,

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

    clearUserPermissionError: (state) => {
      state.error = null;
      state.saveError = null;
    },

    // =====================================================
    // CLEAR TREE
    // =====================================================

    clearUserPermissionTree: (state) => {
      state.tree = [];
    },

    // =====================================================
    // CLEAR PERMISSIONS
    // =====================================================

    clearUserPermissions: (state) => {
      state.permissions = [];
      state.tree = [];
      state.selectedUserId = null;
    },

    // =====================================================
    // SET SELECTED USER
    // =====================================================

    setSelectedUser: (state, action) => {
      state.selectedUserId = action.payload;
    },

    // =====================================================
    // RESET SAVE STATUS
    // =====================================================

    resetUserPermissionSaveStatus: (state) => {
      state.saveSuccess = false;
      state.saveError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH USER PERMISSIONS
      // =====================================================

      .addCase(fetchUserPermissions.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        state.selectedUserId = action.meta.arg;
      })

      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.permissions = Array.isArray(data)
          ? data
          : Array.isArray(data?.permissions)
            ? data.permissions
            : [];
      })

      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FETCH USER PERMISSIONS TREE
      // =====================================================

      .addCase(fetchTreeUserPermissions.pending, (state, action) => {
        state.treeLoading = true;
        state.error = null;

        state.selectedUserId = action.meta.arg;
      })

      .addCase(fetchTreeUserPermissions.fulfilled, (state, action) => {
        state.treeLoading = false;

        const data = action.payload?.data ?? action.payload;

        state.tree = Array.isArray(data)
          ? data
          : Array.isArray(data?.tree)
            ? data.tree
            : [];
      })

      .addCase(fetchTreeUserPermissions.rejected, (state, action) => {
        state.treeLoading = false;
        state.error = action.payload;
      })

      // =====================================================
      // SAVE USER PERMISSIONS
      // =====================================================

      .addCase(saveUserPermissions.pending, (state) => {
        state.saving = true;
        state.saveError = null;
        state.saveSuccess = false;
      })

      .addCase(saveUserPermissions.fulfilled, (state, action) => {
        state.saving = false;
        state.saveSuccess = true;

        const data = action.payload?.data ?? action.payload;

        // Keep Redux synchronized if backend returns
        // the updated permission list.
        if (Array.isArray(data)) {
          state.permissions = data;
        } else if (Array.isArray(data?.permissions)) {
          state.permissions = data.permissions;
        }
      })

      .addCase(saveUserPermissions.rejected, (state, action) => {
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
  clearUserPermissionError,
  clearUserPermissionTree,
  clearUserPermissions,
  setSelectedUser,
  resetUserPermissionSaveStatus,
} = userPermissionSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default userPermissionSlice.reducer;
