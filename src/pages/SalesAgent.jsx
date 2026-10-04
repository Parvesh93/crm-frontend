import { useEffect, useState } from "react";
import {
  Bot,
  Play,
  RefreshCw,
  Search,
  Mail,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function SalesAgent() {
  const [data, setData] = useState({
    config: {},
    latest: null,
    recentRuns: [],
  });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/sales-agent/status");
      setData(res.data || {});
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load Sales Agent"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const runAgent = async () => {
    if (
      !window.confirm(
        "Sync qualified leads from the Google Sheet into PPDT CRM now?"
      )
    ) {
      return;
    }

    try {
      setStarting(true);
      setMessage("");
      const res = await API.post("/sales-agent/run");
      setMessage(res.data?.message || "Sales Agent started");
      setTimeout(load, 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to start Sales Agent"
      );
    } finally {
      setStarting(false);
    }
  };

  const config = data.config || {};
  const latest = data.latest;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Bot size={17} />
            Lead sync automation
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 mt-1">
            Sales Agent
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Imports qualified prospects from the PPDT lead spreadsheet into the CRM, removes duplicates and keeps the sales pipeline in sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={runAgent}
            disabled={starting || latest?.status === "running"}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <Play size={16} />
            {latest?.status === "running"
              ? "Sync Running"
              : starting
              ? "Starting..."
              : "Sync Leads"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatusCard
          icon={Search}
          label="Google Sheet"
          value={config.sheetsConfigured ? "Connected" : "Not configured"}
          detail={config.sheetName || "Leads"}
          ok={config.sheetsConfigured}
        />
        <StatusCard
          icon={Mail}
          label="Import Trigger"
          value={config.sourceStatus || "Qualified - not contacted"}
          detail={"After import: " + (config.importedStatus || "Imported to CRM")}
          ok
        />
        <StatusCard
          icon={Clock3}
          label="Daily Automation"
          value={config.enabled ? "Enabled" : "Disabled"}
          detail={
            (config.dailyHour ?? 10) +
            ":00 " +
            (config.timezone || "Asia/Kolkata")
          }
          ok={config.enabled}
        />
        <StatusCard
          icon={Target}
          label="Markets"
          value={(config.markets || []).length + " markets"}
          detail={(config.markets || []).join(", ") || "-"}
          ok
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-5 mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Latest Run
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Current or most recent prospecting activity.
              </p>
            </div>

            {latest && (
              <span
                className={
                  "px-2.5 py-1 rounded-full text-xs font-semibold " +
                  statusClass(latest.status)
                }
              >
                {latest.status}
              </span>
            )}
          </div>

          {!latest ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No Sales Agent runs yet.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Metric label="Rows reviewed" value={latest.found || 0} />
                <Metric label="Rows with email" value={latest.withEmail || 0} />
                <Metric label="Eligible" value={latest.qualified || 0} />
                <Metric label="Imported to CRM" value={latest.inserted || 0} />
                <Metric label="Duplicates" value={latest.duplicates || 0} />
                <Metric label="Rejected" value={latest.rejected || 0} />
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Started{" "}
                {latest.startedAt
                  ? new Date(latest.startedAt).toLocaleString("en-IN")
                  : "-"}
                {latest.completedAt &&
                  " • Completed " +
                    new Date(latest.completedAt).toLocaleString("en-IN")}
              </div>

              {latest.errors?.length > 0 && (
                <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <AlertCircle size={15} />
                    {latest.errors.length} issue(s)
                  </div>
                  <p className="text-xs text-rose-600 mt-1 line-clamp-3">
                    {latest.errors.join(" | ")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-900">
            Sheet Sync Rules
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Current Google Sheet import settings from the backend environment.
          </p>

          <InfoRow
            label="Sheet"
            value={config.sheetName || "Leads"}
          />
          <InfoRow
            label="Import status"
            value={config.sourceStatus || "Qualified - not contacted"}
          />
          <InfoRow
            label="Imported status"
            value={config.importedStatus || "Imported to CRM"}
          />
          <InfoRow
            label="Max rows per sync"
            value={config.maxRowsPerRun ?? 100}
          />

          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 leading-5">
            ChatGPT handles daily lead research and writes qualified prospects to the sheet. The CRM only imports those rows in Phase 1. Email sending and follow-ups will be enabled separately in Phase 2.
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-900">
            Run History
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading...</div>
        ) : (data.recentRuns || []).length === 0 ? (
          <div className="p-8 text-sm text-slate-400">
            No run history yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Run</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Found</th>
                  <th className="px-5 py-3">Qualified</th>
                  <th className="px-5 py-3">Added</th>
                  <th className="px-5 py-3">Duplicates</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentRuns || []).map((run) => (
                  <tr
                    key={run._id}
                    className="border-t border-slate-100 text-sm"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 capitalize">
                        {run.trigger} run
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(run.createdAt).toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-xs font-semibold " +
                          statusClass(run.status)
                        }
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{run.found || 0}</td>
                    <td className="px-5 py-4">{run.qualified || 0}</td>
                    <td className="px-5 py-4 font-semibold">
                      {run.inserted || 0}
                    </td>
                    <td className="px-5 py-4">{run.duplicates || 0}</td>
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

function StatusCard({ icon: Icon, label, value, detail, ok }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
          <Icon size={17} />
        </div>
        {ok ? (
          <CheckCircle2 size={17} className="text-emerald-500" />
        ) : (
          <AlertCircle size={17} className="text-amber-500" />
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 mt-4">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{detail}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 mt-1">{value}</p>
    </div>
  );
}

function statusClass(status) {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "failed") {
    return "bg-rose-50 text-rose-700";
  }
  return "bg-amber-50 text-amber-700";
}

export default SalesAgent;
