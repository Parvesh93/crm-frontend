import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layout/DashboardLayout";

function Settings() {
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [platformRes, userRes] = await Promise.all([
          API.get("/platforms"),
          API.get("/users"),
        ]);

        const loadedPlatforms = platformRes.data.platforms || [];
        setPlatforms(loadedPlatforms);
        setUsers(userRes.data.users || []);

        const initial = {};
        loadedPlatforms.forEach((platform) => {
          initial[platform._id] = (platform.defaultAllocations || []).map((item) => ({
            user: item.user?._id || item.user,
            percentage: item.percentage,
          }));
        });
        setDrafts(initial);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load settings");
      }
    };

    load();
  }, []);

  const setPercentage = (platformId, userId, value) => {
    setDrafts((prev) => {
      const current = prev[platformId] || [];
      const existing = current.find((item) => item.user === userId);
      const next = existing
        ? current.map((item) =>
            item.user === userId ? { ...item, percentage: value } : item
          )
        : [...current, { user: userId, percentage: value }];

      return { ...prev, [platformId]: next };
    });
  };

  const totalFor = (platformId) =>
    (drafts[platformId] || []).reduce(
      (sum, item) => sum + Number(item.percentage || 0),
      0
    );

  const savePlatform = async (platformId) => {
    const total = totalFor(platformId);

    if (total > 100) {
      setError("Allocation percentages cannot exceed 100%.");
      return;
    }

    setSaving(platformId);
    setError("");
    setMessage("");

    try {
      const defaultAllocations = (drafts[platformId] || [])
        .filter((item) => Number(item.percentage) > 0)
        .map((item) => ({
          user: item.user,
          percentage: Number(item.percentage),
        }));

      await API.put(`/platforms/${platformId}`, { defaultAllocations });
      setMessage("Allocation rule saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save allocation rule");
    } finally {
      setSaving("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1 mb-8">
          Configure default team earning percentages for each platform.
        </p>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {platforms.map((platform) => {
            const total = totalFor(platform._id);
            const companyShare = Math.max(0, 100 - total);

            return (
              <div
                key={platform._id}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold">{platform.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Percentages are applied automatically when a payment is recorded.
                    </p>
                  </div>

                  <div className="text-sm text-right">
                    <p className={total > 100 ? "text-red-600 font-semibold" : "font-semibold"}>
                      Team: {total.toFixed(2)}%
                    </p>
                    <p className="text-gray-500">
                      Company / unallocated: {companyShare.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {users.map((user) => {
                    const allocation = (drafts[platform._id] || []).find(
                      (item) => item.user === user._id
                    );

                    return (
                      <div
                        key={user._id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 items-center border border-gray-100 rounded-xl p-3"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            {user.designation || user.role}
                          </p>
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={allocation?.percentage ?? ""}
                            onChange={(e) =>
                              setPercentage(platform._id, user._id, e.target.value)
                            }
                            placeholder="0"
                            className="w-full border border-gray-200 rounded-xl p-2.5 pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-gray-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-5">
                  <button
                    onClick={() => savePlatform(platform._id)}
                    disabled={saving === platform._id || total > 100}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {saving === platform._id ? "Saving..." : "Save Rule"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
