import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from "./asset.service.js";

// Get All Assets
export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAssets(params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Get Asset By ID
export const fetchAssetById = createAsyncThunk(
  "assets/fetchAssetById",
  async (id, { rejectWithValue }) => {
    try {
      return await getAssetById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Create Asset
export const addAsset = createAsyncThunk(
  "assets/addAsset",
  async (formData, { rejectWithValue }) => {
    try {
      return await createAsset(formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    }
  },
);

// Update Asset
export const editAsset = createAsyncThunk(
  "assets/editAsset",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateAsset(id, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

// Delete Asset
export const removeAsset = createAsyncThunk(
  "assets/removeAsset",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAsset(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const assetSlice = createSlice({
  name: "assets",

  initialState: {
    assets: [],
    asset: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearAssetError: (state) => {
      state.error = null;
    },

    clearSelectedAsset: (state) => {
      state.asset = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data || action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.asset = action.payload.data || action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addAsset.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.unshift(action.payload.data || action.payload);
      })
      .addCase(addAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(editAsset.pending, (state) => {
        state.loading = true;
      })
      .addCase(editAsset.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.data || action.payload;

        const index = state.assets.findIndex((item) => item.id === updated.id);

        if (index !== -1) {
          state.assets[index] = updated;
        }

        if (state.asset?.id === updated.id) {
          state.asset = updated;
        }
      })
      .addCase(editAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(removeAsset.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAsset.fulfilled, (state, action) => {
        state.loading = false;

        state.assets = state.assets.filter(
          (item) => item.id !== action.payload,
        );

        if (state.asset?.id === action.payload) {
          state.asset = null;
        }
      })
      .addCase(removeAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssetError, clearSelectedAsset } = assetSlice.actions;

export default assetSlice.reducer;
