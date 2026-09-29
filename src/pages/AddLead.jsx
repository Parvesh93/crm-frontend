import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const SOURCES = [
  "Website",
  "Referral",
  "Email Outreach",
  "LinkedIn",
  "WhatsApp",
  "Upwork",
  "Existing Client",
  "Other",
];

function AddLead() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    platform: "",
    owner: "",
    source: "Other",
    stage: "New Lead",
    estimatedValue: "",
    probability: 10,
    nextFollowUp: "",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [platformRes, userRes] = await Promise.all([
          API.get("/platforms"),
          API.get("/users"),
        ]);
        setPlatforms(platformRes.data.platforms || []);
        setUsers(userRes.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load form");
      }
    };
    load();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/leads", {
        ...formData,
        estimatedValue: Number(formData.estimatedValue || 0),
        probability: Number(formData.probability || 0),
      });
      navigate("/leads");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lead");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">Sales pipeline</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 mt-1">
            Add Lead
          </h1>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Lead Name *" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <Input label="Website" name="website" value={formData.website} onChange={handleChange} />
            <Select label="Service / Platform" name="platform" value={formData.platform} onChange={handleChange}>
              <option value="">Select platform</option>
              {platforms.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Owner" name="owner" value={formData.owner} onChange={handleChange}>
              <option value="">Assign to me / default</option>
              {users.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </Select>

            <Select label="Source" name="source" value={formData.source} onChange={handleChange}>
              {SOURCES.map((item) => <option key={item}>{item}</option>)}
            </Select>

            <Select label="Stage" name="stage" value={formData.stage} onChange={handleChange}>
              {STAGES.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Estimated Value"
              name="estimatedValue"
              type="number"
              min="0"
              value={formData.estimatedValue}
              onChange={handleChange}
            />

            <Input
              label="Probability %"
              name="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={handleChange}
            />

            <Input
              label="Next Follow-up"
              name="nextFollowUp"
              type="date"
              value={formData.nextFollowUp}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Notes</label>
            <textarea
              name="notes"
              rows="5"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="bg-slate-100 px-5 py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>

            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold">
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
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

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-slate-700">{label}</label>
      <select {...props} className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:border-slate-900">
        {children}
      </select>
    </div>
  );
}

export default AddLead;
