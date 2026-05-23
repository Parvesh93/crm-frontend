import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddClient() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    serviceType: "Shopify",
    status: "Lead",
    notes: "",
  });

  const [error, setError] = useState("");

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
      await API.post("/clients", formData);

      navigate("/clients");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add client");
    }
  };

  return (
    <DashboardLayout>
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Add Client</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Client Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="Rahul Sharma"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Company</label>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="RS Fashion Store"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email *</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Website</label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full border p-3 rounded"
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
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          >
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            rows="4"
            placeholder="Client requirements or discussion notes..."
          />
        </div>

        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-3 rounded font-semibold">
            Save Client
          </button>

          <button
            type="button"
            onClick={() => navigate("/clients")}
            className="bg-gray-200 px-6 py-3 rounded font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  );

  
}

export default AddClient;