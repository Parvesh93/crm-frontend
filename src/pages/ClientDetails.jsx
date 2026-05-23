import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, Briefcase, Edit } from "lucide-react";

import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function ClientDetails() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = async () => {
    try {
      const res = await API.get(`/clients/${id}`);
      setClient(res.data.client);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Loading client...</div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">Client not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {client.name}
            </h1>

            <p className="text-gray-500 mt-1">
              {client.company || "No company added"}
            </p>
          </div>

         <div className="flex items-center gap-3">
  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
    {client.status}
  </span>

  <Link
    to={`/clients/${client._id}/edit`}
    className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
  >
    <Edit size={16} />
    Edit
  </Link>
</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          <InfoCard icon={Mail} label="Email" value={client.email} />
          <InfoCard icon={Phone} label="Phone" value={client.phone || "-"} />
          <InfoCard icon={Globe} label="Website" value={client.website || "-"} />
          <InfoCard
            icon={Briefcase}
            label="Service Type"
            value={client.serviceType}
          />
        </div>

        <div className="mt-8">
          <h2 className="font-semibold text-lg">Notes</h2>

          <p className="text-gray-600 mt-2 bg-gray-50 rounded-xl p-5">
            {client.notes || "No notes added."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <Icon size={18} />
        {label}
      </div>

      <p className="font-semibold mt-2 break-all">{value}</p>
    </div>
  );
}

export default ClientDetails;