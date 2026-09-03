import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  Plus,
  X,
  Phone,
  Mail,
  Printer,
  Building2,
  MapPin,
  IdCard,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";

const API_URL = "http://localhost:5000/api/customers";
const IMAGE_BASE = "http://localhost:5000/uploads/customers/";

const PanelStyles = () => (
  <style>{`
    @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes panelIn {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .overlay-anim { animation: overlayIn 0.2s ease-out; }
    .panel-anim { animation: panelIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
  `}</style>
);

export default function ViewCustomers() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const menuRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load customers");
      setCustomers(data.customers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
    if (!window.confirm("Delete this customer? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete customer");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleView = (c) => {
    setSelectedCustomer(c);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PanelStyles />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Customers</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {customers.length} customer{customers.length !== 1 && "s"} on your account
              </p>
            </div>
            <button
              onClick={() => navigate("/addcustomer")}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Customer
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
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">NIC</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading customers…
                    </td>
                  </tr>
                )}

                {!loading && customers.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No customers yet — click "Add Customer" to create one.
                    </td>
                  </tr>
                )}

                {!loading &&
                  customers.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {c.image ? (
                            <img
                              src={`${IMAGE_BASE}${c.image}`}
                              alt={c.customer_name}
                              className="object-cover rounded-full w-9 h-9 shrink-0"
                            />
                          ) : (
                            <div className="flex items-center justify-center rounded-full w-9 h-9 bg-blue-50 shrink-0">
                              <UserRound className="w-4.5 h-4.5 text-[#1E40AF]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#0B1F3A]">{c.customer_name}</p>
                            <p className="text-xs text-slate-400">{c.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{c.nic}</td>
                      <td className="px-5 py-3.5 text-slate-600">{c.tp_number}</td>
                      <td className="px-5 py-3.5 text-slate-600">{c.company_name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            c.customer_type === "Business"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {c.customer_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          className="flex items-center justify-center w-8 h-8 ml-auto transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === c.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-5 top-11 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-left"
                          >
                            <button
                              onClick={() => handleView(c)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Customer
                            </button>
                            
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Customer
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

      {/* Customer detail panel — slides in from the right */}
      {selectedCustomer && (
        <div
          className="overlay-anim fixed inset-0 z-40 bg-[#0B1F3A]/40 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="w-full h-screen max-w-md overflow-y-auto bg-white shadow-2xl panel-anim"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-6 pt-6 pb-10">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute transition-colors top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                {selectedCustomer.image ? (
                  <img
                    src={`${IMAGE_BASE}${selectedCustomer.image}`}
                    alt={selectedCustomer.customer_name}
                    className="object-cover w-16 h-16 border-2 rounded-full border-white/30"
                  />
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 border-2 rounded-full bg-white/15 border-white/30">
                    <UserRound className="text-white w-7 h-7" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedCustomer.customer_name}</h2>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      selectedCustomer.customer_type === "Business"
                        ? "bg-white/15 text-white"
                        : "bg-white/10 text-[#B9C7E0]"
                    }`}
                  >
                    {selectedCustomer.customer_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-8 mt-5">
              <div className="p-5 space-y-4 bg-white border shadow-sm rounded-xl border-slate-100">
                <DetailRow icon={IdCard} label="NIC Number" value={selectedCustomer.nic} />
                <DetailRow icon={Phone} label="Telephone" value={selectedCustomer.tp_number} />
                <DetailRow icon={Mail} label="Email" value={selectedCustomer.email} />
                <DetailRow icon={Printer} label="Fax" value={selectedCustomer.fax} />
                <DetailRow icon={Building2} label="Company" value={selectedCustomer.company_name} />
                <DetailRow icon={MapPin} label="Address" value={selectedCustomer.address} />
                <DetailRow icon={StickyNote} label="Notes" value={selectedCustomer.notes} />
                <DetailRow
                  icon={CalendarDays}
                  label="Added on"
                  value={
                    selectedCustomer.created_at
                      ? new Date(selectedCustomer.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"
                  }
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => navigate(`/editcustomer/${selectedCustomer.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[#0B1F3A] hover:bg-[#132a52] text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Customer
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 shrink-0">
        <Icon className="w-4 h-4 text-[#1E40AF]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm break-words text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );
}