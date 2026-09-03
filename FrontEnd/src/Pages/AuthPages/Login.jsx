import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth/login";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // e.g. "Invalid email or password"
        throw new Error(data.message || "Login failed");
      }

      // token carries user id, name, NIC/ID number — used to authenticate later requests
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/landingpage"); // landing page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-4">
      <div className="w-full max-w-sm p-8 bg-white shadow-2xl rounded-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#0B1F3A] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#F0B429]" />
          </div>
          <span className="font-semibold text-[#0B1F3A] text-lg">SERASINGHE</span>
        </div>

        <h2 className="text-2xl font-semibold text-[#0B1F3A]">Welcome back</h2>
        <p className="mt-1 mb-6 text-sm text-slate-500">Sign in to manage your invoices.</p>

        {error && (
          <div className="px-3 py-2 mb-4 text-sm border rounded-lg text-rose-600 bg-rose-50 border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" defaultChecked className="accent-[#1E40AF]" />
              Keep me signed in
            </label>
            <a href="#" className="text-[#1E40AF] font-medium hover:text-[#3B82F6]">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Signing in…" : <>Login <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-[#1E40AF] font-semibold hover:text-[#3B82F6]"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}