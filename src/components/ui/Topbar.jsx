import {
  Bell,
  Search,
  Plus,
  Menu,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const pageTitles = {
  "/dashboard": "Overview",
  "/clients": "Clients",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/task-board": "Task Board",
  "/earnings": "Earnings",
  "/receivables": "Receivables",
  "/ai-task-generator": "AI Tasks",
  "/users": "Team",
  "/settings": "Settings",
};

function Topbar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const exactTitle = pageTitles[location.pathname];
  const matchedTitle =
    exactTitle ||
    Object.entries(pageTitles).find(
      ([path]) =>
        path !== "/dashboard" && location.pathname.startsWith(path + "/")
    )?.[1] ||
    "Workspace";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[248px] z-30 h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-400">
              PP Design & Tech
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 truncate">
              {matchedTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:flex items-center gap-2 w-[260px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search workspace..."
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
              /
            </span>
          </div>

          <Link
            to="/add-task"
            className="hidden sm:inline-flex items-center gap-2 bg-[#111827] text-white px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            <Plus size={16} />
            Add Tasks
          </Link>

          <button className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
            <Bell size={17} className="text-slate-600" />
            <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>

          <button className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <ChevronDown size={14} className="hidden sm:block text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
