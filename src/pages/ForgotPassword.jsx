import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSending(true);
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(
        res.data?.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process request. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Enter your account email and we’ll send a secure reset link.
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

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button
            disabled={sending}
            className="w-full bg-black text-white py-3 rounded font-semibold disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link to="/login" className="text-sm font-semibold text-gray-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
