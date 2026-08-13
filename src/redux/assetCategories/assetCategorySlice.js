import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAssetCategories,
  getAssetCategoryById,
  createAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
} from "./assetCategory.service.js";

// Get All Asset Categories
export const fetchAssetCategories = createAsyncThunk(
  "assetCategories/fetchAssetCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await getAssetCategories();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Asset Category By ID
export const fetchAssetCategoryById = createAsyncThunk(
  "assetCategories/fetchAssetCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      return await getAssetCategoryById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Asset Category
export const addAssetCategory = createAsyncThunk(
  "assetCategories/addAssetCategory",
  async (formData, { rejectWithValue }) => {
    try {
      return await createAssetCategory(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Asset Category
export const editAssetCategory = createAsyncThunk(
  "assetCategories/editAssetCategory",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateAssetCategory(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Asset Category
export const removeAssetCategory = createAsyncThunk(
  "assetCategories/removeAssetCategory",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAssetCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const assetCategorySlice = createSlice({
  name: "assetCategories",

  initialState: {
    assetCategories: [],
    assetCategory: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearAssetCategoryError: (state) => {
      state.error = null;
    },
    clearSelectedAssetCategory: (state) => {
      state.assetCategory = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchAssetCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.assetCategories = action.payload.data || action.payload;
      })
      .addCase(fetchAssetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchAssetCategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssetCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.assetCategory = action.payload.data || action.payload;
      })
      .addCase(fetchAssetCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addAssetCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.assetCategories.unshift(action.payload.data || action.payload);
      })
      .addCase(addAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editAssetCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(editAssetCategory.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.assetCategories.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.assetCategories[index] = updated;
        }

        if (state.assetCategory?.id === updated.id) {
          state.assetCategory = updated;
        }
      })
      .addCase(editAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeAssetCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAssetCategory.fulfilled, (state, action) => {
        state.loading = false;

        state.assetCategories = state.assetCategories.filter(
          (item) => item.id !== action.payload,
        );

        if (state.assetCategory?.id === action.payload) {
          state.assetCategory = null;
        }
      })
      .addCase(removeAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssetCategoryError, clearSelectedAssetCategory } =
  assetCategorySlice.actions;

export default assetCategorySlice.reducer;
