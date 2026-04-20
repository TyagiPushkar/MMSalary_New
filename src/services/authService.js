import axios from 'axios'
import { fakeApi } from '../api/fakeApi'

const LOGIN_ENDPOINT =
  import.meta.env.VITE_LOGIN_ENDPOINT ||
  'https://namami-infotech.com/MMSalary/Login/login.php'

export const authService = {
  async login(credentials) {
    try {
      const payload = {
        email: credentials.email || '',
        password: credentials.password || '',
      }

      const response = await axios.post(LOGIN_ENDPOINT, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.data
    } catch {
      // Fallback keeps local development working if API is unavailable/CORS-blocked.
      return fakeApi.login(credentials)
    }
  },
}
