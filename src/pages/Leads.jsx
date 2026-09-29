import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  CalendarClock,
  IndianRupee,
  UserRound,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

const STAGES = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

function Leads() {
  const [leads, setLeads] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ stages: [], total: {} });
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [platform, setPlatform] = useState("");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [leadRes, summaryRes, platformRes, userRes] = await Promise.all([
        API.get("/leads"),
        API.get("/leads/summary"),
        API.get("/platforms"),
        API.get("/users"),
      ]);
      setLeads(leadRes.data.leads || []);
      setSummary(summaryRes.data || {});
      setPlatforms(platformRes.data.platforms || []);
      setUsers(userRes.data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateLead = async (id, patch) => {
    try {
      const res = await API.put(`/leads/${id}`, patch);
      setLeads((current) =>
        current.map((lead) => (lead._id === id ? res.data.lead : lead))
      );
      const summaryRes = await API.get("/leads/summary");
      setSummary(summaryRes.data || {});
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update lead");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await API.delete(`/leads/${id}`);
      setLeads((current) => current.filter((lead) => lead._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const haystack = [
        lead.name,
        lead.company,
        lead.email,
        lead.phone,
        lead.platform?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(search.toLowerCase()) &&
        (!stage || lead.stage === stage) &&
        (!platform || lead.platform?._id === platform) &&
        (!owner || lead.owner?._id === owner)
      );
    });
  }, [leads, search, stage, platform, owner]);

  const followUpOverdue = (lead) =>
    lead.stage !== "Won" &&
    lead.stage !== "Lost" &&
    lead.nextFollowUp &&
    new Date(lead.nextFollowUp) < new Date();

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Sales pipeline</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 mt-1">
            Leads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track opportunities from first contact to project conversion.
          </p>
        </div>

        <Link
          to="/add-lead"
          className="inline-flex self-start items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={17} />
          Add Lead
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label="Pipeline Leads" value={summary.total?.count || 0} />
        <Stat label="Pipeline Value" value={money(summary.total?.value)} />
        <Stat label="Weighted Value" value={money(summary.total?.weightedValue)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mb-5">
        {STAGES.map((item) => {
          const row = (summary.stages || []).find((x) => x._id === item);
          return (
            <button
              key={item}
              onClick={() => setStage(stage === item ? "" : item)}
              className={
                "rounded-xl border p-3 text-left transition " +
                (stage === item
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 hover:border-slate-300")
              }
            >
              <p className="text-[11px] opacity-70">{item}</p>
              <p className="text-lg font-semibold mt-1">{row?.count || 0}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_190px_190px_190px] gap-3">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lead or company..."
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <select value={stage} onChange={(e) => setStage(e.target.value)} className="filter-select">
              <option value="">All Stages</option>
              {STAGES.map((item) => <option key={item}>{item}</option>)}
            </select>

            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="filter-select">
              <option value="">All Platforms</option>
              {platforms.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>

            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="filter-select">
              <option value="">All Owners</option>
              {users.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                  <th className="px-5 py-3 font-semibold">Lead</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Owner</th>
                  <th className="px-5 py-3 font-semibold">Stage</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                  <th className="px-5 py-3 font-semibold">Follow-up</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {lead.company || lead.email || lead.phone || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {lead.platform?.name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound size={14} />
                        {lead.owner?.name || "Unassigned"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={lead.stage}
                        onChange={(e) => updateLead(lead._id, { stage: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none"
                      >
                        {STAGES.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                        <IndianRupee size={13} />
                        {Number(lead.estimatedValue || 0).toLocaleString("en-IN")}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {lead.probability || 0}% probability
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className={
                        "inline-flex items-center gap-2 text-sm " +
                        (followUpOverdue(lead) ? "text-rose-600 font-semibold" : "text-slate-600")
                      }>
                        <CalendarClock size={14} />
                        {lead.nextFollowUp
                          ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN")
                          : "Not set"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link to={`/leads/${lead._id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                          <ArrowUpRight size={16} />
                        </Link>
                        <button onClick={() => deleteLead(lead._id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500">
                          <Trash2 size={16} />
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

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

export default Leads;
