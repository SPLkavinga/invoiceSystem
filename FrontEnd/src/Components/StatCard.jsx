import React from "react";

export default function StatCard({ icon: Icon, label, value, trend, trendUp = true }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-medium text-slate-500 tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-[#0B1F3A] mt-1.5">{value}</p>
        {trend && (
          <p className={`text-xs font-medium mt-1.5 ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
            {trendUp ? "▲" : "▼"} {trend}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#1E40AF]" />
      </div>
    </div>
  );
}