import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { officeService } from "../../services/officeService";

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

// ===============================
// SLICE
// ===============================
const officeSlice = createSlice({
  name: "offices",
  initialState: {
    items: [],
    loading: false,
    error: null,
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
      });
  },
});

export default officeSlice.reducer;
