import { useEffect, useState } from "react";

import API from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";

import StatCard from "../components/ui/StatCard";

import ClientChart from "../components/ui/ClientChart";

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    leadClients: 0,
    completedClients: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");

        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <StatCard
    title="Total Clients"
    value={stats.totalClients}
    subtitle="All registered clients"
  />

  <StatCard
    title="Active Projects"
    value={stats.activeProjects}
    subtitle="Projects currently running"
  />

  <StatCard
    title="Completed Projects"
    value={stats.completedProjects}
    subtitle="Successfully delivered"
  />

  <StatCard
    title="Revenue"
    value={`₹${Number(
      stats.totalRevenue || 0
    ).toLocaleString("en-IN")}`}
    subtitle="Total project value"
  />
</div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 mt-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Client Activity
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          CRM analytics and growth overview
        </p>

        <ClientChart />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;