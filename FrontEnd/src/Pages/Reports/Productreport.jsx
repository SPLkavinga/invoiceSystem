import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Boxes, AlertTriangle, CalendarClock, Printer, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import StatCard from "../../Components/StatCard";

const API_URL = "http://localhost:5000/api/reports/products";

const money = (n) => Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const LOW_STOCK_THRESHOLD = 10;

const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const daysLeft = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return daysLeft <= 30;
};

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

export default function ProductReport() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load report");
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProducts = products.length;
  const stockValue = products.reduce((s, p) => s + Number(p.price) * Number(p.quantity), 0);
  const lowStockCount = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).length;
  const expiringCount = products.filter((p) => isExpiringSoon(p.expire_date)).length;

  const topSelling = [...products]
    .sort((a, b) => Number(b.total_sold) - Number(a.total_sold))
    .slice(0, 8)
    .map((p) => ({ name: p.product_name.length > 14 ? p.product_name.slice(0, 14) + "…" : p.product_name, sold: Number(p.total_sold) }));

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
                <h1 className="text-xl font-semibold text-[#0B1F3A]">Product Report</h1>
                <p className="text-sm text-slate-500 mt-0.5">Inventory value, stock levels, and top-selling products.</p>
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
              <div className="hidden print:block mb-2">
                <h1 className="text-2xl font-semibold text-[#0B1F3A]">Product Report</h1>
                <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package} label="TOTAL PRODUCTS" value={totalProducts.toLocaleString()} />
                <StatCard icon={Boxes} label="STOCK VALUE" value={money(stockValue)} />
                <StatCard icon={AlertTriangle} label="LOW STOCK" value={lowStockCount.toLocaleString()} />
                <StatCard icon={CalendarClock} label="EXPIRING SOON" value={expiringCount.toLocaleString()} />
              </div>

              {/* Top selling chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Top selling products (by units sold)</h2>
                {topSelling.every((p) => p.sold === 0) ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No sales recorded yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={topSelling} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF2F7" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip formatter={(v) => [v, "Units sold"]} />
                      <Bar dataKey="sold" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">All products</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-left border-b text-slate-400 border-slate-100">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium text-right">Price</th>
                      <th className="px-5 py-3 font-medium text-right">Stock</th>
                      <th className="px-5 py-3 font-medium text-right">Stock Value</th>
                      <th className="px-5 py-3 font-medium text-right">Sold</th>
                      <th className="px-5 py-3 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                          No products yet.
                        </td>
                      </tr>
                    )}
                    {products.map((p) => {
                      const lowStock = p.quantity <= LOW_STOCK_THRESHOLD;
                      const expiring = isExpiringSoon(p.expire_date);
                      return (
                        <tr key={p.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-[#0B1F3A]">{p.product_name}</p>
                            <p className="text-xs text-slate-400 font-mono">{p.product_code}</p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{p.category || "—"}</td>
                          <td className="px-5 py-3.5 text-right text-slate-600">{money(p.price)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={lowStock ? "text-rose-500 font-semibold" : "text-slate-600"}>
                              {p.quantity} {p.unit}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium text-[#0B1F3A]">
                            {money(Number(p.price) * Number(p.quantity))}
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-600">{p.total_sold}</td>
                          <td className="px-5 py-3.5">
                            {p.expire_date ? (
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                expiring ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {new Date(p.expire_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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