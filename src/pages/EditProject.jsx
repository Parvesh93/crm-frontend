import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import API from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";

function EditProject() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    client: "",
    title: "",
    type: "Shopify",
    budget: "",
    startDate: "",
    deadline: "",
    status: "Pending",
    notes: "",
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [projectRes, clientsRes] =
        await Promise.all([
          API.get(`/projects/${id}`),
          API.get("/clients"),
        ]);

      const project = projectRes.data.project;

      setClients(clientsRes.data.clients);

      setFormData({
        client: project.client?._id || "",
        title: project.title || "",
        type: project.type || "Shopify",
        budget: project.budget || "",
        startDate: project.startDate
          ? project.startDate.split("T")[0]
          : "",
        deadline: project.deadline
          ? project.deadline.split("T")[0]
          : "",
        status: project.status || "Pending",
        notes: project.notes || "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/projects/${id}`, {
        ...formData,
        budget: Number(formData.budget || 0),
      });

      navigate(`/projects/${id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update project"
      );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">
          Loading project...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        to={`/projects/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Edit Project
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
          <div>
            <label className="block mb-1 font-medium">
              Client *
            </label>

            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            >
              {clients.map((client) => (
                <option
                  key={client._id}
                  value={client._id}
                >
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          <Input
            label="Budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />

            <Input
              label="Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
            />
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
              <option value="Pending">Pending</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Review">Review</option>
              <option value="Completed">
                Completed
              </option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
            />
          </div>

          <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
            Update Project
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

export default EditProject;