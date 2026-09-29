import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  IndianRupee,
  CalendarClock,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";
import useAuthStore from "../store/authStore";

const STAGES = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

function LeadDetails() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super_admin";
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConvert, setShowConvert] = useState(false);
  const [error, setError] = useState("");
  const [convertData, setConvertData] = useState({
    createProject: true,
    projectTitle: "",
    projectValue: "",
    teamMembers: [],
    deadline: "",
    paymentDueDate: "",
    paymentTerms: "",
  });

  const load = async () => {
    try {
      const [leadRes, usersRes] = await Promise.all([
        API.get(`/leads/${id}`),
        API.get("/users"),
      ]);
      const data = leadRes.data.lead;
      setLead(data);
      setUsers(usersRes.data.users || []);
      setConvertData((prev) => ({
        ...prev,
        projectTitle: data.company || data.name || "",
        projectValue: isSuperAdmin ? data.estimatedValue || "" : "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateLead = async (patch) => {
    try {
      const res = await API.put(`/leads/${id}`, patch);
      setLead(res.data.lead);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update lead");
    }
  };

  const toggleTeamMember = (userId) => {
    setConvertData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter((id) => id !== userId)
        : [...prev.teamMembers, userId],
    }));
  };

  const convertLead = async () => {
    setError("");
    try {
      const payload = { ...convertData };
      if (isSuperAdmin) {
        payload.projectValue = Number(convertData.projectValue || 0);
      } else {
        delete payload.projectValue;
        delete payload.paymentDueDate;
        delete payload.paymentTerms;
      }

      const res = await API.post(`/leads/${id}/convert`, payload);

      if (res.data.project?._id) {
        navigate(`/projects/${res.data.project._id}`);
      } else if (res.data.client?._id) {
        navigate(`/clients/${res.data.client._id}`);
      } else {
        navigate("/leads");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to convert lead");
    }
  };

  if (loading) {
    return <DashboardLayout><div className="text-slate-500">Loading lead...</div></DashboardLayout>;
  }

  if (!lead) {
    return <DashboardLayout><div className="text-slate-500">Lead not found.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-slate-500 mb-5">
        <ArrowLeft size={16} />
        Back to Leads
      </Link>

      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Sales opportunity</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 mt-1">
              {lead.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{lead.company || "No company"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={lead.stage}
              onChange={(e) => updateLead({ stage: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold"
            >
              {STAGES.map((item) => <option key={item}>{item}</option>)}
            </select>

            {!lead.convertedClient && (
              <button
                onClick={() => setShowConvert((value) => !value)}
                className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                Convert to Client
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          <Info icon={Building2} label="Company" value={lead.company || "-"} />
          <Info icon={Mail} label="Email" value={lead.email || "-"} />
          <Info icon={Phone} label="Phone" value={lead.phone || "-"} />
          <Info icon={Globe} label="Website" value={lead.website || "-"} />
          <Info icon={BriefcaseBusiness} label="Platform" value={lead.platform?.name || "-"} />
          <Info icon={UserRound} label="Owner" value={lead.owner?.name || "Unassigned"} />
          {isSuperAdmin && (
            <Info icon={IndianRupee} label="Estimated Value" value={money(lead.estimatedValue)} />
          )}
          <Info
            icon={CalendarClock}
            label="Next Follow-up"
            value={lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN") : "Not set"}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <EditableNumber
            label="Probability %"
            value={lead.probability || 0}
            onSave={(value) => updateLead({ probability: Number(value) })}
          />

          <EditableDate
            label="Next Follow-up"
            value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
            onSave={(value) => updateLead({ nextFollowUp: value || null })}
          />

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Source</p>
            <p className="font-semibold text-slate-800 mt-2">{lead.source || "-"}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900">Notes</h2>
          <textarea
            defaultValue={lead.notes || ""}
            onBlur={(e) => updateLead({ notes: e.target.value })}
            rows="5"
            className="mt-2 w-full border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-slate-900"
            placeholder="Add lead notes..."
          />
        </div>

        {showConvert && !lead.convertedClient && (
          <div className="mt-6 border border-slate-200 rounded-2xl bg-slate-50 p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-900">Convert Lead</h2>
              <p className="text-xs text-slate-500 mt-1">
                This will create an Active Client and, optionally, the first project.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-4">
              <input
                type="checkbox"
                checked={convertData.createProject}
                onChange={(e) =>
                  setConvertData((prev) => ({ ...prev, createProject: e.target.checked }))
                }
              />
              Create project as well
            </label>

            {convertData.createProject && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Project Title"
                    value={convertData.projectTitle}
                    onChange={(e) =>
                      setConvertData((prev) => ({ ...prev, projectTitle: e.target.value }))
                    }
                  />
                  {isSuperAdmin && (
                    <Input
                      label="Project Value"
                      type="number"
                      value={convertData.projectValue}
                      onChange={(e) =>
                        setConvertData((prev) => ({ ...prev, projectValue: e.target.value }))
                      }
                    />
                  )}
                  <Input
                    label="Deadline"
                    type="date"
                    value={convertData.deadline}
                    onChange={(e) =>
                      setConvertData((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                  />
                  {isSuperAdmin && (
                    <Input
                      label="Payment Due Date"
                      type="date"
                      value={convertData.paymentDueDate}
                      onChange={(e) =>
                        setConvertData((prev) => ({ ...prev, paymentDueDate: e.target.value }))
                      }
                    />
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="mt-4">
                    <Input
                      label="Payment Terms"
                      value={convertData.paymentTerms}
                      onChange={(e) =>
                        setConvertData((prev) => ({ ...prev, paymentTerms: e.target.value }))
                      }
                    />
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Project Team</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {users.map((member) => (
                      <label key={member._id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                        <input
                          type="checkbox"
                          checked={convertData.teamMembers.includes(member._id)}
                          onChange={() => toggleTeamMember(member._id)}
                        />
                        <span>
                          <span className="block text-sm font-medium">{member.name}</span>
                          <span className="text-xs text-slate-400">{member.designation || member.role}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={convertLead}
                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
              >
                Convert Lead
              </button>
            </div>
          </div>
        )}

        {lead.convertedClient && (
          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
            Converted to client{" "}
            <Link className="font-semibold underline" to={`/clients/${lead.convertedClient._id}`}>
              {lead.convertedClient.name}
            </Link>
            {lead.convertedProject && (
              <>
                {" "}and project{" "}
                <Link className="font-semibold underline" to={`/projects/${lead.convertedProject._id}`}>
                  {lead.convertedProject.title}
                </Link>
              </>
            )}
            .
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon size={15} />
        {label}
      </div>
      <p className="font-semibold text-slate-800 mt-2 break-words">{value}</p>
    </div>
  );
}

function EditableNumber({ label, value, onSave }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <input
        type="number"
        min="0"
        max="100"
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        className="w-full mt-1 font-semibold text-slate-800 outline-none"
      />
    </div>
  );
}

function EditableDate({ label, value, onSave }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <input
        type="date"
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        className="w-full mt-1 font-semibold text-slate-800 outline-none"
      />
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-slate-700">{label}</label>
      <input {...props} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-slate-900" />
    </div>
  );
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

export default LeadDetails;
