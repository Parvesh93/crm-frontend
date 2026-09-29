import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  Flag,
  UserRound,
  MessageSquare,
  Send,
} from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [taskRes, commentsRes] = await Promise.all([
        API.get(`/tasks/${id}`),
        API.get(`/tasks/${id}/comments`),
      ]);

      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status });

      setTask((current) => ({
        ...current,
        ...(res.data.task || {}),
        status,
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    const message = commentText.trim();

    if (!message) return;

    setCommentSaving(true);

    try {
      const res = await API.post(`/tasks/${id}/comments`, {
        message,
      });

      setComments((current) => [
        ...current,
        res.data.comment,
      ]);

      setCommentText("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentSaving(false);
    }
  };

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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {task.title}
              </h1>

              <p className="text-gray-500 mt-1">
                {task.project?.title || "-"}
              </p>
            </div>

            <select
              value={task.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold outline-none border border-gray-200"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
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
                  ? new Date(task.dueDate).toLocaleDateString("en-IN")
                  : "-"
              }
            />

            <InfoCard
              icon={UserRound}
              label="Assigned To"
              value={task.assignedTo?.name || "Unassigned"}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-lg">
              Description
            </h2>

            <p className="text-gray-600 mt-2 bg-gray-50 rounded-xl p-5">
              {task.description || "No description added."}
            </p>
          </div>
        </div>

        <aside className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-gray-500" />
              <h2 className="font-semibold">
                Comments
              </h2>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              The assignee is notified when a new comment is added.
            </p>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-5">
            {comments.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                No comments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {comment.createdBy?.name || "Team member"}
                      </p>

                      <span className="text-[11px] text-gray-400">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {comment.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={addComment}
            className="border-t border-gray-200 p-4"
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="3"
              placeholder="Add an update or comment..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-900 resize-none"
            />

            <div className="flex justify-end mt-3">
              <button
                disabled={commentSaving || !commentText.trim()}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                <Send size={15} />
                {commentSaving ? "Sending..." : "Add Comment"}
              </button>
            </div>
          </form>
        </aside>
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
