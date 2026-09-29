import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddClient() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
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
        const [platformsRes, usersRes] = await Promise.all([
          API.get("/platforms"),
          API.get("/users"),
        ]);
        setPlatforms(platformsRes.data.platforms || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load form data");
      }
    };
    load();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleArrayValue = (field, id) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((value) => value !== id)
        : [...prev[field], id],
    }));
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
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Add Client</h1>
        <p className="text-gray-500 mb-6">A client can belong to multiple service platforms and teams.</p>

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
            onToggle={(id) => toggleArrayValue("platforms", id)}
            subtitle={(item) => item.description}
          />

          <CheckboxGroup
            label="Responsible Team"
            items={users}
            selected={formData.teamMembers}
            onToggle={(id) => toggleArrayValue("teamMembers", id)}
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
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4"
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black" />
          </div>

          <div className="flex gap-3">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">Save Client</button>
            <button type="button" onClick={() => navigate("/clients")} className="bg-gray-100 px-6 py-3 rounded-xl font-semibold">Cancel</button>
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

export default AddClient;
