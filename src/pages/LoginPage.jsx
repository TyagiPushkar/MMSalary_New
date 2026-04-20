import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginThunk } from '../store/slices/authSlice'

const defaultForm = { email: '', password: '' }
const logoUrl = 'http://www.trinityapplab.in/MnM/MnMLogo.png'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, loading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (token) {
      const redirectPath = location.state?.from?.pathname || '/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [token, navigate, location.state])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await dispatch(loginThunk(form))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="hidden items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-700 p-10 md:flex">
          <img src={logoUrl} alt="MMSalary logo" className="w-4/5 max-w-sm rounded-2xl bg-white/90 p-6" />
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-slate-800">Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue to MMSalary dashboard.</p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3">
                <svg
                  className="h-4 w-4 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7L10.295 11.862C11.302 12.534 12.698 12.534 13.705 11.862L21 7M5 19H19C20.105 19 21 18.105 21 17V7C21 5.895 20.105 5 19 5H5C3.895 5 3 5.895 3 7V17C3 18.105 3.895 19 5 19Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3">
                <svg
                  className="h-4 w-4 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 11V8C7 5.239 9.239 3 12 3C14.761 3 17 5.239 17 8V11M6 21H18C19.105 21 20 20.105 20 19V13C20 11.895 19.105 11 18 11H6C4.895 11 4 11.895 4 13V19C4 20.105 4.895 21 6 21Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
