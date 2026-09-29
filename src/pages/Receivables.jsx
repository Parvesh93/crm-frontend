import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, IndianRupee, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function Receivables() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalProjectValue: 0,
    totalReceived: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    overdueCount: 0,
    outstandingCount: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Outstanding");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/receivables");
        setRows(res.data.receivables || []);
        setSummary(res.data.summary || {});
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const haystack = [
        row.title,
        row.client?.name,
        row.client?.company,
        row.platform?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());

      let matchesStatus = true;

      if (statusFilter === "Outstanding") {
        matchesStatus = row.outstanding > 0;
      } else if (statusFilter === "Overdue") {
        matchesStatus = row.paymentStatus === "Overdue";
      } else if (statusFilter === "Paid") {
        matchesStatus = row.paymentStatus === "Paid";
      } else if (statusFilter === "Pending") {
        matchesStatus =
          row.paymentStatus === "Pending" ||
          row.paymentStatus === "Partially Paid";
      }

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receivables</h1>
          <p className="text-gray-500 mt-1">
            Track pending client payments, due dates, and overdue collections.
          </p>
        </div>

        <Link
          to="/add-payment"
          className="bg-black text-white px-4 py-2 rounded-xl self-start"
        >
          Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={IndianRupee}
          label="Outstanding"
          value={money(summary.totalOutstanding)}
          helper={summary.outstandingCount + " projects"}
        />

        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={money(summary.overdueAmount)}
          helper={summary.overdueCount + " overdue"}
        />

        <StatCard
          icon={CheckCircle2}
          label="Received"
          value={money(summary.totalReceived)}
          helper="Actual collections"
        />

        <StatCard
          icon={Clock}
          label="Project Value"
          value={money(summary.totalProjectValue)}
          helper="Total contracted value"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client or project..."
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5"
            >
              <option value="Outstanding">Outstanding</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending">Pending / Partial</option>
              <option value="Paid">Paid</option>
              <option value="All">All</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 whitespace-nowrap">
            {filteredRows.length} projects
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">Loading receivables...</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-gray-500">
            No receivables match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Client / Project</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Project Value</th>
                  <th className="px-6 py-4 font-medium">Received</th>
                  <th className="px-6 py-4 font-medium">Outstanding</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Payment Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold">{row.client?.name || "-"}</p>
                      <p className="text-sm text-gray-500">{row.title}</p>
                    </td>

                    <td className="px-6 py-4">
                      {row.platform?.name || "-"}
                    </td>

                    <td className="px-6 py-4">{money(row.projectValue)}</td>

                    <td className="px-6 py-4 text-green-700 font-medium">
                      {money(row.received)}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {money(row.outstanding)}
                    </td>

                    <td className="px-6 py-4">
                      {row.paymentDueDate
                        ? new Date(row.paymentDueDate).toLocaleDateString("en-IN")
                        : "Not set"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.paymentStatus}
                        overdueDays={row.overdueDays}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={"/projects/" + row._id}
                        className="text-sm font-medium underline"
                      >
                        View Project
                      </Link>
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

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon size={17} />
        {label}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{helper}</p>
    </div>
  );
}

function StatusBadge({ status, overdueDays }) {
  const classes = {
    Paid: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
    "Partially Paid": "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={
        "inline-flex px-3 py-1 rounded-full text-xs font-semibold " +
        (classes[status] || "bg-gray-100 text-gray-700")
      }
    >
      {status === "Overdue" && overdueDays
        ? overdueDays + " days overdue"
        : status}
    </span>
  );
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

export default Receivables;
