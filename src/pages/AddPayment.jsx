import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function AddPayment() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    project: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Bank Transfer",
    reference: "",
    notes: "",
    allocations: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          API.get("/projects"),
          API.get("/users"),
        ]);
        setProjects(projectsRes.data.projects || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payment form");
      }
    };
    load();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === formData.project),
    [projects, formData.project]
  );

  const selectedTeam = selectedProject?.teamMembers || [];
  const allocatedTotal = formData.allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remaining = Math.max(0, Number(formData.amount || 0) - allocatedTotal);

  const setAllocation = (userId, amount) => {
    setFormData((prev) => {
      const exists = prev.allocations.find((item) => item.user === userId);
      const allocations = exists
        ? prev.allocations.map((item) => item.user === userId ? { ...item, amount } : item)
        : [...prev.allocations, { user: userId, amount }];
      return { ...prev, allocations };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/payments", {
        ...formData,
        amount: Number(formData.amount),
        allocations: formData.allocations.map((item) => ({
          user: item.user,
          amount: Number(item.amount || 0),
        })),
      });
      navigate("/earnings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Record Payment</h1>
        <p className="text-gray-500 mb-6">Record actual money received and optionally allocate part of it to team members.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-5">
          <div>
            <label className="block mb-1 font-medium">Project *</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value, allocations: [] }))}
              className="w-full border border-gray-200 p-3 rounded-xl"
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title} - {project.client?.name || "Client"} - {project.platform?.name || project.type || "No platform"}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p><span className="text-gray-500">Platform:</span> <strong>{selectedProject.platform?.name || selectedProject.type || "-"}</strong></p>
              <p className="mt-1"><span className="text-gray-500">Project Value:</span> <strong>₹{Number(selectedProject.budget || 0).toLocaleString("en-IN")}</strong></p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Amount Received *" type="number" value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))} />
            <Input label="Payment Date *" type="date" value={formData.paymentDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))} />
          </div>

          <div>
            <label className="block mb-1 font-medium">Payment Mode</label>
            <select value={formData.paymentMode}
              onChange={(e) => setFormData((prev) => ({ ...prev, paymentMode: e.target.value }))}
              className="w-full border border-gray-200 p-3 rounded-xl">
              {["Bank Transfer", "UPI", "Cash", "Card", "PayPal", "Stripe", "Other"].map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>

          <Input label="Reference / Transaction ID" value={formData.reference}
            onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))} />

          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <label className="block font-medium">Team Allocation</label>
                <p className="text-xs text-gray-500">Leave any remaining amount unallocated as company share.</p>
              </div>
              <p className="text-sm font-semibold">Remaining: ₹{remaining.toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-3">
              {(selectedTeam.length ? selectedTeam : users).map((user) => {
                const allocation = formData.allocations.find((item) => item.user === user._id);
                return (
                  <div key={user._id} className="grid grid-cols-[1fr_180px] gap-3 items-center border border-gray-200 rounded-xl p-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.designation || user.role}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocation?.amount || ""}
                      onChange={(e) => setAllocation(user._id, e.target.value)}
                      placeholder="₹ amount"
                      className="border border-gray-200 p-2.5 rounded-xl"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows="3" className="w-full border border-gray-200 p-3 rounded-xl" />
          </div>

          <div className="flex gap-3">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold">Save Payment</button>
            <button type="button" onClick={() => navigate("/earnings")} className="bg-gray-100 px-6 py-3 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input {...props} className="w-full border border-gray-200 p-3 rounded-xl" />
    </div>
  );
}

export default AddPayment;
