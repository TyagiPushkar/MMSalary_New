import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute({ allowedTypes, children }) {
  const location = useLocation()
  const { user, token } = useSelector((state) => state.auth)

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/dashboard" replace />
  }

  return children || <Outlet />
}

export default ProtectedRoute
