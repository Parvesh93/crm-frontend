import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";
import useAuthStore from "../store/authStore";

function Projects() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super_admin";
  const [projects, setProjects] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projectsRes, platformsRes] = await Promise.all([
        API.get("/projects"),
        API.get("/platforms"),
      ]);
      setProjects(projectsRes.data.projects || []);
      setPlatforms(platformsRes.data.platforms || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((project) => project._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title?.toLowerCase().includes(search.toLowerCase()) ||
        project.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
        project.platform?.name?.toLowerCase().includes(search.toLowerCase()) ||
        project.type?.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform = !platformFilter || project.platform?._id === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [projects, search, platformFilter]);

  const badgeClass = (status) => {
    if (status === "Completed") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-700";
    if (status === "Review") return "bg-purple-100 text-purple-700";
    if (status === "On Hold") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500 mt-1">Separate work by platform, team, and status.</p>
        </div>
        <Link to="/add-project" className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={16} /> Add Project
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-black"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform._id} value={platform._id}>{platform.name}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 whitespace-nowrap">{filteredProjects.length} projects</p>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-gray-500">No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Team</th>
                  {isSuperAdmin && <th className="px-6 py-4 font-medium">Value</th>}
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{project.title}</p>
                      <p className="text-sm text-gray-500">Created by {project.createdBy?.name || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{project.client?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{project.platform?.name || project.type || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {(project.teamMembers || []).length
                        ? project.teamMembers.map((member) => member.name).join(", ")
                        : "-"}
                    </td>
                    {isSuperAdmin && <td className="px-6 py-4 text-gray-700">₹{Number(project.budget || 0).toLocaleString("en-IN")}</td>}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/projects/${project._id}`} className="p-2 rounded-lg hover:bg-gray-100"><Eye size={17} /></Link>
                        <button onClick={() => deleteProject(project._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Projects;
