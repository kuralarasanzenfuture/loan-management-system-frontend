import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCompanyDetails,
  getCompanyDetailById,
  createCompanyDetails,
  updateCompanyDetails,
  deleteCompanyDetails,
} from "./companyDetails.service.js";

// ─── Get Single Company (singleton) ───────────────────────────────────────────
export const fetchCompanyDetails = createAsyncThunk(
  "companyDetails/fetchCompanyDetails",
  async (_, { rejectWithValue }) => {
    try {
      return await getCompanyDetails();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ─── Get Company Detail By ID ──────────────────────────────────────────────────
export const fetchCompanyDetailById = createAsyncThunk(
  "companyDetails/fetchCompanyDetailById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCompanyDetailById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ─── Create Company Details ────────────────────────────────────────────────────
export const addCompanyDetails = createAsyncThunk(
  "companyDetails/addCompanyDetails",
  async (formData, { rejectWithValue }) => {
    try {
      return await createCompanyDetails(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// ─── Update Company Details ────────────────────────────────────────────────────
export const editCompanyDetails = createAsyncThunk(
  "companyDetails/editCompanyDetails",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateCompanyDetails(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// ─── Delete Company Details ────────────────────────────────────────────────────
export const removeCompanyDetails = createAsyncThunk(
  "companyDetails/removeCompanyDetails",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCompanyDetails(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const companyDetailsSlice = createSlice({
  name: "companyDetails",

  initialState: {
    /**
     * company: the singleton company record (object | null)
     * companyDetail: used when viewing by ID
     */
    company: null,
    companyDetail: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearCompanyDetailsError: (state) => {
      state.error = null;
    },
    clearSelectedCompanyDetail: (state) => {
      state.companyDetail = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch Singleton ───────────────────────────────────────────
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success: true, data: company | null }
        const payload = action.payload;
        state.company = payload?.data !== undefined ? payload.data : payload;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch By ID ───────────────────────────────────────────────
      .addCase(fetchCompanyDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetailById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.companyDetail = payload?.data !== undefined ? payload.data : payload;
      })
      .addCase(fetchCompanyDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Create ────────────────────────────────────────────────────
      .addCase(addCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success, message, data: company }
        const payload = action.payload;
        state.company = payload?.data !== undefined ? payload.data : payload;
      })
      .addCase(addCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update ────────────────────────────────────────────────────
      .addCase(editCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success, message, data: updatedCompany }
        const payload = action.payload;
        const updated = payload?.data !== undefined ? payload.data : payload;
        state.company = updated;
        if (state.companyDetail?.id === updated?.id) {
          state.companyDetail = updated;
        }
      })
      .addCase(editCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete ────────────────────────────────────────────────────
      .addCase(removeCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCompanyDetails.fulfilled, (state) => {
        state.loading = false;
        state.company = null;
        state.companyDetail = null;
      })
      .addCase(removeCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyDetailsError, clearSelectedCompanyDetail } =
  companyDetailsSlice.actions;

export default companyDetailsSlice.reducer;
