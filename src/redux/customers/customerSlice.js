import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customer.service.js";

// Get All Customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllCustomers(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Customer By ID
export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCustomerById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Customer
export const addCustomer = createAsyncThunk(
  "customers/addCustomer",
  async (formData, { rejectWithValue }) => {
    try {
      return await createCustomer(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Customer
export const editCustomer = createAsyncThunk(
  "customers/editCustomer",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateCustomer(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Customer
export const removeCustomer = createAsyncThunk(
  "customers/removeCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCustomer(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    customer: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.customer = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data || action.payload;
        console.log("Fetched customers:", state.customers);
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Customer By ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload.data || action.payload;
        console.log("Fetched customer:", state.customer);
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Customer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.data || action.payload);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Customer
      .addCase(editCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.customers.findIndex(
          (customer) => customer.id === updated.id,
        );

        if (index !== -1) {
          state.customers[index] = updated;
        }

        if (state.customer?.id === updated.id) {
          state.customer = updated;
        }
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Customer
      .addCase(removeCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.loading = false;

        state.customers = state.customers.filter(
          (customer) => customer.id !== action.payload,
        );

        if (state.customer?.id === action.payload) {
          state.customer = null;
        }
      })
      .addCase(removeCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerError, clearSelectedCustomer } =
  customerSlice.actions;

export default customerSlice.reducer;
