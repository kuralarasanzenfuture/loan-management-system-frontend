import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeOwnPassword as changeOwnPasswordService,
} from "./user.service.js";

// =========================================================
// GET ALL USERS
// =========================================================

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllUsers();
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch users");
    }
  },
);

// =========================================================
// GET USER BY ID
// =========================================================

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch user");
    }
  },
);

// =========================================================
// CREATE USER
// =========================================================

export const addUser = createAsyncThunk(
  "users/addUser",
  async (formData, { rejectWithValue }) => {
    try {
      return await createUser(formData);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create user");
    }
  },
);

// =========================================================
// UPDATE USER
// =========================================================

export const editUser = createAsyncThunk(
  "users/editUser",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateUser(id, formData);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update user");
    }
  },
);

// =========================================================
// DELETE USER
// =========================================================

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete user");
    }
  },
);

// =========================================================
// CHANGE OWN PASSWORD
// =========================================================

export const changePassword = createAsyncThunk(
  "users/changePassword",
  async (formData, { rejectWithValue }) => {
    try {
      return await changeOwnPasswordService(formData);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to change password");
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const userSlice = createSlice({
  name: "users",

  initialState: {
    users: [],
    user: null,

    loading: false,
    error: null,

    passwordLoading: false,
    passwordError: null,
    passwordSuccess: false,
  },

  reducers: {
    // Clear general user error
    clearUserError: (state) => {
      state.error = null;
    },

    // Clear selected user
    clearSelectedUser: (state) => {
      state.user = null;
    },

    // Clear password state
    clearPasswordState: (state) => {
      state.passwordLoading = false;
      state.passwordError = null;
      state.passwordSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH ALL USERS
      // =====================================================

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        state.users = Array.isArray(data) ? data : [];
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FETCH USER BY ID
      // =====================================================

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload?.data ?? action.payload;
      })

      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CREATE USER
      // =====================================================

      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;

        const created = action.payload?.data ?? action.payload;

        if (created) {
          state.users.unshift(created);
        }
      })

      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE USER
      // =====================================================

      .addCase(editUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editUser.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload?.data ?? action.payload;

        if (!updated?.id) return;

        const index = state.users.findIndex((user) => user.id === updated.id);

        if (index !== -1) {
          state.users[index] = updated;
        }

        if (state.user?.id === updated.id) {
          state.user = updated;
        }
      })

      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // DELETE USER
      // =====================================================

      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false;

        state.users = state.users.filter((user) => user.id !== action.payload);

        if (state.user?.id === action.payload) {
          state.user = null;
        }
      })

      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CHANGE PASSWORD
      // =====================================================

      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordSuccess = false;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordSuccess = true;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
        state.passwordSuccess = false;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const { clearUserError, clearSelectedUser, clearPasswordState } =
  userSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default userSlice.reducer;
