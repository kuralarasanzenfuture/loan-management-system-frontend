import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getHandLoans,
  getHandLoanById,
  createHandLoan,
  updateHandLoan,
  deleteHandLoan,
  addTransaction,
  getTransactionsByLoan,
} from "./handLoan.service.js";

// Get All Hand Loans
export const fetchHandLoans = createAsyncThunk(
  "handLoans/fetchHandLoans",
  async (_, { rejectWithValue }) => {
    try {
      return await getHandLoans();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Hand Loan By ID
export const fetchHandLoanById = createAsyncThunk(
  "handLoans/fetchHandLoanById",
  async (id, { rejectWithValue }) => {
    try {
      return await getHandLoanById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Hand Loan
export const addHandLoan = createAsyncThunk(
  "handLoans/addHandLoan",
  async (formData, { rejectWithValue }) => {
    try {
      return await createHandLoan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Hand Loan
export const editHandLoan = createAsyncThunk(
  "handLoans/editHandLoan",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateHandLoan(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Hand Loan
export const removeHandLoan = createAsyncThunk(
  "handLoans/removeHandLoan",
  async (id, { rejectWithValue }) => {
    try {
      await deleteHandLoan(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Add Transaction
export const addHandLoanTransaction = createAsyncThunk(
  "handLoans/addHandLoanTransaction",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await addTransaction(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Transactions By Loan
export const fetchHandLoanTransactions = createAsyncThunk(
  "handLoans/fetchHandLoanTransactions",
  async (id, { rejectWithValue }) => {
    try {
      return await getTransactionsByLoan(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const handLoanSlice = createSlice({
  name: "handLoans",

  initialState: {
    handLoans: [],
    handLoan: null,
    transactions: [],
    loading: false,
    error: null,
  },

  reducers: {
    clearHandLoanError: (state) => {
      state.error = null;
    },
    clearSelectedHandLoan: (state) => {
      state.handLoan = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchHandLoans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHandLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.handLoans = action.payload.data || action.payload;
      })
      .addCase(fetchHandLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchHandLoanById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHandLoanById.fulfilled, (state, action) => {
        state.loading = false;
        state.handLoan = action.payload.data || action.payload;
      })
      .addCase(fetchHandLoanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addHandLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHandLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.handLoans.unshift(action.payload.data || action.payload);
      })
      .addCase(addHandLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editHandLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(editHandLoan.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.handLoans.findIndex(
          (loan) => loan.id === updated.id,
        );

        if (index !== -1) {
          state.handLoans[index] = updated;
        }

        if (state.handLoan?.id === updated.id) {
          state.handLoan = updated;
        }
      })
      .addCase(editHandLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeHandLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeHandLoan.fulfilled, (state, action) => {
        state.loading = false;

        state.handLoans = state.handLoans.filter(
          (loan) => loan.id !== action.payload,
        );

        if (state.handLoan?.id === action.payload) {
          state.handLoan = null;
        }
      })
      .addCase(removeHandLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Transactions
      .addCase(fetchHandLoanTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHandLoanTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data || action.payload;
      })
      .addCase(fetchHandLoanTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Transaction
      .addCase(addHandLoanTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHandLoanTransaction.fulfilled, (state, action) => {
        state.loading = false;

        const transaction = action.payload.data || action.payload;

        state.transactions.unshift(transaction);

        if (state.handLoan?.id === transaction.loan_id) {
          state.handLoan = {
            ...state.handLoan,
            ...transaction.loan,
          };
        }
      })
      .addCase(addHandLoanTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHandLoanError, clearSelectedHandLoan, clearTransactions } =
  handLoanSlice.actions;

export default handLoanSlice.reducer;
