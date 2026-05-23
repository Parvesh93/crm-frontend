import useAuthStore from "../../store/authStore";

function Topbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
          {user?.name?.charAt(0)}
        </div>
      </div>
    </header>
  );
}

export default Topbar;