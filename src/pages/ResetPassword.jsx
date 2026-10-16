import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      const res = await API.post(
        `/auth/reset-password/${token}`,
        { password }
      );
      setMessage(
        res.data?.message ||
          "Password reset successfully. You can now log in."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please request a new link."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Choose a new password for your PPDT CRM account.
        </p>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="password"
              required
              minLength={8}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />

            <input
              type="password"
              required
              minLength={8}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />

            <button
              disabled={saving}
              className="w-full bg-black text-white py-3 rounded font-semibold disabled:opacity-50"
            >
              {saving ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="text-center mt-5">
          <Link to="/login" className="text-sm font-semibold text-gray-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
