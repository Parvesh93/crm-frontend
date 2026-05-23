import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AITaskGenerator() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [projectType, setProjectType] = useState("Shopify");
  const [projectGoal, setProjectGoal] = useState("");

  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

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

  const fetchProjectsByClient = async (clientId) => {
    try {
      const res = await API.get(`/projects/client/${clientId}`);
      setProjects(res.data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSelectedClient(clientId);
    setSelectedProject("");
    setProjects([]);

    if (clientId) {
      await fetchProjectsByClient(clientId);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    const project = projects.find((p) => p._id === projectId);

    if (project?.type) {
      setProjectType(project.type);
    }
  };

  const generateTasks = async (e) => {
    e.preventDefault();

    setError("");
    setGeneratedTasks([]);

    if (!selectedProject) {
      setError("Please select a project first");
      return;
    }

    if (!projectGoal.trim()) {
      setError("Please enter project goal");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/ai/generate-tasks", {
        projectType,
        projectGoal,
      });

      setGeneratedTasks(res.data.tasks);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to generate tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateGeneratedTask = (index, field, value) => {
    const updatedTasks = [...generatedTasks];

    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value,
    };

    setGeneratedTasks(updatedTasks);
  };

  const removeGeneratedTask = (index) => {
    setGeneratedTasks(
      generatedTasks.filter((_, i) => i !== index)
    );
  };

  const saveTasks = async () => {
    if (!selectedProject) {
      setError("Please select a project");
      return;
    }

    if (generatedTasks.length === 0) {
      setError("No tasks to save");
      return;
    }

    try {
      setSaving(true);
      setError("");

      for (const task of generatedTasks) {
        await API.post("/tasks", {
          project: selectedProject,
          title: task.title,
          description: task.description,
          priority: task.priority || "Medium",
          status: "Pending",
        });
      }

      alert("AI tasks saved successfully!");

      setGeneratedTasks([]);
      setProjectGoal("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save tasks"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Task Generator
          </h1>

          <p className="text-gray-500 mt-1">
            Generate project tasks automatically using AI.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE FORM */}
          <form
            onSubmit={generateTasks}
            className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">
                Client *
              </label>

              <select
                value={selectedClient}
                onChange={handleClientChange}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="">Select client</option>

                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                    {client.company
                      ? ` (${client.company})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Project *
              </label>

              <select
                value={selectedProject}
                onChange={handleProjectChange}
                disabled={!selectedClient}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {selectedClient
                    ? "Select project"
                    : "Select client first"}
                </option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Project Type
              </label>

              <select
                value={projectType}
                onChange={(e) =>
                  setProjectType(e.target.value)
                }
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="Shopify">Shopify</option>
                <option value="WordPress">WordPress</option>
                <option value="WooCommerce">WooCommerce</option>
                <option value="Laravel">Laravel</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Project Goal / Requirement *
              </label>

              <textarea
                rows="6"
                value={projectGoal}
                onChange={(e) =>
                  setProjectGoal(e.target.value)
                }
                placeholder="Example: Build a premium fashion ecommerce store with filters, fast checkout, mobile optimization, and SEO setup."
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              />
            </div>

            <button
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Tasks"}
            </button>
          </form>

          {/* RIGHT SIDE INFO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              How it works
            </h2>

            <div className="space-y-4 mt-5 text-gray-600">
              <p>
                1. Select the client and project.
              </p>

              <p>
                2. Describe the project requirement clearly.
              </p>

              <p>
                3. AI creates practical development tasks.
              </p>

              <p>
                4. Review, edit, remove, then save tasks.
              </p>
            </div>
          </div>
        </div>

        {/* GENERATED TASKS */}
        {generatedTasks.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Generated Tasks
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Review and edit before saving.
                </p>
              </div>

              <button
                onClick={saveTasks}
                disabled={saving}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save All Tasks"}
              </button>
            </div>

            <div className="space-y-4">
              {generatedTasks.map((task, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex justify-between gap-4">
                    <input
                      value={task.title}
                      onChange={(e) =>
                        updateGeneratedTask(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      className="font-semibold text-lg w-full outline-none"
                    />

                    <button
                      onClick={() => removeGeneratedTask(index)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={task.description}
                    onChange={(e) =>
                      updateGeneratedTask(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full mt-2 text-gray-600 outline-none resize-none"
                    rows="2"
                  />

                  <div className="mt-3">
                    <select
                      value={task.priority || "Medium"}
                      onChange={(e) =>
                        updateGeneratedTask(
                          index,
                          "priority",
                          e.target.value
                        )
                      }
                      className="border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AITaskGenerator;