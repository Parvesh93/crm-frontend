import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  Eye,
  Trash2,
} from "lucide-react";

import API from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState([]);
const [projects, setProjects] = useState([]);

const [selectedClient, setSelectedClient] = useState("");
const [selectedProject, setSelectedProject] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [selectedPriority, setSelectedPriority] = useState("");

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

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`);

      setTasks(
        tasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Delete failed"
      );
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

 const filteredTasks = tasks.filter((task) => {
  const matchesSearch =
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.project?.title?.toLowerCase().includes(search.toLowerCase());

  const matchesProject = selectedProject
    ? task.project?._id === selectedProject
    : true;

  const matchesStatus = selectedStatus
    ? task.status === selectedStatus
    : true;

  const matchesPriority = selectedPriority
    ? task.priority === selectedPriority
    : true;

  const matchesClient = selectedClient
  ? task.project?.client?._id === selectedClient
  : true;

  return (
    matchesSearch &&
    matchesClient &&
    matchesProject &&
    matchesStatus &&
    matchesPriority
  );
});

  const statusClass = (status) => {
    if (status === "Completed")
      return "bg-green-100 text-green-700";

    if (status === "In Progress")
      return "bg-blue-100 text-blue-700";

    return "bg-gray-100 text-gray-700";
  };

  const priorityClass = (priority) => {
    if (priority === "High")
      return "bg-red-100 text-red-700";

    if (priority === "Medium")
      return "bg-yellow-100 text-yellow-700";

    return "bg-gray-100 text-gray-700";
  };

  const handleClientFilterChange = async (e) => {
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
    alert(error.response?.data?.message || "Failed to update status");
  }
};

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tasks
          </h1>

          <p className="text-gray-500 mt-1">
            Manage project tasks, priorities, and progress.
          </p>
        </div>

        <Link
          to="/add-task"
          className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Add Task
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black"
            />
          </div>

          <p className="text-sm text-gray-500">
            {filteredTasks.length} tasks
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-gray-500">
            No tasks found.
          </div>
        ) : (

          

          <div className="overflow-x-auto">

<div className="p-5 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
  <select
    value={selectedClient}
    onChange={handleClientFilterChange}
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
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className="border border-gray-200 rounded-xl p-3 outline-none focus:border-black"
  >
    <option value="">All Status</option>
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>

  <select
    value={selectedPriority}
    onChange={(e) => setSelectedPriority(e.target.value)}
    className="border border-gray-200 rounded-xl p-3 outline-none focus:border-black"
  >
    <option value="">All Priority</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>
</div>

            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">
                    Task
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Project
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Priority
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Due Date
                  </th>

                  <th className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {task.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        Created by{" "}
                        {task.createdBy?.name || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      <div>
  <p>{task.project?.title || "-"}</p>
  <p className="text-sm text-gray-500">
    {task.project?.client?.name || ""}
  </p>
</div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
  <select
    value={task.status}
    onChange={(e) =>
      updateTaskStatus(task._id, e.target.value)
    }
    className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none border ${statusClass(
      task.status
    )}`}
  >
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>
</td>

                    <td className="px-6 py-4 text-gray-700">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Eye size={17} />
                        </Link>

                        <button
                          onClick={() =>
                            deleteTask(task._id)
                          }
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Tasks;