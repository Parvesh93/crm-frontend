import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddTask() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const preselectedProject = params.get("project") || "";

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(preselectedProject);
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          API.get("/projects"),
          API.get("/users"),
        ]);

        setProjects(projectsRes.data.projects || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load task form");
      }
    };

    load();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((item) => item._id === project),
    [projects, project]
  );

  const taskLines = useMemo(
    () =>
      taskText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [taskText]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!project) {
      setError("Please select a project");
      return;
    }

    if (taskLines.length === 0) {
      setError("Please add at least one task");
      return;
    }

    setSaving(true);

    try {
      await API.post("/tasks/bulk", {
        project,
        tasks: taskLines,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
      });

      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tasks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Add Multiple Tasks
          </h1>
          <p className="text-gray-500 mt-1">
            Choose the project once, then enter one task per line.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5"
        >
          <div>
            <label className="block mb-1 font-medium">Project *</label>

            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              required
            >
              <option value="">Select project</option>

              {projects.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                  {item.client?.name ? " - " + item.client.name : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p>
                <span className="text-gray-500">Client:</span>{" "}
                <strong>{selectedProject.client?.name || "-"}</strong>
              </p>

              <p className="mt-1">
                <span className="text-gray-500">Platform:</span>{" "}
                <strong>
                  {selectedProject.platform?.name ||
                    selectedProject.type ||
                    "-"}
                </strong>
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <label className="font-medium">Tasks *</label>

              <span className="text-sm text-gray-500">
                {taskLines.length} task{taskLines.length === 1 ? "" : "s"}
              </span>
            </div>

            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              rows="12"
              placeholder={"Fix mobile header\nUpdate homepage banner\nCheck cart drawer issue\nTest checkout flow"}
              className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-black leading-7"
            />

            <p className="text-xs text-gray-500 mt-2">
              Each new line becomes a separate task.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">Assignee</label>

              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="">Unassigned</option>

                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                    {user.designation ? " - " + user.designation : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Priority</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-sm text-gray-500">
              Status will automatically start as Pending.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="bg-gray-100 px-5 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={saving || taskLines.length === 0 || !project}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : `Create ${taskLines.length || ""} Task${taskLines.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddTask;
