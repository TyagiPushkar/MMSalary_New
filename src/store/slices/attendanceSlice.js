import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { attendanceService } from "../../services/attendanceService";
export const fetchAttendanceByOneDateThunk = createAsyncThunk(
  "attendance/fetchByOneDate",
  async ({ date }, thunkApi) => {
    try {
      const { user, token } = thunkApi.getState().auth;
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const result = await attendanceService.getAttendanceByOneDate({
        token,
        user,
        date: formattedDate,
      });
      // console.log("pardeeep bhai", date, ":", result.data);
      return result.data || [];
    } catch (error) {
      return thunkApi.rejectWithValue(error.message);
    }
  },
);

export const fetchAttendanceByDateThunk = createAsyncThunk(
  "attendance/fetchByDate",
  async ({ fromdate, todate }, thunkApi) => {
    try {
      const { user, token } = thunkApi.getState().auth;
      // console.log("Fetching attendance from", fromdate, "to", todate);
      const result = await attendanceService.getAttendanceByDate({
        token,
        user,
        from: fromdate,
        to: todate,
      });
      // console.log("pardeeep bhai export", fromdate, "to", todate, ":", result.data);
      return result.data || [];
    } catch (error) {
      return thunkApi.rejectWithValue(error.message);
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    items: [],
    range: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // .addCase(fetchAttendanceThunk.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchAttendanceThunk.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.items = action.payload;
      // })
      // .addCase(fetchAttendanceThunk.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      .addCase(fetchAttendanceByDateThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.range = [];
      })
      .addCase(fetchAttendanceByDateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.range = action.payload;
      })
      .addCase(fetchAttendanceByDateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.range = [];
      })
      .addCase(fetchAttendanceByOneDateThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(fetchAttendanceByOneDateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendanceByOneDateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      });
  },
});

export default attendanceSlice.reducer;
