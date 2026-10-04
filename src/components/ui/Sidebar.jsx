import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ListTodo,
  Sparkles,
  Columns3,
  UserRoundCog,
  CircleDollarSign,
  WalletCards,
  Settings,
  Target,
  Bot,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const menuGroups = [
    {
      label: "Workspace",
      items: [
        { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        ...(["super_admin", "admin", "manager"].includes(user?.role) ? [{ name: "Leads", icon: Target, path: "/leads" }] : []),
        ...(user?.role === "super_admin" ? [{ name: "Sales Agent", icon: Bot, path: "/sales-agent" }] : []),
        { name: "Clients", icon: Users, path: "/clients" },
        { name: "Projects", icon: BriefcaseBusiness, path: "/projects" },
        { name: "Tasks", icon: ListTodo, path: "/tasks" },
        { name: "Task Board", icon: Columns3, path: "/task-board" },
      ],
    },
    {
      label: "Business",
      items: [
        ...(user?.role === "super_admin"
          ? [
              { name: "Earnings", icon: CircleDollarSign, path: "/earnings" },
              { name: "Receivables", icon: WalletCards, path: "/receivables" },
            ]
          : []),
        { name: "AI Tasks", icon: Sparkles, path: "/ai-task-generator" },
      ],
    },
    {
      label: "Manage",
      items: [
        { name: "Team", icon: UserRoundCog, path: "/users" },
        ...(user?.role === "super_admin" ? [{ name: "Settings", icon: Settings, path: "/settings" }] : []),
      ],
    },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path + "/"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[248px] flex-col bg-[#111827] text-white border-r border-white/5">
      <div className="h-[72px] flex items-center px-5 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white text-[#111827] flex items-center justify-center font-black text-sm tracking-tight">
            PP
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-tight truncate">
              PPDT CRM
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Business workspace
            </p>
          </div>
        </Link>
      </div>

      <nav className="app-sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={
                        "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition " +
                        (active
                          ? "bg-white text-[#111827] shadow-sm"
                          : "text-slate-300 hover:bg-white/7 hover:text-white")
                      }
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          size={17}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                        <span className="font-medium">{item.name}</span>
                      </span>

                      {active && <ChevronRight size={15} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#111827] flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate capitalize">
                {(user?.role || "").replaceAll("_", " ")}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
