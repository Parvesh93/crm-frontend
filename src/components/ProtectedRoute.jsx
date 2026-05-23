import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import useAuthStore from "../store/authStore";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" />
    ;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Outlet />
      
    </div>
  );
}

export default ProtectedRoute;