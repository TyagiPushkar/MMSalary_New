const TOKEN_KEY = 'mmsalary_token'
const USER_KEY = 'mmsalary_user'

export const storage = {
  saveSession(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clearSession() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  },
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
  },
  getUser() {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },
}
