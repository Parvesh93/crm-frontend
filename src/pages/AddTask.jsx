import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";

function AddTask() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [projects, setProjects] = useState([]);

  const [selectedClient, setSelectedClient] =
    useState("");

  const [formData, setFormData] = useState({
    project: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const [error, setError] = useState("");

  // FETCH CLIENTS
  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");

      setClients(res.data.clients);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // FETCH PROJECTS FOR SELECTED CLIENT
  const fetchProjectsByClient = async (
    clientId
  ) => {
    try {
      const res = await API.get(
        `/projects/client/${clientId}`
      );

      setProjects(res.data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  // CLIENT CHANGE
  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSelectedClient(clientId);

    setFormData({
      ...formData,
      project: "",
    });

    if (clientId) {
      await fetchProjectsByClient(clientId);
    } else {
      setProjects([]);
    }
  };

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await API.post("/tasks", formData);

      navigate("/tasks");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Add Task
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4"
        >
          {/* CLIENT */}
          <div>
            <label className="block mb-1 font-medium">
              Client *
            </label>

            <select
              value={selectedClient}
              onChange={handleClientChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            >
              <option value="">
                Select client
              </option>

              {clients.map((client) => (
                <option
                  key={client._id}
                  value={client._id}
                >
                  {client.name}
                  {client.company
                    ? ` (${client.company})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* PROJECT */}
          <div>
            <label className="block mb-1 font-medium">
              Project *
            </label>

            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              disabled={!selectedClient}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black disabled:bg-gray-100"
            >
              <option value="">
                {selectedClient
                  ? "Select project"
                  : "Select client first"}
              </option>

              {projects.map((project) => (
                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}
          <Input
            label="Task Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          {/* DESCRIPTION */}
          <div>
            <label className="block mb-1 font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            />
          </div>

          {/* PRIORITY + STATUS + DATE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="Low">Low</option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
            Save Task
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="block mb-1 font-medium">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
      />
    </div>
  );
}

export default AddTask;