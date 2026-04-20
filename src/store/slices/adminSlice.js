import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminService } from "../../services/adminService";

export const fetchAllAdminsThunk = createAsyncThunk(
  "admins/fetchAll",
  async (_, thunkApi) => {
    const { token, user } = thunkApi.getState().auth;
    const response = await adminService.getAllAdmins({ token, user });

    // Ensure data is an array
    const dataArray = Array.isArray(response.data) ? response.data : [];

    console.log("[Admin Fetch] Received data:", dataArray);

    return dataArray;
  },
);

export const updateAdminStatusThunk = createAsyncThunk(
  "admins/updateStatus",
  async ({ adminId, isActive }, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const data = await adminService.updateAdminStatus(
        adminId,
        isActive,
        token,
      );
      if (!data.status) {
        return thunkApi.rejectWithValue(data.message || "Status update failed");
      }
      return { adminId, isActive, ...data };
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Status update failed");
    }
  },
);

export const updateAdminDetailsThunk = createAsyncThunk(
  "admins/updateDetails",
  async (payload, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const data = await adminService.updateAdminDetails(payload, token);
      if (data.status !== 200 && !data.success) {
        return thunkApi.rejectWithValue(data.message || "Update failed");
      }
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Update failed");
    }
  },
);

const adminSlice = createSlice({
  name: "admins",
  initialState: {
    items: [],
    loading: false,
    error: null,
    statusUpdateLoading: false,
    statusUpdateError: null,
    updateLoading: false,
    updateError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdminsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdminsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure payload is an array
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchAllAdminsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminStatusThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateAdminStatusThunk.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const { adminId, isActive } = action.payload;
        const admin = state.items.find((a) => a.adminid === adminId);
        if (admin) {
          // Store status as numeric value (0 or 1)
          admin.active_status = isActive ? 1 : 0;
        }
      })
      .addCase(updateAdminStatusThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload;
      })
      .addCase(updateAdminDetailsThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAdminDetailsThunk.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateAdminDetailsThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export default adminSlice.reducer;
