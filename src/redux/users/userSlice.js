import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service.js";

// Get All Users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllUsers();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get User By ID
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create User
export const addUser = createAsyncThunk(
  "users/addUser",
  async (formData, { rejectWithValue }) => {
    try {
      return await createUser(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update User
export const editUser = createAsyncThunk(
  "users/editUser",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateUser(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete User
export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (id, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data || action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload.data || action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(editUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

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

      // Delete User
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
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
      });
  },
});

export const { clearUserError, clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;
