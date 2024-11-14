
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";


const ProtectedRoute = ({ redirectPath = "/" }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Show loading spinner while verifying

  return user ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
