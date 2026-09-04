import React, { useEffect, useState } from "react";
import { Users, UserCheck, Building2, FileText, Printer, ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import StatCard from "../../Components/StatCard";

const API_URL = "http://localhost:5000/api/reports/customers";

const money = (n) => Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
const PIE_COLORS = ["#1E40AF", "#F0B429"];

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

export default function CustomerReport() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load report");
        setCustomers(data.customers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCustomers = customers.length;
  const individualCount = customers.filter((c) => c.customer_type === "Individual").length;
  const businessCount = customers.filter((c) => c.customer_type === "Business").length;
  const totalInvoiced = customers.reduce((sum, c) => sum + Number(c.total_invoiced), 0);

  const typeData = [
    { name: "Individual", value: individualCount },
    { name: "Business", value: businessCount },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PrintStyles />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="p-6">
          {/* Header */}
          <div className="no-print flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 bg-white border rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#0B1F3A]">Customer Report</h1>
                <p className="text-sm text-slate-500 mt-0.5">A full breakdown of your customers and their invoicing history.</p>
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
              {/* Print-only letterhead */}
              <div className="hidden print:block mb-2">
                <h1 className="text-2xl font-semibold text-[#0B1F3A]">Customer Report</h1>
                <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="TOTAL CUSTOMERS" value={totalCustomers.toLocaleString()} />
                <StatCard icon={UserCheck} label="INDIVIDUAL" value={individualCount.toLocaleString()} />
                <StatCard icon={Building2} label="BUSINESS" value={businessCount.toLocaleString()} />
                <StatCard icon={FileText} label="TOTAL INVOICED" value={money(totalInvoiced)} />
              </div>

              {/* Chart + table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Customer type split</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {typeData.map((entry, i) => (
                          <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-2 bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] rounded-xl p-5 text-white flex flex-col justify-center">
                  <p className="text-xs text-[#B9C7E0] font-medium">TOTAL INVOICED ACROSS ALL CUSTOMERS</p>
                  <p className="text-3xl font-semibold mt-2">{money(totalInvoiced)}</p>
                  <p className="text-xs text-[#B9C7E0] mt-1">
                    {customers.reduce((s, c) => s + Number(c.invoice_count), 0)} invoices issued in total
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">All customers</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-left border-b text-slate-400 border-slate-100">
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Phone</th>
                      <th className="px-5 py-3 font-medium text-right">Invoices</th>
                      <th className="px-5 py-3 font-medium text-right">Total Invoiced</th>
                      <th className="px-5 py-3 font-medium text-right">Paid</th>
                      <th className="px-5 py-3 font-medium text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                          No customers yet.
                        </td>
                      </tr>
                    )}
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-[#0B1F3A]">{c.customer_name}</p>
                          <p className="text-xs text-slate-400">{c.company_name || c.email || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{c.customer_type}</td>
                        <td className="px-5 py-3.5 text-slate-600">{c.tp_number}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{c.invoice_count}</td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#0B1F3A]">{money(c.total_invoiced)}</td>
                        <td className="px-5 py-3.5 text-right text-emerald-600">{money(c.total_paid)}</td>
                        <td className="px-5 py-3.5 text-right text-rose-500">{money(c.total_balance)}</td>
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