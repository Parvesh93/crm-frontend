import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function TaskKanban() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.tasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data.clients);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjectsByClient = async (clientId) => {
    try {
      const res = await API.get(`/projects/client/${clientId}`);
      setProjects(res.data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchClients();
  }, []);

  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSelectedClient(clientId);
    setSelectedProject("");
    setProjects([]);

    if (clientId) {
      await fetchProjectsByClient(clientId);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesClient = selectedClient
      ? task.project?.client?._id === selectedClient
      : true;

    const matchesProject = selectedProject
      ? task.project?._id === selectedProject
      : true;

    const matchesPriority = selectedPriority
      ? task.priority === selectedPriority
      : true;

    return matchesClient && matchesProject && matchesPriority;
  });

  const columns = ["Pending", "In Progress", "Completed"];

  const statusTheme = {
    Pending: {
      column: "bg-amber-50/60 border-amber-200",
      header: "text-amber-900",
      count: "bg-amber-100 text-amber-700",
      empty: "bg-amber-50 text-amber-500 border border-amber-100",
      card: "bg-white border-amber-200 hover:border-amber-300 hover:shadow-sm",
      select: "bg-amber-50 border-amber-200 text-amber-800 focus:border-amber-400",
      accent: "bg-amber-400",
    },
    "In Progress": {
      column: "bg-blue-50/60 border-blue-200",
      header: "text-blue-900",
      count: "bg-blue-100 text-blue-700",
      empty: "bg-blue-50 text-blue-500 border border-blue-100",
      card: "bg-white border-blue-200 hover:border-blue-300 hover:shadow-sm",
      select: "bg-blue-50 border-blue-200 text-blue-800 focus:border-blue-400",
      accent: "bg-blue-500",
    },
    Completed: {
      column: "bg-emerald-50/60 border-emerald-200",
      header: "text-emerald-900",
      count: "bg-emerald-100 text-emerald-700",
      empty: "bg-emerald-50 text-emerald-500 border border-emerald-100",
      card: "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-sm",
      select: "bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-400",
      accent: "bg-emerald-500",
    },
  };

  const priorityClass = (priority) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Loading board...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Task Board
          </h1>

          <p className="text-gray-500 mt-1">
            Manage task progress by client, project, and priority.
          </p>
        </div>

        <Link
          to="/add-task"
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          Add Task
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedClient}
          onChange={handleClientChange}
          className="border border-gray-200 rounded-xl p-3 outline-none focus:border-black"
        >
          <option value="">All Clients</option>

          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name}
              {client.company ? ` (${client.company})` : ""}
            </option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          disabled={!selectedClient}
          className="border border-gray-200 rounded-xl p-3 outline-none focus:border-black disabled:bg-gray-100"
        >
          <option value="">
            {selectedClient ? "All Projects" : "Select client first"}
          </option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="border border-gray-200 rounded-xl p-3 outline-none focus:border-black"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
      </div>

      {/* BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column
          );

          const theme = statusTheme[column];

          return (
            <div
              key={column}
              className={`border rounded-2xl p-5 transition ${theme.column}`}
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.accent}`} />
                  <h2 className={`font-semibold text-lg ${theme.header}`}>
                    {column}
                  </h2>
                </div>

                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme.count}`}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-4">
                {columnTasks.length === 0 ? (
                  <div className={`text-sm rounded-xl p-4 ${theme.empty}`}>
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`relative overflow-hidden border rounded-xl p-4 transition ${theme.card}`}
                    >
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`}
                      />
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <Link
                            to={`/tasks/${task._id}`}
                            className="font-semibold hover:underline"
                          >
                            {task.title}
                          </Link>

                          <p className="text-sm text-gray-500 mt-1">
                            {task.project?.title || "-"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {task.project?.client?.name || ""}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500">
                          {task.assignedTo?.name ? `Assigned to ${task.assignedTo.name}` : "Unassigned"}
                        </span>
                        <span className={
                          task.status !== "Completed" &&
                          task.dueDate &&
                          new Date(task.dueDate) < new Date()
                            ? "font-semibold text-red-600"
                            : "text-gray-500"
                        }>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-IN")
                            : "No due date"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatus(task._id, e.target.value)
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition ${theme.select}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export default TaskKanban;