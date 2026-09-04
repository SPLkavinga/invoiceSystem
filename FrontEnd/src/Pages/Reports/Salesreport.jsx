import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, FileText, Wallet, AlertCircle, Printer, ArrowLeft, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import StatCard from "../../Components/StatCard";

const API_URL = "http://localhost:5000/api/reports/sales";

const money = (n) => Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Partial: "bg-amber-50 text-amber-600 border-amber-200",
  Unpaid: "bg-rose-50 text-rose-600 border-rose-200",
};
const STATUS_COLORS = { Paid: "#10B981", Partial: "#F59E0B", Unpaid: "#F43F5E" };

const PrintStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden; }
      .printable-report, .printable-report * { visibility: visible; }
      .printable-report { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `}</style>
);

export default function SalesReport() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load report");
      setInvoices(data.invoices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSales = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + Number(i.balance_amount), 0);

  // monthly trend across whatever invoices are currently loaded
  const monthlyMap = {};
  invoices.forEach((inv) => {
    const d = new Date(inv.invoice_date);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(inv.total_amount);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

  const statusCounts = ["Paid", "Partial", "Unpaid"].map((s) => ({
    name: s,
    value: invoices.filter((i) => i.status === s).length,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PrintStyles />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="p-6">
          {/* Header */}
          <div className="no-print flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 bg-white border rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#0B1F3A]">Sales Report</h1>
                <p className="text-sm text-slate-500 mt-0.5">Revenue, payments, and invoice performance.</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>

          {/* Date filter */}
          <div className="no-print flex flex-wrap items-end gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">FROM</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">TO</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
            <button
              onClick={loadReport}
              className="flex items-center gap-2 bg-[#1E40AF] hover:bg-[#173785] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setTimeout(loadReport, 0);
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 px-2 py-2"
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
              Loading report…
            </div>
          ) : (
            <div className="printable-report space-y-6">
              <div className="hidden print:block mb-2">
                <h1 className="text-2xl font-semibold text-[#0B1F3A]">Sales Report</h1>
                <p className="text-sm text-slate-500">
                  {startDate || endDate
                    ? `Period: ${startDate || "start"} to ${endDate || "today"}`
                    : "All time"}{" "}
                  · Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="TOTAL INVOICES" value={invoices.length.toLocaleString()} />
                <StatCard icon={DollarSign} label="TOTAL SALES" value={money(totalSales)} />
                <StatCard icon={Wallet} label="TOTAL PAID" value={money(totalPaid)} />
                <StatCard icon={AlertCircle} label="OUTSTANDING" value={money(totalOutstanding)} />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Sales by month</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [money(v), "Sales"]} />
                      <Bar dataKey="revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Status breakdown</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                        {statusCounts.map((s) => (
                          <Cell key={s.name} fill={STATUS_COLORS[s.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">All invoices</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-left border-b text-slate-400 border-slate-100">
                      <th className="px-5 py-3 font-medium">Invoice</th>
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium text-right">Total</th>
                      <th className="px-5 py-3 font-medium text-right">Paid</th>
                      <th className="px-5 py-3 font-medium text-right">Balance</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                          No invoices in this period.
                        </td>
                      </tr>
                    )}
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{inv.invoice_number}</td>
                        <td className="px-5 py-3.5 text-slate-700">{inv.customer_name}</td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {new Date(inv.invoice_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#0B1F3A]">{money(inv.total_amount)}</td>
                        <td className="px-5 py-3.5 text-right text-emerald-600">{money(inv.paid_amount)}</td>
                        <td className="px-5 py-3.5 text-right text-rose-500">{money(inv.balance_amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[inv.status]}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}