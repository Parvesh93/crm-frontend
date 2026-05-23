import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Bot,
  Settings,
  Columns3,
  UserCog,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Clients",
      icon: Users,
      path: "/clients",
    },
    {
      name: "Projects",
      icon: Briefcase,
      path: "/projects",
    },
    {
      name: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
  name: "AI Tasks",
  icon: Bot,
  path: "/ai-task-generator",
},
{
  name: "Task Board",
  icon: Columns3,
  path: "/task-board",
},
{
  name: "Users",
  icon: UserCog,
  path: "/users",
},
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-5">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          ClientAI
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Smart CRM Dashboard
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all
              
              ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />

              <span className="font-small">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;