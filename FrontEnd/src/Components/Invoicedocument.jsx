import React from "react";
import { FileText, Printer } from "lucide-react";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Partial: "bg-amber-50 text-amber-600 border-amber-200",
  Unpaid: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function InvoiceDocument({ invoice, items, onClose }) {
  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-invoice, .printable-invoice * { visibility: visible; }
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-[#0B1F3A]/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
        <div className="w-full max-w-3xl">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="font-semibold text-white">Invoice {invoice.invoice_number}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white text-[#0B1F3A] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / Save as PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>

          {/* The actual invoice paper */}
          <div className="overflow-hidden bg-white shadow-2xl printable-invoice rounded-2xl">
            {/* Letterhead */}
            <div className="flex items-start justify-between px-10 pt-10 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#F0B429]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#0B1F3A]">Serasinghe</p>
                  <p className="text-xs text-slate-400">Invoice Management System</p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-2xl font-semibold text-[#0B1F3A] tracking-tight">INVOICE</h1>
                <p className="mt-1 font-mono text-sm text-slate-500">{invoice.invoice_number}</p>
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[invoice.status]}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>

            {/* Bill to + dates */}
            <div className="grid grid-cols-2 gap-6 px-10 py-8">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400">BILL TO</p>
                <p className="text-sm font-semibold text-[#0B1F3A]">{invoice.customer_name}</p>
                {invoice.customer_company && (
                  <p className="text-sm text-slate-500">{invoice.customer_company}</p>
                )}
                {invoice.customer_address && (
                  <p className="text-sm whitespace-pre-line text-slate-500">{invoice.customer_address}</p>
                )}
                {invoice.customer_phone && <p className="text-sm text-slate-500">{invoice.customer_phone}</p>}
                {invoice.customer_email && <p className="text-sm text-slate-500">{invoice.customer_email}</p>}
              </div>

              <div className="text-right">
                <div className="mb-2">
                  <p className="text-xs font-semibold tracking-wide text-slate-400">INVOICE DATE</p>
                  <p className="text-sm text-slate-700">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400">DUE DATE</p>
                  <p className="text-sm text-slate-700">{formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="px-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-left border-y border-slate-100 text-slate-400">
                    <th className="w-8 py-3 font-semibold">#</th>
                    <th className="py-3 font-semibold">Product</th>
                    <th className="py-3 font-semibold text-right">Qty</th>
                    <th className="py-3 font-semibold text-right">Unit Price</th>
                    <th className="py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="py-3 text-slate-400">{i + 1}</td>
                      <td className="py-3 text-slate-700">{item.product_name}</td>
                      <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">{money(item.unit_price)}</td>
                      <td className="py-3 text-right font-medium text-[#0B1F3A]">{money(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end px-10 py-6">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{money(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Discount</span>
                  <span>- {money(invoice.discount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax ({Number(invoice.tax_percent)}%)</span>
                  <span>+ {money(invoice.tax_amount)}</span>
                </div>
                <div className="h-px my-1 bg-slate-100" />
                <div className="flex justify-between text-base font-semibold text-[#0B1F3A]">
                  <span>Total</span>
                  <span>{money(invoice.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Paid</span>
                  <span>{money(invoice.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#0B1F3A]">
                  <span>Balance Due</span>
                  <span>{money(invoice.balance_amount)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="px-10 pb-8">
                <p className="text-xs font-semibold text-slate-400 tracking-wide mb-1.5">NOTES</p>
                <p className="text-sm whitespace-pre-line text-slate-600">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-10 py-5 text-center border-t bg-slate-50 border-slate-100">
              <p className="text-xs text-slate-400">Thank you for your business.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}