import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    platforms: [],
    teamMembers: [],
    status: "Lead",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, platformsRes, usersRes] = await Promise.all([
          API.get(`/clients/${id}`),
          API.get("/platforms"),
          API.get("/users"),
        ]);
        const client = clientRes.data.client;
        setPlatforms(platformsRes.data.platforms || []);
        setUsers(usersRes.data.users || []);
        setFormData({
          name: client.name || "",
          company: client.company || "",
          email: client.email || "",
          phone: client.phone || "",
          website: client.website || "",
          platforms: (client.platforms || []).map((platform) => platform._id),
          teamMembers: (client.teamMembers || []).map((member) => member._id),
          status: client.status || "Lead",
          notes: client.notes || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load client");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
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
    return <DashboardLayout><div className="text-gray-500">Loading client...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Link to={`/clients/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6">
        <ArrowLeft size={16} /> Back to Client
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Client</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-5">
          <Input label="Client Name *" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
          <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Input label="Website" name="website" value={formData.website} onChange={handleChange} />

          <CheckboxGroup
            label="Platforms / Services"
            items={platforms}
            selected={formData.platforms}
            onToggle={(value) => toggleArrayValue("platforms", value)}
            subtitle={(item) => item.description}
          />

          <CheckboxGroup
            label="Responsible Team"
            items={users}
            selected={formData.teamMembers}
            onToggle={(value) => toggleArrayValue("teamMembers", value)}
            subtitle={(item) => item.designation || item.role}
          />

          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black">
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black" />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">Update Client</button>
            <button type="button" onClick={() => navigate(`/clients/${id}`)} className="bg-gray-100 px-6 py-3 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return <div><label className="block mb-1 font-medium">{label}</label><input name={name} type={type} value={value} onChange={onChange} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black" /></div>;
}

function CheckboxGroup({ label, items, selected, onToggle, subtitle }) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => (
          <label key={item._id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
            <input type="checkbox" checked={selected.includes(item._id)} onChange={() => onToggle(item._id)} />
            <span>
              <span className="block font-medium">{item.name}</span>
              {subtitle(item) && <span className="text-xs text-gray-500">{subtitle(item)}</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default EditClient;
