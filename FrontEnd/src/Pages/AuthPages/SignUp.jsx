import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, IdCard, Mail, Lock, Eye, EyeOff, ArrowRight, FileText } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth/signup";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", idNumber: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // e.g. "Email or ID number already registered"
        throw new Error(data.message || "Signup failed");
      }

      navigate("/landingpage"); // landing page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#0B1F3A] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#F0B429]" />
          </div>
          <span className="font-semibold text-[#0B1F3A] text-lg">Invoiq</span>
        </div>

        <h2 className="text-2xl font-semibold text-[#0B1F3A]">Create your account</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">Start managing your invoices in minutes.</p>

        {error && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              placeholder="ID number"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Creating account…" : <>Sign up <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[#1E40AF] font-semibold hover:text-[#3B82F6]"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}