import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, Eye } from "lucide-react";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");
      setClients(res.data.clients);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      await API.delete(`/clients/${id}`);
      setClients(clients.filter((client) => client._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.company?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const badgeClass = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Lead") return "bg-blue-100 text-blue-700";
    if (status === "Completed") return "bg-purple-100 text-purple-700";
    if (status === "Lost") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-gray-500 mt-1">
            Manage leads, active clients, and completed accounts.
          </p>
        </div>

        <Link
          to="/add-client"
          className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Add Client
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black"
            />
          </div>

          <p className="text-sm text-gray-500">
            {filteredClients.length} clients
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-gray-500">No clients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created By</th>
                  <th className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {client.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {client.company || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {client.serviceType}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {client.createdBy?.name || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/clients/${client._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Eye size={17} />
                        </Link>

                        <button
                          onClick={() => deleteClient(client._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
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

export default Clients;