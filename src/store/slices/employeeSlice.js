import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employeeService } from "../../services/employeeService";

export const fetchEmployeesThunk = createAsyncThunk(
  "employees/fetchAll",
  async (_, thunkApi) => {
    const { token, user } = thunkApi.getState().auth;
    const response = await employeeService.getEmployees({ token, user });
    return response.data;
  },
);

export const fetchRequestEmployeesThunk = createAsyncThunk(
  "employees/fetchRequest",
  async (_, thunkApi) => {
    const { token, user } = thunkApi.getState().auth;
    const response = await employeeService.getRequestEmployees({ token, user });
    return response.data;
  },
);

export const addEmployeeThunk = createAsyncThunk(
  "employees/add",
  async ({ payload, token,user}, thunkApi) => {
    // console.log("Adding employee with payload:", payload);
    const response = await employeeService.addRequestEmployees({
      payload,
      token,
      user
    });
    if (!response.success) {
      return thunkApi.rejectWithValue(response.message);
    }
    // Return the response data if it's an array, otherwise return the full response
    if (Array.isArray(response.data)) {
      return response.data[0];
    }
    return response;
  },
);

export const updateEmployeeDetailsThunk = createAsyncThunk(
  "employees/updateDetails",
  async (payload, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;
      const data = await employeeService.updateEmployeeDetails(payload, token);
      if (data.status !== 200) {
        return thunkApi.rejectWithValue(data.message || "Update failed");
      }
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Update failed");
    }
  },
);

export const updateEmployeeStatusThunk = createAsyncThunk(
  "employees/updateStatus",
  async ({ employeeid, status }, thunkApi) => {
    try {
      const { token } = thunkApi.getState().auth;

      const data = await employeeService.updateEmployeeStatus(
        employeeid,
        status,
        token,
      );

      // FIXED CHECK
      if (!data.status) {
        return thunkApi.rejectWithValue(data.message || "Status update failed");
      }

      return { employeeid, status, ...data };
    } catch (error) {
      return thunkApi.rejectWithValue(error.message || "Status update failed");
    }
  },
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    items: [],
    loading: false,
    error: null,
    requestItems: [],
    requestLoading: false,
    addLoading: false,
    addError: null,
    updateLoading: false,
    updateError: null,
    statusUpdateLoading: false,
    statusUpdateError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployeesThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchRequestEmployeesThunk.pending, (state) => {
        state.requestLoading = true;
      })
      .addCase(fetchRequestEmployeesThunk.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.requestItems = action.payload;
      })
      .addCase(fetchRequestEmployeesThunk.rejected, (state) => {
        state.requestLoading = false;
      })
      .addCase(addEmployeeThunk.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
      })
      .addCase(addEmployeeThunk.fulfilled, (state, action) => {
        state.addLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addEmployeeThunk.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload || "Unable to add employee";
      })
      .addCase(updateEmployeeDetailsThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEmployeeDetailsThunk.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateEmployeeDetailsThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Unable to update employee";
      })
      .addCase(updateEmployeeStatusThunk.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateEmployeeStatusThunk.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const { employeeId, isActive } = action.payload;
        const item = state.items.find(
          (emp) => emp.id === employeeId || emp.employeeid === employeeId,
        );
        if (item) {
          item.is_active = isActive ? 1 : 0;
        }
        const reqItem = state.requestItems.find(
          (emp) => emp.id === employeeId || emp.employeeid === employeeId,
        );
        if (reqItem) {
          reqItem.is_active = isActive ? 1 : 0;
        }
      })
      .addCase(updateEmployeeStatusThunk.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload || "Unable to update status";
      });
  },
});

export default employeeSlice.reducer;
