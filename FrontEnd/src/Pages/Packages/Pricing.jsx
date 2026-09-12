import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles, Loader2, ShieldQuestion, PartyPopper, ArrowRight, BadgeCheck } from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import Navbar from "../../Components/Navbar";

const PLANS_URL = "http://localhost:5000/api/plans";
const CURRENT_PLAN_URL = "http://localhost:5000/api/plans/current";
const SELECT_PLAN_URL = "http://localhost:5000/api/plans/select";

const money = (n) =>
  Number(n) === 0 ? "Free" : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const limitText = (value, singular) =>
  value === null ? `Unlimited ${singular}` : `${value} ${singular} / mo`;

const ModalStyles = () => (
  <style>{`
    @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .overlay-anim { animation: overlayIn 0.2s ease-out; }
    .modal-anim { animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
  `}</style>
);

export default function Pricing() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null); // { id, name, slug, price } | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmPlan, setConfirmPlan] = useState(null); // plan awaiting confirmation
  const [successInfo, setSuccessInfo] = useState(null); // { plan, message, previousPlanName }
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const requests = [fetch(PLANS_URL)];
        if (token) requests.push(fetch(CURRENT_PLAN_URL, { headers: { Authorization: `Bearer ${token}` } }));

        const [plansRes, currentRes] = await Promise.all(requests);
        const plansData = await plansRes.json();
        if (!plansRes.ok) throw new Error(plansData.message || "Failed to load plans");
        setPlans(plansData.plans);

        if (currentRes) {
          const currentData = await currentRes.json();
          if (currentRes.ok) setCurrentPlan(currentData.plan);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildFeatures = (plan) => [
    { label: limitText(plan.invoice_limit, "invoices"), included: true },
    { label: limitText(plan.customer_limit, "customers"), included: true },
    { label: limitText(plan.product_limit, "products"), included: true },
    { label: limitText(plan.team_member_limit, "team members"), included: true },
    {
      label: plan.storage_limit_mb === null ? "Unlimited storage" : `${plan.storage_limit_mb}MB photo storage`,
      included: true,
    },
    { label: "Reports & analytics", included: !!plan.has_reports },
    { label: "PDF export & printing", included: !!plan.has_pdf_export },
    { label: "Custom invoice branding", included: !!plan.has_custom_branding },
    { label: "Priority support", included: !!plan.has_priority_support },
    { label: "Multi-currency support", included: !!plan.has_multi_currency },
    { label: "API access", included: !!plan.has_api_access },
  ];

  const ctaLabel = (slug) => {
    if (slug === "free") return "Start for free";
    if (slug === "pro") return "Upgrade to Pro";
    return "Go Ultra";
  };

  // once the user's current package number is greater than 1 (a paid plan),
  // they can no longer go back to package 1 (Free) — mirrors the backend rule
  const isBlockedFreeDowngrade = (plan) => {
    return !!currentPlan && Number(currentPlan.id) > 1 && Number(plan.id) === 1;
  };

  // step 1: clicking a plan button either sends logged-out users to signup,
  // blocks a disallowed free-downgrade with an inline error, or opens the
  // confirmation modal for a normal, allowed switch
  const requestSelectPlan = (plan) => {
    setError("");

    if (!token) {
      navigate("/signup");
      return;
    }

    if (currentPlan && Number(currentPlan.id) === Number(plan.id)) {
      return; // already on this plan — button is disabled anyway
    }

    if (isBlockedFreeDowngrade(plan)) {
      setError("Cannot select this free package — you've already upgraded to a paid plan.");
      return;
    }

    setConfirmPlan(plan);
  };

  // step 2: user confirmed — actually call the API
  const confirmSelectPlan = async () => {
    if (!confirmPlan) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(SELECT_PLAN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: confirmPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to switch plan");

      setSuccessInfo({
        plan: confirmPlan,
        message: data.message,
        previousPlanName: data.previousPlanName,
      });
      setCurrentPlan(confirmPlan); // reflect the change immediately
      setConfirmPlan(null);
    } catch (err) {
      setError(err.message);
      setConfirmPlan(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ModalStyles />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-[#B9C7E0] mt-3 max-w-xl mx-auto">
            Start free, upgrade whenever your invoicing needs grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <main className="max-w-6xl mx-auto px-6 -mt-10 pb-20">
          {error && (
            <div className="mb-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5 max-w-md mx-auto">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
              Loading plans…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {plans.map((plan) => {
                const popular = !!plan.is_popular;
                const features = buildFeatures(plan);
                const isCurrent = currentPlan && Number(currentPlan.id) === Number(plan.id);
                const blockedFree = isBlockedFreeDowngrade(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl overflow-hidden transition-shadow ${
                      isCurrent
                        ? "border-2 border-emerald-400 shadow-2xl md:-mt-4 md:mb-4"
                        : popular
                        ? "border-2 border-[#1E40AF] shadow-2xl md:-mt-4 md:mb-4"
                        : "border border-slate-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isCurrent ? (
                      <div className="absolute top-0 inset-x-0 bg-emerald-500 text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        YOUR CURRENT PLAN
                      </div>
                    ) : (
                      popular && (
                        <div className="absolute top-0 inset-x-0 bg-[#1E40AF] text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          MOST POPULAR
                        </div>
                      )
                    )}

                    <div className={`p-7 ${isCurrent || popular ? "pt-11" : ""}`}>
                      <h2 className="text-lg font-semibold text-[#0B1F3A]">{plan.name}</h2>
                      <p className="text-sm text-slate-500 mt-1">{plan.tagline}</p>

                      <div className="mt-5 flex items-baseline gap-1">
                        <span className="text-3xl font-semibold text-[#0B1F3A]">{money(plan.price)}</span>
                        {Number(plan.price) > 0 && (
                          <span className="text-sm text-slate-400">/ {plan.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                        )}
                      </div>

                      <button
                        onClick={() => requestSelectPlan(plan)}
                        disabled={isCurrent || blockedFree}
                        title={blockedFree ? "You've already upgraded — the Free plan is no longer available." : undefined}
                        className={`w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          isCurrent
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                            : blockedFree
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : popular
                            ? "bg-[#0B1F3A] hover:bg-[#132a52] text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-[#0B1F3A] border border-slate-200"
                        }`}
                      >
                        {isCurrent ? "Current Plan" : blockedFree ? "Not available" : ctaLabel(plan.slug)}
                      </button>

                      <ul className="mt-7 space-y-3">
                        {features.map((f) => (
                          <li key={f.label} className="flex items-start gap-2.5 text-sm">
                            {f.included ? (
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                            )}
                            <span className={f.included ? "text-slate-700" : "text-slate-400"}>{f.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-sm text-slate-400 mt-10">
            Limits reset monthly. Need something custom?{" "}
            <a href="#" className="text-[#1E40AF] font-medium hover:text-[#3B82F6]">
              Contact us
            </a>
          </p>
        </main>
      </div>

      {/* Confirmation modal */}
      {confirmPlan && (
        <div
          className="overlay-anim fixed inset-0 z-40 flex items-center justify-center bg-[#0B1F3A]/50 backdrop-blur-sm px-4"
          onClick={() => !submitting && setConfirmPlan(null)}
        >
          <div
            className="modal-anim relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1F3A] via-[#1E40AF] to-[#3B82F6]" />

            <div className="p-7">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                <ShieldQuestion className="w-6 h-6 text-[#1E40AF]" />
              </div>

              <h3 className="text-lg font-semibold text-[#0B1F3A]">Switch to {confirmPlan.name}?</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                You're about to switch your account to the <span className="font-semibold text-[#0B1F3A]">{confirmPlan.name}</span> plan
                {Number(confirmPlan.price) > 0
                  ? ` at ${money(confirmPlan.price)} / ${confirmPlan.billing_cycle === "monthly" ? "mo" : "yr"}`
                  : ""}. Your limits and features will update immediately.
              </p>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => setConfirmPlan(null)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSelectPlan}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#0B1F3A] hover:bg-[#132a52] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Switching…
                    </>
                  ) : (
                    "Yes, switch"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success popup */}
      {successInfo && (
        <div
          className="overlay-anim fixed inset-0 z-40 flex items-center justify-center bg-[#0B1F3A]/50 backdrop-blur-sm px-4"
          onClick={() => setSuccessInfo(null)}
        >
          <div
            className="modal-anim relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSuccessInfo(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* celebratory header */}
            <div className="relative bg-gradient-to-br from-[#0B1F3A] via-[#122A52] to-[#1E40AF] px-7 pt-10 pb-14 text-center overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#3B82F6] rounded-full blur-[70px] opacity-30" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#F0B429] rounded-full blur-[70px] opacity-20" />

              <div className="relative w-16 h-16 mx-auto rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center">
                <PartyPopper className="w-7 h-7 text-[#F0B429]" />
              </div>
              <p className="relative text-xs font-semibold text-[#B9C7E0] tracking-wide mt-4">YOU'RE ALL SET</p>
              <h3 className="relative text-2xl font-semibold text-white mt-1">{successInfo.plan.name} Plan</h3>
              {Number(successInfo.plan.price) > 0 && (
                <p className="relative text-sm text-[#B9C7E0] mt-1">
                  {money(successInfo.plan.price)} / {successInfo.plan.billing_cycle === "monthly" ? "month" : "year"}
                </p>
              )}

              {successInfo.previousPlanName && successInfo.previousPlanName !== successInfo.plan.name && (
                <div className="relative flex items-center justify-center gap-2 mt-4 text-xs font-medium text-[#B9C7E0]">
                  <span className="px-2.5 py-1 rounded-full bg-white/10">{successInfo.previousPlanName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white">{successInfo.plan.name}</span>
                </div>
              )}
            </div>

            {/* body */}
            <div className="px-7 pb-7 -mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <p className="text-sm text-slate-600 mb-3">{successInfo.message}</p>

                <p className="text-xs font-semibold text-slate-400 tracking-wide mb-2.5">WHAT'S INCLUDED NOW</p>
                <ul className="space-y-2">
                  {buildFeatures(successInfo.plan)
                    .filter((f) => f.included)
                    .slice(0, 4)
                    .map((f) => (
                      <li key={f.label} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f.label}
                      </li>
                    ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSuccessInfo(null);
                  navigate("/landingpage");
                }}
                className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold bg-[#0B1F3A] hover:bg-[#132a52] text-white transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}