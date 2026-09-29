import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Clock3,
  CalendarDays,
  UserRound,
  ListTodo,
} from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";
import useAuthStore from "../store/authStore";

function Tasks() {
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [timeFilter, setTimeFilter] = useState("Open");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, usersRes] = await Promise.all([
          API.get("/clients"),
          API.get("/users"),
        ]);
        setClients(clientsRes.data.clients || []);
        setUsers(usersRes.data.users || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTasks();
    load();
  }, []);

  const fetchProjectsByClient = async (clientId) => {
    try {
      const res = await API.get(`/projects/client/${clientId}`);
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    setSelectedProject("");
    setProjects([]);
    if (clientId) await fetchProjectsByClient(clientId);
  };

  const updateTask = async (taskId, patch) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, patch);
      setTasks((current) =>
        current.map((task) =>
          task._id === taskId
            ? { ...task, ...patch, ...(res.data.task || {}) }
            : task
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const isOverdue = (task) =>
    task.status !== "Completed" &&
    task.dueDate &&
    startOfDay(new Date(task.dueDate)) < today;

  const isDueToday = (task) =>
    task.status !== "Completed" &&
    task.dueDate &&
    startOfDay(new Date(task.dueDate)).getTime() === today.getTime();

  const summary = useMemo(
    () => ({
      open: tasks.filter((task) => task.status !== "Completed").length,
      mine: tasks.filter(
        (task) =>
          task.status !== "Completed" &&
          (task.assignedTo?._id || task.assignedTo) === user?._id
      ).length,
      overdue: tasks.filter(isOverdue).length,
      today: tasks.filter(isDueToday).length,
    }),
    [tasks, user?._id]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = [task.title, task.project?.title, task.project?.client?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesClient = selectedClient
        ? task.project?.client?._id === selectedClient
        : true;
      const matchesProject = selectedProject
        ? task.project?._id === selectedProject
        : true;
      const matchesStatus = selectedStatus
        ? task.status === selectedStatus
        : true;
      const matchesPriority = selectedPriority
        ? task.priority === selectedPriority
        : true;
      const matchesAssignee = selectedAssignee
        ? selectedAssignee === "unassigned"
          ? !task.assignedTo
          : (task.assignedTo?._id || task.assignedTo) === selectedAssignee
        : true;

      let matchesTime = true;
      if (timeFilter === "Open") matchesTime = task.status !== "Completed";
      if (timeFilter === "Mine")
        matchesTime =
          task.status !== "Completed" &&
          (task.assignedTo?._id || task.assignedTo) === user?._id;
      if (timeFilter === "Overdue") matchesTime = isOverdue(task);
      if (timeFilter === "Today") matchesTime = isDueToday(task);
      if (timeFilter === "Week")
        matchesTime =
          task.status !== "Completed" &&
          task.dueDate &&
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) < weekEnd;

      return (
        matchesSearch &&
        matchesClient &&
        matchesProject &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesTime
      );
    });
  }, [
    tasks,
    search,
    selectedClient,
    selectedProject,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    timeFilter,
    user?._id,
  ]);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Delivery workspace</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 mt-1">
            Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            See what needs attention and update work without opening every task.
          </p>
        </div>

        <Link
          to="/add-task"
          className="inline-flex self-start items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={17} />
          Add Multiple Tasks
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <SummaryCard icon={ListTodo} label="Open" value={summary.open} active={timeFilter === "Open"} onClick={() => setTimeFilter("Open")} />
        <SummaryCard icon={UserRound} label="My Tasks" value={summary.mine} active={timeFilter === "Mine"} onClick={() => setTimeFilter("Mine")} />
        <SummaryCard icon={Clock3} label="Overdue" value={summary.overdue} danger active={timeFilter === "Overdue"} onClick={() => setTimeFilter("Overdue")} />
        <SummaryCard icon={CalendarDays} label="Due Today" value={summary.today} active={timeFilter === "Today"} onClick={() => setTimeFilter("Today")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search task, project or client..."
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
              {[
                ["Open", "Open"],
                ["Mine", "My Tasks"],
                ["Today", "Today"],
                ["Week", "This Week"],
                ["Overdue", "Overdue"],
                ["All", "All"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTimeFilter(value)}
                  className={
                    "whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition " +
                    (timeFilter === value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
            <select value={selectedClient} onChange={handleClientChange} className="filter-select">
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>

            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={!selectedClient} className="filter-select disabled:bg-slate-50">
              <option value="">{selectedClient ? "All Projects" : "All Projects"}</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>

            <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="filter-select">
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((member) => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="filter-select">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="filter-select">
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-700">No tasks here.</p>
            <p className="text-sm text-slate-400 mt-1">Try another filter or add new tasks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50/80">
                <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                  <th className="px-5 py-3 font-semibold">Task</th>
                  <th className="px-5 py-3 font-semibold">Project</th>
                  <th className="px-5 py-3 font-semibold">Assignee</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Due</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const dueToday = isDueToday(task);
                  return (
                    <tr key={task._id} className={"border-b border-slate-100 hover:bg-slate-50/70 " + (overdue ? "bg-rose-50/30" : "")}>
                      <td className="px-5 py-4">
                        <Link to={`/tasks/${task._id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                          {task.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">
                          by {task.createdBy?.name || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">{task.project?.title || "-"}</p>
                        <p className="text-xs text-slate-400 mt-1">{task.project?.client?.name || ""}</p>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={task.assignedTo?._id || ""}
                          onChange={(e) => updateTask(task._id, { assignedTo: e.target.value || null })}
                          className="text-sm bg-transparent border-0 outline-none text-slate-700 max-w-[150px]"
                        >
                          <option value="">Unassigned</option>
                          {users.map((member) => (
                            <option key={member._id} value={member._id}>{member.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <span className={priorityClass(task.priority)}>{task.priority}</span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(task._id, { status: e.target.value })}
                          className={statusClass(task.status)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm">
                          <span className={overdue ? "font-semibold text-rose-600" : dueToday ? "font-semibold text-amber-600" : "text-slate-600"}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : "No date"}
                          </span>
                          {overdue && <p className="text-[11px] text-rose-500 mt-1">{daysOverdue(task.dueDate)} days overdue</p>}
                          {dueToday && <p className="text-[11px] text-amber-600 mt-1">Due today</p>}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link to={`/tasks/${task._id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => deleteTask(task._id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, active, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-left rounded-2xl border p-4 transition " +
        (active
          ? danger
            ? "bg-rose-50 border-rose-200"
            : "bg-white border-slate-900 shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300")
      }
    >
      <div className="flex items-center justify-between">
        <span className={"text-xs font-medium " + (danger ? "text-rose-600" : "text-slate-500")}>{label}</span>
        <Icon size={16} className={danger ? "text-rose-500" : "text-slate-400"} />
      </div>
      <p className={"text-2xl font-semibold mt-2 " + (danger ? "text-rose-700" : "text-slate-900")}>{value}</p>
    </button>
  );
}

function priorityClass(priority) {
  const base = "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ";
  if (priority === "High") return base + "bg-rose-50 text-rose-700";
  if (priority === "Medium") return base + "bg-amber-50 text-amber-700";
  return base + "bg-slate-100 text-slate-600";
}

function statusClass(status) {
  const base = "px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none border ";
  if (status === "Completed") return base + "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "In Progress") return base + "bg-blue-50 text-blue-700 border-blue-100";
  return base + "bg-slate-50 text-slate-600 border-slate-200";
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function daysOverdue(date) {
  const diff = startOfDay(new Date()).getTime() - startOfDay(new Date(date)).getTime();
  return Math.max(1, Math.floor(diff / 86400000));
}

export default Tasks;
