import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true, path: "/landingpage" },
  {
    label: "Invoices",
    icon: FileText,
    subItems: [
      { label: "Create Invoice", path: "/addinvoice" },
      { label: "View Invoices", path: "/viewinvoices" },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    subItems: [
      { label: "Add Customer", path: "/addcustomer" },
      { label: "View Customers", path: "/viewcustomer" },
    ],
  },
  {
    label: "Products",
    icon: Package,
    subItems: [
      { label: "Add Product", path: "/products/add" },
      { label: "View Products", path: "/products/view" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    subItems: [
      { label: "Sales Report", path: "/reports/sales" },
      { label: "Revenue Report", path: "/reports/revenue" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    subItems: [
      { label: "Profile Settings", path: "/settings/profile" },
      { label: "System Settings", path: "/settings/system" },
    ],
  },
];

const ModalStyles = () => (
  <style>{`
    @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes submenuIn {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 200px; }
    }
    .overlay-anim { animation: overlayIn 0.2s ease-out; }
    .modal-anim { animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .submenu-anim { animation: submenuIn 0.2s ease-out; overflow: hidden; }
  `}</style>
);

export default function Sidebar({ collapsed, setCollapsed }) {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // label of the currently expanded item

  // collapse to icon-only whenever the user clicks anywhere outside the sidebar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setCollapsed(true);
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setCollapsed]);

  // collapse any open submenu when the sidebar itself collapses
  useEffect(() => {
    if (collapsed) setOpenMenu(null);
  }, [collapsed]);

  const handleNavClick = (e, item) => {
    e.stopPropagation();
    if (item.subItems) {
      setOpenMenu((current) => (current === item.label ? null : item.label));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (e, subItem) => {
    e.stopPropagation();
    navigate(subItem.path);
  };

  const requestLogout = (e) => {
    e.stopPropagation(); 
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // replace: true removes the current page from history so back button can't return to it
    navigate("/", { replace: true });
  };

  return (
    <>
      <ModalStyles />

      <aside
        ref={sidebarRef}
        onClick={() => collapsed && setCollapsed(false)}
        className={`hidden md:flex md:flex-col fixed left-0 top-0 h-screen bg-[#0B1F3A] text-white z-20 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 h-16 border-b border-white/10 ${collapsed ? "justify-center" : "px-6"}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 shrink-0">
            <FileText className="w-4 h-4 text-[#F0B429]" />
          </div>
          {!collapsed && <span className="text-base font-semibold tracking-tight text-white">Serasinghe</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const { label, icon: Icon, active, subItems } = item;
            const isOpen = openMenu === label;

            return (
              <div key={label}>
                <button
                  onClick={(e) => handleNavClick(e, item)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${active ? "bg-[#1E40AF] text-white" : "text-[#B9C7E0] hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{label}</span>}
                  {!collapsed && subItems && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {!collapsed && subItems && isOpen && (
                  <div className="submenu-anim mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                    {subItems.map((sub) => (
                      <button
                        key={sub.label}
                        onClick={(e) => handleSubItemClick(e, sub)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#B9C7E0] hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={requestLogout}
            title={collapsed ? "Log out" : undefined}
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-[#B9C7E0] hover:bg-white/5 hover:text-white transition-colors ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && "Log out"}
          </button>
        </div>
      </aside>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="overlay-anim fixed inset-0 z-30 flex items-center justify-center bg-[#0B1F3A]/60 backdrop-blur-sm px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal-anim relative bg-gradient-to-r from-[#0B1F3A] via-[#1E40AF] to-[#3B82F6] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* decorative top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1F3A] via-[#1E40AF] to-[#3B82F6]" />

            <button
              onClick={() => setShowConfirm(false)}
              className="absolute transition-colors top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="pt-6 p-7">
              <h3 className="text-lg font-semibold text-white">Logout from SERASINGHE?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white">
                You'll need to sign in again to access your invoices, customers, and dashboard.
              </p>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-white hover:bg-slate-50 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  Yes, log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}