// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";

// function ProtectedRoute({ allowedTypes, children }) {
//   const location = useLocation();
//   const { user, token } = useSelector((state) => state.auth);

//   if (!token || !user) {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   if (allowedTypes && !allowedTypes.includes(user.type)) {
//     return <Navigate to="/attendance" replace />;
//   }

//   return children || <Outlet />;
// }

// export default ProtectedRoute;
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ allowedTypes, children }) {
  const location = useLocation();
  
  // Add an isLoading flag to your auth state in Redux
  const { user, token, isLoading } = useSelector((state) => state.auth);

  // If the app is still fetching the user's session (e.g., from localStorage), show a loader
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with your own loading spinner component
  }

  // Only redirect if it's NOT loading and the user is actually not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role-based access control
  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/attendance" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;