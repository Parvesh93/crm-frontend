import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  User,
  Briefcase,
  Edit,
} from "lucide-react";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchProjectTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${id}`);
      setTasks(res.data.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchProjectTasks();
  }, [id]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task status");
    }
  };

  const generateSummary = async () => {
    try {
      setSummaryLoading(true);
      setAiSummary("");

      const res = await API.post("/ai/project-summary", {
        projectId: id,
      });

      setAiSummary(res.data.summary);
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to generate project summary",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Loading project...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Project not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.title}
            </h1>

            <p className="text-gray-500 mt-1">
              {project.client?.name}{" "}
              {project.client?.company ? `- ${project.client.company}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
              {project.status}
            </span>

            <Link
              to={`/projects/${project._id}/edit`}
              className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          <InfoCard
            icon={User}
            label="Client"
            value={project.client?.name || "-"}
          />

          <InfoCard
            icon={Briefcase}
            label="Project Type"
            value={project.type}
          />

          <InfoCard
            icon={IndianRupee}
            label="Budget"
            value={`₹${Number(project.budget || 0).toLocaleString("en-IN")}`}
          />

          <InfoCard
            icon={Calendar}
            label="Deadline"
            value={
              project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg">Notes</h2>

          <p className="text-gray-600 mt-2 bg-gray-50 rounded-xl p-5">
            {project.notes || "No notes added."}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold text-lg">Project Tasks</h2>
              <p className="text-sm text-gray-500">
                Tasks linked to this specific project.
              </p>
            </div>

            <Link
              to="/add-task"
              className="bg-black text-white px-4 py-2 rounded-xl text-sm"
            >
              Add Task
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-5 text-gray-500">
              No tasks added for this project yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description || "No description"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {task.priority}
                      </span>

                      <select
                        value={task.status}
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) =>
                          updateTaskStatus(task._id, e.target.value)
                        }
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

<div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <div>
      <h2 className="font-semibold text-lg">
        AI Project Summary
      </h2>

      <p className="text-sm text-gray-500">
        Generate a professional client update from project tasks.
      </p>
    </div>

    <button
      onClick={generateSummary}
      disabled={summaryLoading}
      className="bg-black text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60"
    >
      {summaryLoading ? "Generating..." : "Generate Summary"}
    </button>
  </div>

  {aiSummary && (
    <div className="bg-gray-50 rounded-xl p-5 whitespace-pre-wrap text-gray-700 leading-relaxed">
      {aiSummary}
    </div>
  )}
</div>

      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <Icon size={18} />
        {label}
      </div>

      <p className="font-semibold mt-2 break-all">{value}</p>
    </div>
  );
}

export default ProjectDetails;
