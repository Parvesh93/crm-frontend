import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddProject() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    title: "",
    platform: "",
    teamMembers: [],
    budget: "",
    startDate: "",
    deadline: "",
    status: "Pending",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, platformsRes, usersRes] = await Promise.all([
          API.get("/clients"),
          API.get("/platforms"),
          API.get("/users"),
        ]);
        setClients(clientsRes.data.clients || []);
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

  const toggleTeamMember = (id) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(id)
        ? prev.teamMembers.filter((memberId) => memberId !== id)
        : [...prev.teamMembers, id],
    }));
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Add Project</h1>
        <p className="text-gray-500 mb-6">Assign a platform and the team responsible for this work.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-5">
          <Select label="Client *" name="client" value={formData.client} onChange={handleChange}>
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}{client.company ? ` - ${client.company}` : ""}
              </option>
            ))}
          </Select>

          <Input label="Project Title *" name="title" value={formData.title} onChange={handleChange} />

          <Select label="Platform / Service *" name="platform" value={formData.platform} onChange={handleChange}>
            <option value="">Select platform</option>
            {platforms.map((platform) => (
              <option key={platform._id} value={platform._id}>{platform.name}</option>
            ))}
          </Select>

          <div>
            <label className="block mb-2 font-medium">Assigned Team</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.teamMembers.includes(user._id)}
                    onChange={() => toggleTeamMember(user._id)}
                  />
                  <span>
                    <span className="block font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.designation || user.role}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Input label="Budget / Project Value" name="budget" type="number" value={formData.budget} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
            <Input label="Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
          </div>

          <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </Select>

          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black" />
          </div>

          <div className="flex gap-3">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">Save Project</button>
            <button type="button" onClick={() => navigate("/projects")} className="bg-gray-100 px-6 py-3 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return <div><label className="block mb-1 font-medium">{label}</label><input name={name} type={type} value={value} onChange={onChange} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black" /></div>;
}
function Select({ label, children, ...props }) {
  return <div><label className="block mb-1 font-medium">{label}</label><select {...props} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black">{children}</select></div>;
}

export default AddProject;
