import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const [projectRes, clientsRes, platformsRes, usersRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get("/clients"),
          API.get("/platforms"),
          API.get("/users"),
        ]);
        const project = projectRes.data.project;
        setClients(clientsRes.data.clients || []);
        setPlatforms(platformsRes.data.platforms || []);
        setUsers(usersRes.data.users || []);
        setFormData({
          client: project.client?._id || "",
          title: project.title || "",
          platform: project.platform?._id || "",
          teamMembers: (project.teamMembers || []).map((member) => member._id),
          budget: project.budget || "",
          startDate: project.startDate ? project.startDate.split("T")[0] : "",
          deadline: project.deadline ? project.deadline.split("T")[0] : "",
          status: project.status || "Pending",
          notes: project.notes || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleTeamMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter((id) => id !== memberId)
        : [...prev.teamMembers, memberId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/projects/${id}`, {
        ...formData,
        budget: Number(formData.budget || 0),
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    }
  };

  if (loading) {
    return <DashboardLayout><div className="text-gray-500">Loading project...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6">
        <ArrowLeft size={16} /> Back to Project
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Project</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-5">
          <Select label="Client *" name="client" value={formData.client} onChange={handleChange}>
            {clients.map((client) => <option key={client._id} value={client._id}>{client.name}</option>)}
          </Select>

          <Input label="Project Title" name="title" value={formData.title} onChange={handleChange} />

          <Select label="Platform / Service" name="platform" value={formData.platform} onChange={handleChange}>
            <option value="">Select platform</option>
            {platforms.map((platform) => <option key={platform._id} value={platform._id}>{platform.name}</option>)}
          </Select>

          <div>
            <label className="block mb-2 font-medium">Assigned Team</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 cursor-pointer">
                  <input type="checkbox" checked={formData.teamMembers.includes(user._id)} onChange={() => toggleTeamMember(user._id)} />
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

          <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">Update Project</button>
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

export default EditProject;
