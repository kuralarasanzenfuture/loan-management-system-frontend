import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getBankTransactions,
  getBankTransactionSummary,
  getBankTransactionById,
  getBankTransactionByNumber,
  createBankTransaction,
  reverseBankTransaction,
} from "./bankTransaction.service.js";

// Get All Transactions
export const fetchBankTransactions = createAsyncThunk(
  "bankTransactions/fetchBankTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getBankTransactions(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch transactions");
    }
  },
);

// Get Summary
export const fetchBankTransactionSummary = createAsyncThunk(
  "bankTransactions/fetchBankTransactionSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getBankTransactionSummary(params);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch summary");
    }
  },
);

// Get By ID
export const fetchBankTransactionById = createAsyncThunk(
  "bankTransactions/fetchBankTransactionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getBankTransactionById(id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch transaction");
    }
  },
);

// Get By Transaction Number
export const fetchBankTransactionByNumber = createAsyncThunk(
  "bankTransactions/fetchBankTransactionByNumber",
  async (transactionNo, { rejectWithValue }) => {
    try {
      return await getBankTransactionByNumber(transactionNo);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch transaction");
    }
  },
);

// Create Transaction
export const addBankTransaction = createAsyncThunk(
  "bankTransactions/addBankTransaction",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const result = await createBankTransaction(formData);
      // After create succeeds, refresh the transactions list
      dispatch(fetchBankTransactions({ company_bank_id: formData.company_bank_id }));
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  },
);

// Reverse Transaction
export const reverseTransaction = createAsyncThunk(
  "bankTransactions/reverseTransaction",
  async ({ id, company_bank_id }, { rejectWithValue, dispatch }) => {
    try {
      const result = await reverseBankTransaction(id);
      // After reversal, refresh the list so the reversed status and new entry appear
      dispatch(fetchBankTransactions({ company_bank_id }));
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to reverse transaction");
    }
  },
);

const bankTransactionSlice = createSlice({
  name: "bankTransactions",

  initialState: {
    bankTransactions: [],
    bankTransaction: null,
    summary: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearBankTransactionError: (state) => {
      state.error = null;
    },

    clearSelectedBankTransaction: (state) => {
      state.bankTransaction = null;
    },

    clearSummary: (state) => {
      state.summary = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch Transactions
      .addCase(fetchBankTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.bankTransactions = action.payload?.data || action.payload || [];
      })
      .addCase(fetchBankTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Summary
      .addCase(fetchBankTransactionSummary.pending, (state) => {
        // Don't set global loading for summary — it's a background fetch
      })
      .addCase(fetchBankTransactionSummary.fulfilled, (state, action) => {
        state.summary = action.payload?.data || action.payload;
      })
      .addCase(fetchBankTransactionSummary.rejected, (state, action) => {
        // Silently fail for summary
        console.warn("Summary fetch failed:", action.payload);
      })

      // Fetch By ID
      .addCase(fetchBankTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.bankTransaction = action.payload?.data || action.payload;
      })
      .addCase(fetchBankTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By Number
      .addCase(fetchBankTransactionByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankTransactionByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.bankTransaction = action.payload?.data || action.payload;
      })
      .addCase(fetchBankTransactionByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create — list is refreshed via dispatch(fetchBankTransactions) inside the thunk
      .addCase(addBankTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBankTransaction.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addBankTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reverse — list is refreshed via dispatch(fetchBankTransactions) inside the thunk
      .addCase(reverseTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reverseTransaction.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(reverseTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearBankTransactionError,
  clearSelectedBankTransaction,
  clearSummary,
} = bankTransactionSlice.actions;

export default bankTransactionSlice.reducer;
