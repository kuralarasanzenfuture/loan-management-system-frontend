import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllCustomerLoans,
  getCustomerLoanById,
  createCustomerLoan,
  updateCustomerLoan,
  deleteCustomerLoan,
  updateCustomerLoanStatus,
} from "./customerLoan.service.js";

// Get All Customer Loans
export const fetchCustomerLoans = createAsyncThunk(
  "customerLoans/fetchCustomerLoans",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllCustomerLoans(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Customer Loan By ID
export const fetchCustomerLoanById = createAsyncThunk(
  "customerLoans/fetchCustomerLoanById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCustomerLoanById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Customer Loan
export const addCustomerLoan = createAsyncThunk(
  "customerLoans/addCustomerLoan",
  async (formData, { rejectWithValue }) => {
    try {
      return await createCustomerLoan(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Customer Loan
export const editCustomerLoan = createAsyncThunk(
  "customerLoans/editCustomerLoan",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateCustomerLoan(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Update Customer Loan Status
export const editCustomerLoanStatus = createAsyncThunk(
  "customerLoans/editCustomerLoanStatus",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateCustomerLoanStatus(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Customer Loan
export const removeCustomerLoan = createAsyncThunk(
  "customerLoans/removeCustomerLoan",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCustomerLoan(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const customerLoanSlice = createSlice({
  name: "customerLoans",
  initialState: {
    customerLoans: [],
    customerLoan: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomerLoanError: (state) => {
      state.error = null;
    },
    clearSelectedCustomerLoan: (state) => {
      state.customerLoan = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchCustomerLoans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.customerLoans = action.payload.data || action.payload;
      })
      .addCase(fetchCustomerLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchCustomerLoanById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerLoanById.fulfilled, (state, action) => {
        state.loading = false;
        state.customerLoan = action.payload.data || action.payload;
      })
      .addCase(fetchCustomerLoanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addCustomerLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCustomerLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.customerLoans.unshift(action.payload.data || action.payload);
      })
      .addCase(addCustomerLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editCustomerLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCustomerLoan.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.customerLoans.findIndex(
          (loan) => loan.id === updated.id,
        );

        if (index !== -1) {
          state.customerLoans[index] = updated;
        }

        if (state.customerLoan?.id === updated.id) {
          state.customerLoan = updated;
        }
      })
      .addCase(editCustomerLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(editCustomerLoanStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCustomerLoanStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.customerLoans.findIndex(
          (loan) => loan.id === updated.id,
        );

        if (index !== -1) {
          state.customerLoans[index] = updated;
        }

        if (state.customerLoan?.id === updated.id) {
          state.customerLoan = updated;
        }
      })
      .addCase(editCustomerLoanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeCustomerLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCustomerLoan.fulfilled, (state, action) => {
        state.loading = false;

        state.customerLoans = state.customerLoans.filter(
          (loan) => loan.id !== action.payload,
        );

        if (state.customerLoan?.id === action.payload) {
          state.customerLoan = null;
        }
      })
      .addCase(removeCustomerLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerLoanError, clearSelectedCustomerLoan } =
  customerLoanSlice.actions;

export default customerLoanSlice.reducer;
