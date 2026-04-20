import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NAV_ITEMS } from '../../constants/navigation'

function Sidebar() {
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)

  const allowedItems = NAV_ITEMS.filter((item) => item.types.includes(user?.type))

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="w-64 rounded-xl border border-slate-200 bg-white p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Navigation
      </p>
      <nav className="flex flex-col gap-1">
        {allowedItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
