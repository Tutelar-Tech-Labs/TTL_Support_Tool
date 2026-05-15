import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

// ── Forgot Password Modal ────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newPassword
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      toast.success(data.message || "OTP sent!");
      setStep(2);
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      toast.success("Password reset! Please log in.");
      onClose();
    } catch {
      toast.error("Reset failed. Please try again.");
    } finally { setLoading(false); }
  };

  const stepLabel = ["", "Enter your email", "Check your email for OTP", "Set a new password"][step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white dark:bg-servicenow-light rounded-2xl shadow-2xl border border-slate-100 dark:border-servicenow-dark overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white font-bold text-lg">Forgot Password</h2>
              <p className="text-white/70 text-xs mt-0.5">Step {step} of 3 — {stepLabel}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
          </div>
          {/* progress bar */}
          <div className="mt-4 h-1.5 bg-white/20 rounded-full">
            <div
              className="h-1.5 bg-white rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Step 1 — Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your registered email and we'll send you a one-time password.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm text-slate-900 dark:text-white dark:bg-servicenow-dark placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-semibold transition disabled:opacity-60"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A 6-digit OTP was sent to <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>. It expires in 5 minutes.
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm text-slate-900 dark:text-white dark:bg-servicenow-dark placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 tracking-widest text-center text-lg font-bold"
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-semibold transition"
              >
                Verify OTP
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-slate-400 hover:text-primary-600 transition"
              >
                ← Resend / Change email
              </button>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                OTP verified ✓ — now set your new password.
              </p>
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm text-slate-900 dark:text-white dark:bg-servicenow-dark placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
                autoFocus
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm text-slate-900 dark:text-white dark:bg-servicenow-dark placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-sm font-semibold transition disabled:opacity-60"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password"); return; }

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userPhone", data.user.phone || "");
        localStorage.setItem("user", JSON.stringify(data.user));
        loadUser();

        if (data.user.role === "admin") navigate("/admin/dashboard");
        else if (data.user.role === "sales") navigate("/sales/create");
        else navigate("/engineer/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    }
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-[#91C4A4]/15 via-slate-50 to-[#94BBE9]/15 dark:bg-servicenow flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/90 backdrop-blur-sm dark:bg-servicenow-light/90 rounded-2xl shadow-xl px-8 py-10 border border-slate-100 dark:border-servicenow-dark"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-100 overflow-hidden">
            <img src="/ttllogo.png" alt="Tutelar Tech Labs" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
            Welcome to Tutelar Tech Labs
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300 text-center">
            Sign in to your account
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 dark:bg-servicenow-dark dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 dark:bg-servicenow-dark dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300 dark:bg-servicenow-dark dark:border-slate-600" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/40 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Sign In
          </button>
        </form>
      </div>
    </>
  );
}
