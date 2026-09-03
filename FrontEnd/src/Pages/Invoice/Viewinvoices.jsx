import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Pencil, Trash2, FileText, Plus } from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import InvoiceDocument from "../../Components/InvoiceDocument";

const API_URL = "http://localhost:5000/api/invoices";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Partial: "bg-amber-50 text-amber-600 border-amber-200",
  Unpaid: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function ViewInvoices() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null); // { invoice, items }
  const [viewLoading, setViewLoading] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load invoices");
      setInvoices(data.invoices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close the action dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete invoice");
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleView = async (id) => {
    setOpenMenuId(null);
    setViewLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load invoice");
      setViewingInvoice(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Invoices</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {invoices.length} invoice{invoices.length !== 1 && "s"} on your account
              </p>
            </div>
            <button
              onClick={() => navigate("/addinvoice")}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="overflow-visible bg-white border rounded-xl border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-left border-b text-slate-400 border-slate-100">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Loading invoices…
                    </td>
                  </tr>
                )}

                {!loading && invoices.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      No invoices yet — click "Create Invoice" to make one.
                    </td>
                  </tr>
                )}

                {!loading &&
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-blue-50 shrink-0">
                            <FileText className="w-4.5 h-4.5 text-[#1E40AF]" />
                          </div>
                          <p className="font-mono text-xs font-medium text-[#0B1F3A]">{inv.invoice_number}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{inv.customer_name}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(inv.invoice_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#0B1F3A]">{money(inv.total_amount)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{money(inv.balance_amount)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[inv.status]}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                          className="flex items-center justify-center w-8 h-8 ml-auto transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === inv.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-5 top-11 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-left"
                          >
                            <button
                              onClick={() => handleView(inv.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Invoice
                            </button>
                            <button
                              onClick={() => navigate(`/editinvoice/${inv.id}`)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit Invoice
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Invoice
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Real invoice document, printable */}
      {viewingInvoice && (
        <InvoiceDocument
          invoice={viewingInvoice.invoice}
          items={viewingInvoice.items}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {viewLoading && (
        <div className="fixed inset-0 z-50 bg-[#0B1F3A]/50 backdrop-blur-sm flex items-center justify-center">
          <p className="text-sm text-white">Loading invoice…</p>
        </div>
      )}
    </div>
  );
}