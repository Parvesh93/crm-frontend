import { useEffect, useState } from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  Flag,
} from "lucide-react";

import API from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";

function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/${id}`);

      setTask(res.data.task);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading task...
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Task not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {task.title}
            </h1>

            <p className="text-gray-500 mt-1">
              {task.project?.title || "-"}
            </p>
          </div>

          <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
            {task.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <InfoCard
            icon={FolderKanban}
            label="Project"
            value={task.project?.title || "-"}
          />

          <InfoCard
            icon={Flag}
            label="Priority"
            value={task.priority}
          />

          <InfoCard
            icon={Calendar}
            label="Due Date"
            value={
              task.dueDate
                ? new Date(
                    task.dueDate
                  ).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg">
            Description
          </h2>

          <p className="text-gray-600 mt-2 bg-gray-50 rounded-xl p-5">
            {task.description ||
              "No description added."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <Icon size={18} />
        {label}
      </div>

      <p className="font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}

export default TaskDetails;