import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Navbar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="font-bold text-xl">
        ClientAI CRM
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/clients">Clients</Link>

        <span className="text-sm text-gray-300">
          {user?.name}
        </span>

        <button
          onClick={handleLogout}
          className="bg-white text-black px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;