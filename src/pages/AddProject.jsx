import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddProject() {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/projects", {
        ...formData,
        budget: Number(formData.budget || 0),
      });

      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add project");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Add Project
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
              <option value="">Select client</option>

              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `- ${client.company}` : ""}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Project Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Shopify Store Redesign"
          />

          <div>
            <label className="block mb-1 font-medium">
              Project Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
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

          <Input
            label="Budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            placeholder="45000"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
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
              placeholder="Project requirements, scope, client notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
              Save Project
            </button>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="bg-gray-100 px-6 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
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
  placeholder = "",
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
        placeholder={placeholder}
        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black"
      />
    </div>
  );
}

export default AddProject;