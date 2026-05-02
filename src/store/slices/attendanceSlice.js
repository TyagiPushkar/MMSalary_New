import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { attendanceService } from "../../services/attendanceService";

// export const fetchAttendanceThunk = createAsyncThunk(
//   "attendance/fetchAll",
//   async (_, thunkApi) => {
//     try {
//       const { user, token } = thunkApi.getState().auth;
//       const result = await attendanceService.getAttendanceToday({
//         token,
//         user,
//       });
//       return result.data || [];
//     } catch (error) {
//       return thunkApi.rejectWithValue(error.message);
//     }
//   },
// );

export const fetchAttendanceByDateThunk = createAsyncThunk(
  "attendance/fetchByDate",
  async ({ date }, thunkApi) => {
    try {
      const { user, token } = thunkApi.getState().auth;
      const result = await attendanceService.getAttendanceByDate({
        token,
        user,
        date,
      });
      console.log("pardeeep", date, ":", result.data);
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
        state.items = [];
      })
      .addCase(fetchAttendanceByDateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendanceByDateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      });
  },
});

export default attendanceSlice.reducer;
