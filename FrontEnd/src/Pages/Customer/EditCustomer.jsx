import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  IdCard,
  Phone,
  Printer,
  Building2,
  MapPin,
  Mail,
  ImagePlus,
  Save,
  ArrowLeft,
  X,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";

const API_URL = "http://localhost:5000/api/customers";
const IMAGE_BASE = "http://localhost:5000/uploads/customers/";

export default function EditCustomer() {
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
    customerName: "",
    nic: "",
    tpNumber: "",
    companyName: "",
    address: "",
    email: "",
    fax: "",
    customerType: "Individual",
    notes: "",
  });

  // load the existing customer and pre-fill the form
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load customer");

        const c = data.customer;
        setForm({
          customerName: c.customer_name || "",
          nic: c.nic || "",
          tpNumber: c.tp_number || "",
          companyName: c.company_name || "",
          address: c.address || "",
          email: c.email || "",
          fax: c.fax || "",
          customerType: c.customer_type || "Individual",
          notes: c.notes || "",
        });
        setExistingImage(c.image);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
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
        throw new Error(data.message || "Failed to update customer");
      }

      setSuccess("Customer updated successfully!");
      setTimeout(() => navigate("/viewcustomer"), 1200);
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
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Edit Customer</h1>
              <p className="text-sm text-slate-500 mt-0.5">Update this customer's details below.</p>
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
              Loading customer details…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile image + basic info */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                  {/* Image uploader */}
                  <div className="flex flex-col items-center gap-2 mx-auto shrink-0 sm:mx-0">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] flex items-center justify-center cursor-pointer overflow-hidden ring-4 ring-blue-50 group"
                    >
                      {displayImage ? (
                        <img src={displayImage} alt="Customer" className="object-cover w-full h-full" />
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

                  {/* Name + type */}
                  <div className="grid flex-1 w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">CUSTOMER NAME</label>
                      <div className="relative">
                        <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          name="customerName"
                          value={form.customerName}
                          onChange={handleChange}
                          placeholder="e.g. Nimal Perera"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">CUSTOMER TYPE</label>
                      <select
                        name="customerType"
                        value={form.customerType}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      >
                        <option>Individual</option>
                        <option>Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIC NUMBER</label>
                      <div className="relative">
                        <IdCard className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          name="nic"
                          value={form.nic}
                          onChange={handleChange}
                          placeholder="e.g. 200012345678"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Contact details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">TELEPHONE NUMBER</label>
                    <div className="relative">
                      <Phone className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="tpNumber"
                        value={form.tpNumber}
                        onChange={handleChange}
                        placeholder="e.g. 077 123 4567"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="customer@email.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">FAX NUMBER</label>
                    <div className="relative">
                      <Printer className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="fax"
                        value={form.fax}
                        onChange={handleChange}
                        placeholder="e.g. 041 222 3344"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">COMPANY NAME</label>
                    <div className="relative">
                      <Building2 className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Perera Imports Pvt Ltd"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">ADDRESS</label>
                    <div className="relative">
                      <MapPin className="absolute w-4 h-4 left-3 top-3 text-slate-400" />
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street, city, postal code"
                        rows={2}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Additional notes</h2>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special remarks about this customer (optional)"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition resize-none"
                />
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
                      Update Customer
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