import React, { useEffect, useRef, useState } from "react";
import { Search, Bell, ChevronDown, User, X, Mail, IdCard, ShieldCheck } from "lucide-react";

const PopupStyles = () => (
  <style>{`
    @keyframes popIn {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .pop-anim { animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
    .drop-anim { animation: dropIn 0.15s ease-out; }
  `}</style>
);

export default function Navbar() {
  const [user, setUser] = useState({ username: "Guest", email: "", idNumber: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // close the dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user.username || "Guest").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <PopupStyles />

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search invoices, customers…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 transition"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F0B429]" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#1E40AF] text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.username}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="drop-anim absolute right-0 top-11 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A] transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile popup — top-right corner */}
      {profileOpen && (
        <div className="fixed top-6 right-6 z-30 pop-anim">
          <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* header */}
            <div className="relative bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-5 pt-5 pb-8">
              <button
                onClick={() => setProfileOpen(false)}
                className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 text-white font-semibold flex items-center justify-center text-lg">
                {initials}
              </div>
            </div>

            {/* body */}
            <div className="px-5 pb-5 -mt-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-sm font-semibold text-[#0B1F3A]">{user.username}</p>
                <p className="text-xs text-slate-400 mb-3">Logged in</p>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-[#1E40AF] shrink-0" />
                    <span className="truncate">{user.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <IdCard className="w-4 h-4 text-[#1E40AF] shrink-0" />
                    <span>{user.idNumber || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-emerald-600 text-xs font-medium pt-1">
                    <ShieldCheck className="w-4 h-4" />
                    Session verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}