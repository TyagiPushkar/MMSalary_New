import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import employeeReducer from './slices/employeeSlice'
import attendanceReducer from './slices/attendanceSlice'
import adminReducer from './slices/adminSlice'
import officeReducer from './slices/officeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    employees: employeeReducer,
    attendance: attendanceReducer,
    admins: adminReducer,
    offices: officeReducer,
  },
})
