import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCompanyBanks,
  getCompanyBankById,
  createCompanyBank,
  updateCompanyBank,
  deleteCompanyBank,
  setPrimary,
} from "./companyBank.service.js";

// Helper for error messages
const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || "Something went wrong";

// Get All Company Banks
export const fetchCompanyBanks = createAsyncThunk(
  "companyBanks/fetchCompanyBanks",
  async (_, { rejectWithValue }) => {
    try {
      return await getCompanyBanks();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// Get Company Bank By ID
export const fetchCompanyBankById = createAsyncThunk(
  "companyBanks/fetchCompanyBankById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCompanyBankById(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// Create Company Bank
export const addCompanyBank = createAsyncThunk(
  "companyBanks/addCompanyBank",
  async (formData, { rejectWithValue }) => {
    try {
      return await createCompanyBank(formData);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// Update Company Bank
export const editCompanyBank = createAsyncThunk(
  "companyBanks/editCompanyBank",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateCompanyBank(id, formData);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// Delete Company Bank
export const removeCompanyBank = createAsyncThunk(
  "companyBanks/removeCompanyBank",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCompanyBank(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// Set Primary Company Bank
export const makePrimaryCompanyBank = createAsyncThunk(
  "companyBanks/makePrimaryCompanyBank",
  async (id, { rejectWithValue }) => {
    try {
      return await setPrimary(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const companyBankSlice = createSlice({
  name: "companyBanks",

  initialState: {
    companyBanks: [],
    companyBank: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearCompanyBankError: (state) => {
      state.error = null;
    },
    clearSelectedCompanyBank: (state) => {
      state.companyBank = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchCompanyBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.companyBanks = action.payload.data || action.payload;
      })
      .addCase(fetchCompanyBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchCompanyBankById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyBankById.fulfilled, (state, action) => {
        state.loading = false;
        state.companyBank = action.payload.data || action.payload;
        console.log("Fetched companyBank:", state.companyBank);
      })
      .addCase(fetchCompanyBankById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addCompanyBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyBank.fulfilled, (state, action) => {
        state.loading = false;
        const newBank = action.payload.data || action.payload;
        if (newBank.is_primary) {
          state.companyBanks = state.companyBanks.map((b) => ({
            ...b,
            is_primary: false,
          }));
        }
        state.companyBanks.unshift(newBank);
      })
      .addCase(addCompanyBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editCompanyBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCompanyBank.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        if (updated.is_primary) {
          state.companyBanks = state.companyBanks.map((b) => ({
            ...b,
            is_primary: b.id === updated.id,
          }));
        }

        const index = state.companyBanks.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.companyBanks[index] = updated;
        }

        if (state.companyBank?.id === updated.id) {
          state.companyBank = updated;
        }
      })
      .addCase(editCompanyBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Set Primary
      .addCase(makePrimaryCompanyBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makePrimaryCompanyBank.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        state.companyBanks = state.companyBanks.map((bank) => ({
          ...bank,
          is_primary: bank.id === updated.id,
        }));

        state.companyBank =
          state.companyBank?.id === updated.id ? updated : state.companyBank;
      })
      .addCase(makePrimaryCompanyBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeCompanyBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCompanyBank.fulfilled, (state, action) => {
        state.loading = false;
        state.companyBanks = state.companyBanks.filter(
          (item) => item.id !== action.payload,
        );

        if (state.companyBank?.id === action.payload) {
          state.companyBank = null;
        }
      })
      .addCase(removeCompanyBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyBankError, clearSelectedCompanyBank } =
  companyBankSlice.actions;

export default companyBankSlice.reducer;
