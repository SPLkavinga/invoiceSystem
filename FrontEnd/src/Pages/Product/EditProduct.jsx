import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Package,
  Hash,
  Tag,
  DollarSign,
  Boxes,
  CalendarClock,
  MapPin,
  Layers,
  Truck,
  ImagePlus,
  Save,
  ArrowLeft,
  X,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";

const API_URL = "http://localhost:5000/api/products";
const IMAGE_BASE = "http://localhost:5000/uploads/products/";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [collapsed, setCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    productName: "",
    productCode: "",
    category: "",
    price: "",
    costPrice: "",
    quantity: "",
    unit: "pcs",
    expireDate: "",
    rackNo: "",
    zoneNumber: "",
    supplier: "",
    description: "",
  });

  // load the existing product and pre-fill the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load product");

        const p = data.product;
        setForm({
          productName: p.product_name || "",
          productCode: p.product_code || "",
          category: p.category || "",
          price: p.price ?? "",
          costPrice: p.cost_price ?? "",
          quantity: p.quantity ?? "",
          unit: p.unit || "pcs",
          expireDate: p.expire_date ? p.expire_date.split("T")[0] : "",
          rackNo: p.rack_no || "",
          zoneNumber: p.zone_number || "",
          supplier: p.supplier || "",
          description: p.description || "",
        });
        setExistingImage(p.image);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (fileInputRef.current.files[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          // do NOT set Content-Type manually — the browser sets the correct
          // multipart/form-data boundary automatically for FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => navigate("/products/view"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imagePreview || (existingImage ? `${IMAGE_BASE}${existingImage}` : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="max-w-4xl p-6 mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center transition-colors bg-white border rounded-lg w-9 h-9 border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Edit Product</h1>
              <p className="text-sm text-slate-500 mt-0.5">Update this product's details below.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
              {success}
            </div>
          )}

          {loading ? (
            <div className="p-10 text-sm text-center bg-white border rounded-2xl border-slate-200 text-slate-400">
              Loading product details…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo + basic info */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                  {/* Image uploader */}
                  <div className="flex flex-col items-center gap-2 mx-auto shrink-0 sm:mx-0">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] flex items-center justify-center cursor-pointer overflow-hidden ring-4 ring-blue-50 group"
                    >
                      {displayImage ? (
                        <img src={displayImage} alt="Product" className="object-cover w-full h-full" />
                      ) : (
                        <ImagePlus className="transition-colors w-7 h-7 text-white/70 group-hover:text-white" />
                      )}
                      <div className="absolute inset-0 transition-colors bg-black/0 group-hover:bg-black/20" />
                    </div>
                    {displayImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setExistingImage(null);
                          fileInputRef.current.value = "";
                        }}
                        className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                    {!displayImage && <span className="text-xs text-slate-400">Upload photo</span>}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  {/* Name + code + category */}
                  <div className="grid flex-1 w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">PRODUCT NAME</label>
                      <div className="relative">
                        <Package className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          name="productName"
                          value={form.productName}
                          onChange={handleChange}
                          placeholder="e.g. Samsung 20L Microwave"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">PRODUCT NUMBER (SKU)</label>
                      <div className="relative">
                        <Hash className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          name="productCode"
                          value={form.productCode}
                          onChange={handleChange}
                          placeholder="e.g. PRD-1024"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">CATEGORY</label>
                      <div className="relative">
                        <Tag className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          placeholder="e.g. Electronics"
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & stock */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Pricing & stock</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">SELLING PRICE</label>
                    <div className="relative">
                      <DollarSign className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">COST PRICE</label>
                    <div className="relative">
                      <DollarSign className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="costPrice"
                        value={form.costPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">QUANTITY IN STOCK</label>
                    <div className="relative">
                      <Boxes className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">UNIT</label>
                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="litre">litre</option>
                      <option value="box">box</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Storage & expiry */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Storage & expiry</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">EXPIRE DATE</label>
                    <div className="relative">
                      <CalendarClock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="date"
                        name="expireDate"
                        value={form.expireDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">RACK NO</label>
                    <div className="relative">
                      <Layers className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="rackNo"
                        value={form.rackNo}
                        onChange={handleChange}
                        placeholder="e.g. R-12"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">ZONE NUMBER</label>
                    <div className="relative">
                      <MapPin className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="zoneNumber"
                        value={form.zoneNumber}
                        onChange={handleChange}
                        placeholder="e.g. Z-04"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier & notes */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Supplier & notes</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">SUPPLIER</label>
                    <div className="relative">
                      <Truck className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="supplier"
                        value={form.supplier}
                        onChange={handleChange}
                        placeholder="e.g. Colombo Distributors Pvt Ltd"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">DESCRIPTION / NOTES</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Any additional details about this product (optional)"
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pb-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0B1F3A] hover:bg-[#132a52] text-white transition-colors disabled:opacity-70"
                >
                  {saving ? (
                    "Saving…"
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}