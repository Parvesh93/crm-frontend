import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function EditClient() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClient = async () => {
    try {
      const res = await API.get(`/clients/${id}`);

      const client = res.data.client;

      setFormData({
        name: client.name || "",
        company: client.company || "",
        email: client.email || "",
        phone: client.phone || "",
        website: client.website || "",
        serviceType: client.serviceType || "Shopify",
        status: client.status || "Lead",
        notes: client.notes || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
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
      await API.put(`/clients/${id}`, formData);

      navigate(`/clients/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update client");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Loading client...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        to={`/clients/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Client
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Edit Client
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
          <Input
            label="Client Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />

          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 font-medium">
              Service Type
            </label>

            <select
              name="serviceType"
              value={formData.serviceType}
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
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Lost">Lost</option>
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

          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">
              Update Client
            </button>

            <button
              type="button"
              onClick={() => navigate(`/clients/${id}`)}
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

export default EditClient;