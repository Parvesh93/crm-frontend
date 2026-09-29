import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function Earnings() {
  const [payments, setPayments] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [summary, setSummary] = useState({
    totalReceived: 0,
    totalAllocated: 0,
    unallocated: 0,
    paymentCount: 0,
    byPlatform: [],
    byTeam: [],
  });
  const [platformFilter, setPlatformFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const query = {};
    if (platformFilter) query.platform = platformFilter;
    if (from) query.from = from;
    if (to) query.to = to;
    return query;
  }, [platformFilter, from, to]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes, platformsRes] = await Promise.all([
        API.get("/payments", { params }),
        API.get("/payments/summary", { params }),
        API.get("/platforms"),
      ]);
      setPayments(paymentsRes.data.payments || []);
      setSummary(summaryRes.data || {});
      setPlatforms(platformsRes.data.platforms || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [platformFilter, from, to]);

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment entry?")) return;
    try {
      await API.delete(`/payments/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings & Payments</h1>
          <p className="text-gray-500 mt-1">Track actual money received and how it is allocated across your team.</p>
        </div>
        <Link to="/add-payment" className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 self-start">
          <Plus size={18} /> Record Payment
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5">
          <option value="">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform._id} value={platform._id}>{platform.name}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5" />
        {(platformFilter || from || to) && (
          <button onClick={() => { setPlatformFilter(""); setFrom(""); setTo(""); }}
            className="px-4 py-2.5 rounded-xl bg-gray-100">Clear Filters</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Stat label="Total Received" value={money(summary.totalReceived)} />
        <Stat label="Allocated to Team" value={money(summary.totalAllocated)} />
        <Stat label="Company / Unallocated" value={money(summary.unallocated)} />
        <Stat label="Payments" value={summary.paymentCount || 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Platform</h2>
          <div className="space-y-3">
            {(summary.byPlatform || []).length === 0 ? (
              <p className="text-gray-500">No payment data yet.</p>
            ) : summary.byPlatform.map((row) => (
              <div key={row._id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.payments} payment{row.payments === 1 ? "" : "s"}</p>
                </div>
                <p className="font-semibold">{money(row.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Team Earnings Allocation</h2>
          <div className="space-y-3">
            {(summary.byTeam || []).length === 0 ? (
              <p className="text-gray-500">No team allocations yet.</p>
            ) : summary.byTeam.map((row) => (
              <div key={row._id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.designation || row.role}</p>
                </div>
                <p className="font-semibold">{money(row.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Payment History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-gray-500">No payments recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Client / Project</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Team Allocation</th>
                  <th className="px-6 py-4 font-medium">Mode</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100">
                    <td className="px-6 py-4 text-gray-700">{new Date(payment.paymentDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{payment.client?.name || "-"}</p>
                      <p className="text-sm text-gray-500">{payment.project?.title || "-"}</p>
                    </td>
                    <td className="px-6 py-4">{payment.platform?.name || "-"}</td>
                    <td className="px-6 py-4 font-semibold">{money(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(payment.allocations || []).length
                        ? payment.allocations.map((a) => `${a.user?.name || "User"}: ${money(a.amount)}`).join(", ")
                        : "Company / unallocated"}
                    </td>
                    <td className="px-6 py-4">{payment.paymentMode}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deletePayment(payment._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={17} />
                      </button>
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

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default Earnings;
