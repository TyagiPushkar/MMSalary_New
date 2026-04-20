import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'
import { storage } from '../../utils/storage'

const token = storage.getToken()
const normalizeUserType = (incomingUser) => {
  if (!incomingUser) {
    return null
  }

  return {
    ...incomingUser,
    type: incomingUser.type || incomingUser.role || 'normal',
  }
}

const user = normalizeUserType(storage.getUser())

export const loginThunk = createAsyncThunk('auth/login', async (payload, thunkApi) => {
  const response = await authService.login(payload)
  if (!response.status) {
    return thunkApi.rejectWithValue(response.message)
  }
  return response
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      storage.clearSession()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = normalizeUserType(action.payload.data)
        state.token = action.payload.token
        storage.saveSession(action.payload.token, state.user)
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
