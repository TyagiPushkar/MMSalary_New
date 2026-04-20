import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            Menu
          </button>
          <h1 className="text-lg font-semibold text-slate-800">MMSalary Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium text-slate-700">{user?.name}</p>
            <p className="text-slate-500 capitalize">{user?.type}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
