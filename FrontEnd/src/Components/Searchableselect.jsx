import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";


export default function SearchableSelect({ options, value, onChange, placeholder, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.id === value);

  const filtered = options.filter((o) =>
    `${o.label} ${o.subLabel || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition text-left relative"
      >
        {Icon && <Icon className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />}
        <span className={`flex-1 truncate ${selected ? "text-slate-800" : "text-slate-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
          <div className="relative border-b border-slate-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full py-2 pr-3 text-sm outline-none pl-9"
            />
          </div>

          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400">No matches found</p>
            )}
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id, o);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
              >
                <span>
                  <span className="text-slate-800">{o.label}</span>
                  {o.subLabel && <span className="text-slate-400 ml-1.5 text-xs">{o.subLabel}</span>}
                </span>
                {o.id === value && <Check className="w-4 h-4 text-[#1E40AF] shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}