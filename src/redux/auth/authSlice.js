import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  getMe,
  refreshToken as refreshTokenService, // renamed to avoid conflict if needed, though you import it as refreshToken
  logout,
  logoutAllDevices,
} from "./auth.service.js";

// -------------------- Helpers --------------------

function unwrapUser(payload) {
  return payload?.data ?? payload;
}

// -------------------- Async Thunks --------------------

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      return await login(credentials);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching current user with getMe API call"); // Debugging line to check when the fetch is triggered
      return await getMe();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshTokenService();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      const token = localStorage.getItem("refreshToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const sessionId = localStorage.getItem("sessionId") || user?.session_id;
      await logout({ refreshToken: token, session_id: sessionId });
    } catch (error) {
      console.warn("Server logout error:", error);
    } finally {
      dispatch(clearAuth());
    }
    return true;
  }
);

export const logoutAll = createAsyncThunk(
  "auth/logoutAll",
  async (_, { dispatch }) => {
    try {
      const token = localStorage.getItem("refreshToken");
      await logoutAllDevices({ refreshToken: token });
    } catch (error) {
      console.warn("Server logout all error:", error);
    } finally {
      dispatch(clearAuth());
    }
    return true;
  }
);

// -------------------- Initial State --------------------

const rawStoredUser = JSON.parse(localStorage.getItem("user")) || null;
const rawAccessToken = localStorage.getItem("accessToken");
const isValidAccessToken =
  rawAccessToken &&
  rawAccessToken !== "undefined" &&
  rawAccessToken !== "null";

if (!isValidAccessToken && rawAccessToken) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
}

const initialState = {
  user: unwrapUser(rawStoredUser),
  accessToken: isValidAccessToken ? rawAccessToken : null,
  isAuthenticated: isValidAccessToken,
  loading: false,
  error: null,
};

// -------------------- Slice --------------------

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    setCredentials(state, action) {
      const userData = unwrapUser(action.payload.user);
      const token =
        action.payload.accessToken ||
        action.payload.access_token ||
        action.payload.data?.accessToken ||
        action.payload.data?.access_token;
      const refreshToken =
        action.payload.refreshToken ||
        action.payload.refresh_token ||
        action.payload.data?.refreshToken ||
        action.payload.data?.refresh_token;
      const sessionId =
        action.payload.session_id ||
        action.payload.sessionId ||
        action.payload.data?.session_id ||
        action.payload.data?.sessionId;

      state.user = userData;
      state.accessToken = token;
      state.isAuthenticated = Boolean(token);

      if (token) {
        localStorage.setItem("accessToken", token);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (sessionId) {
        localStorage.setItem("sessionId", sessionId);
      }
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }
    },

    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = unwrapUser(action.payload.user);
        const token =
          action.payload.accessToken ||
          action.payload.access_token ||
          action.payload.data?.accessToken ||
          action.payload.data?.access_token;
        const refreshToken =
          action.payload.refreshToken ||
          action.payload.refresh_token ||
          action.payload.data?.refreshToken ||
          action.payload.data?.refresh_token;
        const sessionId =
          action.payload.session_id ||
          action.payload.sessionId ||
          action.payload.data?.session_id ||
          action.payload.data?.sessionId;

        state.user = userData;
        state.accessToken = token || null;
        state.isAuthenticated = Boolean(token);

        if (token) {
          localStorage.setItem("accessToken", token);
        } else {
          localStorage.removeItem("accessToken");
        }

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        } else {
          localStorage.removeItem("refreshToken");
        }

        if (sessionId) {
          localStorage.setItem("sessionId", sessionId);
        }

        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = unwrapUser(action.payload);
        state.user = userData;

        console.log("Fetched Current User:", userData); // Debugging line to check the fetched user data
        // Persist the updated getMe profile to LocalStorage
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Refresh Token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        const token =
          action.payload.accessToken ||
          action.payload.access_token ||
          action.payload.data?.accessToken ||
          action.payload.data?.access_token;

        state.accessToken = token || null;

        if (token) {
          localStorage.setItem("accessToken", token);
        }
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      })

      // Logout All
      .addCase(logoutAll.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });
  },
});

export const { clearAuth, clearAuthError, setCredentials } = authSlice.actions;

export default authSlice.reducer;