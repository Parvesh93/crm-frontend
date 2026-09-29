import { useEffect, useState } from "react";
import {
  Users,
  BriefcaseBusiness,
  CircleDollarSign,
  WalletCards,
  CheckCircle2,
  ListTodo,
  ArrowUpRight,
  Plus,
  UserPlus,
  ReceiptIndianRupee,
  FolderPlus,
  Target,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    totalProjectValue: 0,
    totalOutstanding: 0,
    openTasks: 0,
    completedTasks: 0,
    recentProjects: [],
    recentPayments: [],
    openLeads: 0,
    pipelineValue: 0,
    weightedPipelineValue: 0,
    followUpsToday: 0,
    overdueFollowUps: 0,
    recentLeads: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const collectionRate =
    Number(stats.totalProjectValue || 0) > 0
      ? Math.min(
          100,
          (Number(stats.totalRevenue || 0) /
            Number(stats.totalProjectValue || 0)) *
            100
        )
      : 0;

  return (
    <DashboardLayout>
      <section className="mb-7 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Business snapshot
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            Everything important, in one place.
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Track clients, delivery, collections, and team activity across PPDT.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <QuickAction to="/add-lead" icon={Target} label="New Lead" />
          <QuickAction to="/add-client" icon={UserPlus} label="New Client" />
          <QuickAction to="/add-project" icon={FolderPlus} label="New Project" />
          <QuickAction to="/add-task" icon={Plus} label="Add Tasks" primary />
        </div>
      </section>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-500">
          Loading workspace...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Clients"
              value={stats.totalClients || 0}
              subtitle="Across all services"
              icon={Users}
            />

            <StatCard
              title="Active Projects"
              value={stats.activeProjects || 0}
              subtitle="Currently in delivery"
              icon={BriefcaseBusiness}
            />

            <StatCard
              title="Revenue Received"
              value={money(stats.totalRevenue)}
              subtitle="Actual collections"
              icon={CircleDollarSign}
            />

            <StatCard
              title="Outstanding"
              value={money(stats.totalOutstanding)}
              subtitle="Still to be collected"
              icon={WalletCards}
            />
          </section>

          <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MiniCard
              label="Open Leads"
              value={stats.openLeads || 0}
              helper="Active sales opportunities"
            />
            <MiniCard
              label="Pipeline Value"
              value={money(stats.pipelineValue)}
              helper="Potential business value"
            />
            <MiniCard
              label="Follow-ups Today"
              value={stats.followUpsToday || 0}
              helper="Sales actions due today"
            />
            <MiniCard
              label="Overdue Follow-ups"
              value={stats.overdueFollowUps || 0}
              helper="Need immediate attention"
              danger
            />
          </section>

          <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Sales pipeline
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Follow-ups and active opportunities that need attention.
                  </p>
                </div>

                <Link
                  to="/leads"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  Open pipeline
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SalesMetric
                  icon={Target}
                  label="Open Leads"
                  value={stats.openLeads || 0}
                />
                <SalesMetric
                  icon={CalendarClock}
                  label="Today"
                  value={stats.followUpsToday || 0}
                />
                <SalesMetric
                  icon={AlertTriangle}
                  label="Overdue"
                  value={stats.overdueFollowUps || 0}
                  danger
                />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FinanceMetric
                  label="Pipeline Value"
                  value={money(stats.pipelineValue)}
                />
                <FinanceMetric
                  label="Weighted Pipeline"
                  value={money(stats.weightedPipelineValue)}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Follow-ups
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Next sales conversations.
                  </p>
                </div>

                <Link
                  to="/leads"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  View all
                </Link>
              </div>

              {(stats.recentLeads || []).length === 0 ? (
                <EmptyState text="No active leads yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recentLeads.map((lead) => {
                    const overdue =
                      lead.nextFollowUp &&
                      new Date(lead.nextFollowUp) < new Date();

                    return (
                      <Link
                        key={lead._id}
                        to={"/leads/" + lead._id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {lead.company || "No company"} · {lead.stage}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={
                              "text-xs font-semibold " +
                              (overdue ? "text-rose-600" : "text-slate-600")
                            }
                          >
                            {lead.nextFollowUp
                              ? new Date(
                                  lead.nextFollowUp
                                ).toLocaleDateString("en-IN")
                              : "No follow-up"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {lead.owner?.name || "Unassigned"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Finance overview
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Project value versus actual money received.
                  </p>
                </div>

                <Link
                  to="/earnings"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  View earnings
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FinanceMetric
                  label="Project Value"
                  value={money(stats.totalProjectValue)}
                />
                <FinanceMetric
                  label="Received"
                  value={money(stats.totalRevenue)}
                />
                <FinanceMetric
                  label="Outstanding"
                  value={money(stats.totalOutstanding)}
                />
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Collection progress</span>
                  <span className="font-semibold text-slate-800">
                    {collectionRate.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: collectionRate + "%" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111827] text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Quick actions</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Common PPDT workflows.
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <ReceiptIndianRupee size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <DarkAction to="/add-payment" label="Record a payment" />
                <DarkAction to="/receivables" label="Review receivables" />
                <DarkAction to="/task-board" label="Open task board" />
                <DarkAction to="/settings" label="Manage earning rules" />
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ActivityPanel
              title="Recent projects"
              subtitle="Latest work added to the CRM"
              to="/projects"
            >
              {(stats.recentProjects || []).length === 0 ? (
                <EmptyState text="No projects yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recentProjects.map((project) => (
                    <Link
                      key={project._id}
                      to={"/projects/" + project._id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {project.client?.name || "No client"} ·{" "}
                          {project.platform?.name || project.type || "Service"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {money(project.budget)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {project.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ActivityPanel>

            <ActivityPanel
              title="Recent collections"
              subtitle="Latest payments received"
              to="/earnings"
            >
              {(stats.recentPayments || []).length === 0 ? (
                <EmptyState text="No payments recorded yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recentPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {payment.client?.name || "Client"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {payment.project?.title || "Project"} ·{" "}
                          {payment.paymentMode || "Payment"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-emerald-700">
                          +{money(payment.amount)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {payment.paymentDate
                            ? new Date(
                                payment.paymentDate
                              ).toLocaleDateString("en-IN")
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ActivityPanel>
          </section>

          <section className="mt-6 bg-white border border-slate-200/80 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Delivery health
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Current execution workload across projects and tasks.
                </p>
              </div>

              <Link
                to="/task-board"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
              >
                Open task board
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <HealthCard
                icon={ListTodo}
                label="Open tasks"
                value={stats.openTasks || 0}
              />
              <HealthCard
                icon={CheckCircle2}
                label="Completed tasks"
                value={stats.completedTasks || 0}
              />
              <HealthCard
                icon={BriefcaseBusiness}
                label="Projects in progress"
                value={stats.activeProjects || 0}
              />
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}

function QuickAction({ to, icon: Icon, label, primary }) {
  return (
    <Link
      to={to}
      className={
        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition " +
        (primary
          ? "bg-[#111827] text-white hover:bg-slate-800"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")
      }
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

function MiniCard({ label, value, helper, danger }) {
  return (
    <div
      className={
        "border rounded-2xl px-5 py-4 " +
        (danger
          ? "bg-rose-50 border-rose-100"
          : "bg-white border-slate-200/80")
      }
    >
      <p className={"text-xs font-medium " + (danger ? "text-rose-600" : "text-slate-500")}>
        {label}
      </p>
      <p className={"text-xl font-semibold tracking-tight mt-1.5 " + (danger ? "text-rose-700" : "text-slate-900")}>
        {value}
      </p>
      <p className={"text-[11px] mt-1 " + (danger ? "text-rose-400" : "text-slate-400")}>
        {helper}
      </p>
    </div>
  );
}

function SalesMetric({ icon: Icon, label, value, danger }) {
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (danger
          ? "bg-rose-50 border-rose-100"
          : "bg-slate-50 border-slate-100")
      }
    >
      <div className="flex items-center justify-between">
        <p className={"text-xs " + (danger ? "text-rose-600" : "text-slate-500")}>
          {label}
        </p>
        <Icon size={16} className={danger ? "text-rose-500" : "text-slate-400"} />
      </div>
      <p className={"text-2xl font-semibold mt-2 " + (danger ? "text-rose-700" : "text-slate-900")}>
        {value}
      </p>
    </div>
  );
}

function FinanceMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function DarkAction({ to, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] px-4 py-3 text-sm transition"
    >
      <span>{label}</span>
      <ArrowUpRight size={15} className="text-slate-400" />
    </Link>
  );
}

function ActivityPanel({ title, subtitle, to, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        <Link
          to={to}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          View all
        </Link>
      </div>

      {children}
    </div>
  );
}

function HealthCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-8 text-center text-sm text-slate-400">{text}</div>
  );
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

export default Dashboard;
