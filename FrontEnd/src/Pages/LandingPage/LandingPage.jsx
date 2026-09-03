import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Users, DollarSign, FileText, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import StatCard from "../../Components/StatCard";

const CUSTOMERS_URL = "http://localhost:5000/api/customers";
const PRODUCTS_URL = "http://localhost:5000/api/products";
const INVOICES_URL = "http://localhost:5000/api/invoices";

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Partial: "bg-amber-50 text-amber-600 border-amber-200",
  Unpaid: "bg-rose-50 text-rose-600 border-rose-200",
};

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

// build the last 7 calendar months (including this one) as empty buckets, e.g. [{key:'2026-01', month:'Jan', revenue:0}, ...]
const buildLast7Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
    });
  }
  return months;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [revenueData, setRevenueData] = useState(buildLast7Months());

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [custRes, prodRes, invRes] = await Promise.all([
          fetch(CUSTOMERS_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(PRODUCTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(INVOICES_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const custData = await custRes.json();
        const prodData = await prodRes.json();
        const invData = await invRes.json();

        if (!custRes.ok) throw new Error(custData.message || "Failed to load customers");
        if (!prodRes.ok) throw new Error(prodData.message || "Failed to load products");
        if (!invRes.ok) throw new Error(invData.message || "Failed to load invoices");

        setCustomerCount(custData.customers.length);
        setProductCount(prodData.products.length);
        setInvoices(invData.invoices);

        // group invoice totals into the last 7 months
        const buckets = buildLast7Months();
        invData.invoices.forEach((inv) => {
          const d = new Date(inv.invoice_date);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const bucket = buckets.find((b) => b.key === key);
          if (bucket) bucket.revenue += Number(inv.total_amount);
        });
        setRevenueData(buckets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derived stats from real invoice data
  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount), 0);
  const paidPercent = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

  const thisMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
  const thisMonthRevenue =
    revenueData.find((b) => b.key === thisMonthKey)?.revenue || 0;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Welcome back, here's what's happening today.</p>
            </div>
            <button
              onClick={() => navigate("/addinvoice")}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-10 text-sm text-center bg-white border rounded-xl border-slate-200 text-slate-400">
              Loading your dashboard…
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Package} label="TOTAL PRODUCTS" value={productCount.toLocaleString()} />
                <StatCard icon={Users} label="TOTAL CUSTOMERS" value={customerCount.toLocaleString()} />
                <StatCard icon={FileText} label="INVOICES ISSUED" value={invoices.length.toLocaleString()} />
                <StatCard icon={DollarSign} label="TOTAL SALES" value={money(totalSales)} />
              </div>

              {/* Chart + summary */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="p-5 bg-white border lg:col-span-2 rounded-xl border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#0B1F3A]">Revenue overview</h2>
                    <span className="text-xs text-slate-400">Last 7 months</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [money(v), "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#1E40AF" strokeWidth={2} fill="url(#rev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick summary card */}
                <div className="bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] rounded-xl p-5 text-white flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#B9C7E0] font-medium">THIS MONTH</p>
                    <p className="mt-2 text-3xl font-semibold">{money(thisMonthRevenue)}</p>
                    <p className="text-xs text-[#B9C7E0] mt-1">Total invoiced revenue</p>
                  </div>
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B9C7E0]">Paid</span>
                      <span className="font-medium">{paidPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F0B429] rounded-full" style={{ width: `${paidPercent}%` }} />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#B9C7E0]">Pending / overdue</span>
                      <span className="font-medium">{100 - paidPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent invoices table */}
              <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">Recent invoices</h2>
                  <button
                    onClick={() => navigate("/viewinvoice")}
                    className="text-xs font-medium text-[#1E40AF] hover:text-[#3B82F6]"
                  >
                    View all
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-left border-b text-slate-400 border-slate-100">
                      <th className="px-5 py-3 font-medium">Invoice</th>
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                          No invoices yet.
                        </td>
                      </tr>
                    )}
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{inv.invoice_number}</td>
                        <td className="px-5 py-3.5 text-slate-700">{inv.customer_name}</td>
                        <td className="px-5 py-3.5 font-medium text-[#0B1F3A]">{money(inv.total_amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[inv.status]}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}