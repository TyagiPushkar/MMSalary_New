import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { officeService } from "../../services/officeService";

// ===============================
// UPDATE OFFICE STATUS THUNK
// ===============================
export const updateOfficeStatusThunk = createAsyncThunk(
  "offices/updateStatus",
  async ({ officeId, isActive }, thunkApi) => {
    try {
      console.log(
        `Attempting to update status for office ${officeId} to ${isActive}`,
      );
      const { token } = thunkApi.getState().auth;
      const data = await officeService.updateOfficeStatus(
        officeId,
        isActive,
        token,
      );
      if (!data.status) {
        return thunkApi.rejectWithValue(data.message || "Status update failed");
      }
      return { officeId, isActive, ...data };
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Status update failed");
    }
  },
);

export const updateOfficeDetailsThunk = createAsyncThunk(
  "offices/updateDetails",
  async (payload, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const data = await officeService.updateOffice(payload, token);
      const succeeded =
        data === null ||
        data === undefined ||
        data.status === true ||
        data.status === 200 ||
        data.success === true;
      if (!succeeded) {
        return thunkApi.rejectWithValue(data?.message || "Update failed");
      }
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Update failed");
    }
  },
);

export const createOfficeThunk = createAsyncThunk(
  "offices/create",
  async (payload, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const data = await officeService.createOffice(payload, token);
      const succeeded =
        data === null ||
        data === undefined ||
        data.status === true ||
        data.status === 200 ||
        data.success === true;
      if (!succeeded) {
        return thunkApi.rejectWithValue(data?.message || "Creation failed");
      }
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Creation failed");
    }
  },
);

// ===============================
// FETCH OFFICES THUNK
// ===============================
export const fetchOfficesThunk = createAsyncThunk(
  "offices/fetchAll",
  async (_, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;

      const response = await officeService.getoffice({ token });

      // console.log("[Service Response]", response);

      if (!response.success) {
        return thunkApi.rejectWithValue(response.message);
      }
      // console.log("Office data fetched successfully:", response.data);
      return response.data || [];
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Request failed",
      );
    }
  },
);

export const fetchAllOfficesThunk = createAsyncThunk(
  "offices/fetchAllData",
  async (_, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const response = await officeService.getoffice({ token });

      if (!response.success) {
        return thunkApi.rejectWithValue(response.message);
      }
      return response.allData || [];
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Request failed",
      );
    }
  },
);

// ===============================
// SLICE
// ===============================
const officeSlice = createSlice({
  name: "offices",
  initialState: {
    items: [],
    allData: [],
    loading: false,
    error: null,
    statusUpdateLoading: false,
    statusUpdateError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchOfficesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOfficesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOfficesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOfficesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.allData = action.payload;
      })
      .addCase(fetchAllOfficesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // STATUS UPDATE
      .addCase(updateOfficeStatusThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateOfficeStatusThunk.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const { officeId, isActive } = action.payload;
        const office = state.allData.find((o) => o.id === officeId);
        if (office) {
          office.active_status = isActive ? 1 : 0;
        }
      })
      .addCase(updateOfficeStatusThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      })
      .addCase(updateOfficeDetailsThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateOfficeDetailsThunk.fulfilled, (state) => {
        state.statusUpdateLoading = false;
      })
      .addCase(updateOfficeDetailsThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      })
      .addCase(createOfficeThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(createOfficeThunk.fulfilled, (state) => {
        state.statusUpdateLoading = false;
      })
      .addCase(createOfficeThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      });
  },
});

export default officeSlice.reducer;
