import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roleService } from "../../services/roleService";

// ===============================
// FETCH ROLES THUNK
// ===============================
export const fetchRolesThunk = createAsyncThunk(
  "roles/fetch",
  async (_, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;

      const data = await roleService.fetchRoles(token);

      if (!data?.status) {
        return thunkApi.rejectWithValue(
          data?.message || "Failed to fetch roles",
        );
      }
      //   console.log("Fetched roles:", data.data);

      return data.data || [];
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Failed to fetch roles");
    }
  },
);

// ===============================
// SLICE
// ===============================
const roleSlice = createSlice({
  name: "roles",
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })

      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roleSlice.reducer;
