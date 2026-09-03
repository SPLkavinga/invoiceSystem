import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Package,
  Plus,
  X,
  Hash,
  Tag,
  DollarSign,
  Boxes,
  CalendarClock,
  Layers,
  MapPin,
  Truck,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";

const API_URL = "http://localhost:5000/api/products";
const IMAGE_BASE = "http://localhost:5000/uploads/products/";

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

export default function ViewProducts() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const menuRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load products");
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleView = (p) => {
    setSelectedProduct(p);
    setOpenMenuId(null);
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const daysLeft = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30;
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
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Products</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {products.length} product{products.length !== 1 && "s"} in your inventory
              </p>
            </div>
            <button
              onClick={() => navigate("/products/add")}
              className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#132a52] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
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
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Expire Date</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading products…
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No products yet — click "Add Product" to create one.
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={`${IMAGE_BASE}${p.image}`}
                              alt={p.product_name}
                              className="object-cover rounded-lg w-9 h-9 shrink-0"
                            />
                          ) : (
                            <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-blue-50 shrink-0">
                              <Package className="w-4.5 h-4.5 text-[#1E40AF]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#0B1F3A]">{p.product_name}</p>
                            <p className="font-mono text-xs text-slate-400">{p.product_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{p.category || "—"}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0B1F3A]">
                        {Number(p.price).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.expire_date ? (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              isExpiringSoon(p.expire_date)
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {new Date(p.expire_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                          className="flex items-center justify-center w-8 h-8 ml-auto transition-colors rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === p.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-5 top-11 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-left"
                          >
                            <button
                              onClick={() => handleView(p)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Product
                            </button>
                            <button
                              onClick={() => navigate(`/editproduct/${p.id}`)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit Product
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Product
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

      {/* Product detail panel — slides in from the right */}
      {selectedProduct && (
        <div
          className="overlay-anim fixed inset-0 z-40 bg-[#0B1F3A]/40 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full h-screen max-w-md overflow-y-auto bg-white shadow-2xl panel-anim"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-6 pt-6 pb-10">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute transition-colors top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                {selectedProduct.image ? (
                  <img
                    src={`${IMAGE_BASE}${selectedProduct.image}`}
                    alt={selectedProduct.product_name}
                    className="object-cover w-16 h-16 border-2 rounded-xl border-white/30"
                  />
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 border-2 rounded-xl bg-white/15 border-white/30">
                    <Package className="text-white w-7 h-7" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedProduct.product_name}</h2>
                  <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white font-mono">
                    {selectedProduct.product_code}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-8 mt-5">
              <div className="p-5 space-y-4 bg-white border shadow-sm rounded-xl border-slate-100">
                <DetailRow icon={Tag} label="Category" value={selectedProduct.category} />
                <DetailRow
                  icon={DollarSign}
                  label="Selling Price"
                  value={Number(selectedProduct.price).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                />
                <DetailRow
                  icon={DollarSign}
                  label="Cost Price"
                  value={
                    selectedProduct.cost_price
                      ? Number(selectedProduct.cost_price).toLocaleString("en-US", { style: "currency", currency: "USD" })
                      : "—"
                  }
                />
                <DetailRow
                  icon={Boxes}
                  label="Quantity in Stock"
                  value={`${selectedProduct.quantity} ${selectedProduct.unit}`}
                />
                <DetailRow
                  icon={CalendarClock}
                  label="Expire Date"
                  value={
                    selectedProduct.expire_date
                      ? new Date(selectedProduct.expire_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"
                  }
                />
                <DetailRow icon={Layers} label="Rack No" value={selectedProduct.rack_no} />
                <DetailRow icon={MapPin} label="Zone Number" value={selectedProduct.zone_number} />
                <DetailRow icon={Truck} label="Supplier" value={selectedProduct.supplier} />
                <DetailRow icon={StickyNote} label="Description" value={selectedProduct.description} />
                <DetailRow
                  icon={CalendarDays}
                  label="Added on"
                  value={
                    selectedProduct.created_at
                      ? new Date(selectedProduct.created_at).toLocaleDateString("en-US", {
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
                  onClick={() => navigate(`/editproducts/${selectedProduct.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] hover:opacity-90 text-white transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Product
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