import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  CalendarDays,
  Plus,
  Trash2,
  Package,
  Percent,
  Wallet,
  Save,
  ArrowLeft,
  StickyNote,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";
import SearchableSelect from "../../Components/SearchableSelect";

const CUSTOMERS_URL = "http://localhost:5000/api/customers";
const PRODUCTS_URL = "http://localhost:5000/api/products";
const INVOICES_URL = "http://localhost:5000/api/invoices";

const emptyItem = () => ({
  productId: "",
  productName: "",
  quantity: 1,
  unitPrice: 0,
  availableStock: null, // null = no product selected yet
});

export default function AddInvoice() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [collapsed, setCollapsed] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Date.now().toString().slice(-8)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  // load this user's customers and products for the dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch(CUSTOMERS_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(PRODUCTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const custData = await custRes.json();
        const prodData = await prodRes.json();
        if (!custRes.ok) throw new Error(custData.message || "Failed to load customers");
        if (!prodRes.ok) throw new Error(prodData.message || "Failed to load products");

        setCustomers(
          custData.customers.map((c) => ({ id: c.id, label: c.customer_name, subLabel: c.tp_number }))
        );
        setProducts(
          prodData.products.map((p) => ({
            id: p.id,
            label: p.product_name,
            subLabel: `${p.product_code} · ${p.quantity} in stock`,
            price: p.price,
            stock: p.quantity,
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateItem = (index, changes) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  };

  const handleProductSelect = (index, productId, product) => {
    updateItem(index, {
      productId,
      productName: product.label,
      unitPrice: product.price,
      availableStock: product.stock,
      quantity: 1, // reset quantity whenever the product changes
    });
  };

  const addItemRow = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItemRow = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  // live totals
  const subtotal = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
  const taxAmount = (subtotal * Number(taxPercent || 0)) / 100;
  const totalAmount = subtotal - Number(discount || 0) + taxAmount;
  const balance = totalAmount - Number(paidAmount || 0);
  const status = balance <= 0 ? "Paid" : Number(paidAmount) > 0 ? "Partial" : "Unpaid";

  const statusStyles = {
    Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Partial: "bg-amber-50 text-amber-600 border-amber-200",
    Unpaid: "bg-rose-50 text-rose-600 border-rose-200",
  };

  // any line item whose requested quantity exceeds what's currently in stock
  const stockIssues = items.filter(
    (i) => i.availableStock !== null && Number(i.quantity) > i.availableStock
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!customerId) return setError("Please select a customer");
    if (items.some((i) => !i.productId)) return setError("Please select a product for every line item");

    if (stockIssues.length > 0) {
      const first = stockIssues[0];
      setError(
        `Not enough stock for "${first.productName}". Available: ${first.availableStock}, requested: ${first.quantity}.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          invoiceNumber,
          invoiceDate,
          dueDate: dueDate || null,
          discount,
          taxPercent,
          paidAmount,
          notes,
          items,
        }),
      });

      const data = await res.json();
      // the backend re-validates stock too (in case it changed since this page loaded)
      // and returns a clear message if a race condition or stale data caused a conflict
      if (!res.ok) throw new Error(data.message || "Failed to save invoice");

      setSuccess("Invoice created successfully!");
      setTimeout(() => navigate("/viewinvoices"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        <main className="max-w-5xl p-6 mx-auto">
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
              <h1 className="text-xl font-semibold text-[#0B1F3A]">Create New Invoice</h1>
              <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to generate an invoice.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
              {success}
            </div>
          )}

          {loadingData ? (
            <div className="p-10 text-sm text-center bg-white border rounded-2xl border-slate-200 text-slate-400">
              Loading customers and products…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invoice info + customer */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Invoice details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">CUSTOMER</label>
                    <SearchableSelect
                      icon={User}
                      options={customers}
                      value={customerId}
                      onChange={(id) => setCustomerId(id)}
                      placeholder="Select a customer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">INVOICE NUMBER</label>
                    <div className="relative">
                      <FileText className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">INVOICE DATE</label>
                    <div className="relative">
                      <CalendarDays className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">DUE DATE</label>
                    <div className="relative">
                      <CalendarDays className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#0B1F3A]">Products</h2>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1E40AF] hover:text-[#3B82F6] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add product
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                    const overStock = item.availableStock !== null && Number(item.quantity) > item.availableStock;

                    return (
                      <div key={index}>
                        <div
                          className={`grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end p-3 rounded-xl border ${
                            overStock ? "bg-rose-50/60 border-rose-200" : "bg-slate-50/60 border-slate-100"
                          }`}
                        >
                          <div>
                            {index === 0 && (
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">PRODUCT</label>
                            )}
                            <SearchableSelect
                              icon={Package}
                              options={products}
                              value={item.productId}
                              onChange={(id, product) => handleProductSelect(index, id, product)}
                              placeholder="Select a product"
                            />
                          </div>

                          <div>
                            {index === 0 && (
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">QTY</label>
                            )}
                            <input
                              type="number"
                              min="1"
                              max={item.availableStock ?? undefined}
                              value={item.quantity}
                              onChange={(e) => updateItem(index, { quantity: e.target.value })}
                              className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white outline-none focus:ring-4 transition ${
                                overStock
                                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                  : "border-slate-200 focus:border-[#3B82F6] focus:ring-blue-100"
                              }`}
                            />
                          </div>

                          <div>
                            {index === 0 && (
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">UNIT PRICE</label>
                            )}
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                            />
                          </div>

                          <div>
                            {index === 0 && (
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">AMOUNT</label>
                            )}
                            <div className="px-3 py-2.5 text-sm font-medium rounded-lg bg-white border border-slate-200 text-[#0B1F3A]">
                              {amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            disabled={items.length === 1}
                            className="flex items-center justify-center transition-colors rounded-lg w-9 h-9 text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {overStock && (
                          <p className="flex items-center gap-1.5 mt-1.5 ml-1 text-xs font-medium text-rose-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Only {item.availableStock} in stock — reduce the quantity to continue.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment summary */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Payment summary</h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* left: discount / tax / paid inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">DISCOUNT (AMOUNT)</label>
                      <div className="relative">
                        <Wallet className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">TAX</label>
                      <div className="relative">
                        <Percent className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={taxPercent}
                          onChange={(e) => setTaxPercent(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">PAID AMOUNT</label>
                      <div className="relative">
                        <Wallet className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* right: live totals card */}
                  <div className="bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] rounded-xl p-5 text-white space-y-2.5 h-fit">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#B9C7E0]">Subtotal</span>
                      <span>{subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#B9C7E0]">Discount</span>
                      <span>- {Number(discount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#B9C7E0]">Tax ({Number(taxPercent || 0)}%)</span>
                      <span>+ {taxAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="h-px my-1 bg-white/10" />
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#B9C7E0]">Paid</span>
                      <span>{Number(paidAmount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-[#B9C7E0]">Balance</span>
                      <span>{balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[status]}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-6 bg-white border rounded-2xl border-slate-200">
                <h2 className="text-sm font-semibold text-[#0B1F3A] mb-4">Additional notes</h2>
                <div className="relative">
                  <StickyNote className="absolute w-4 h-4 left-3 top-3 text-slate-400" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, delivery instructions, or any other remarks (optional)"
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition resize-none"
                  />
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
                  disabled={saving || stockIssues.length > 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0B1F3A] hover:bg-[#132a52] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    "Saving…"
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Invoice
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