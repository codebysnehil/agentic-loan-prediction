import React, { useState, useEffect } from "react";
import type { AgentResult } from "../types";
import { TOOL_LABELS } from "../types";

interface Props {
  loading: boolean;
  result: AgentResult | null;
  error: string | null;
  onClose: () => void;
}

const STEPS = [
  { label: "Financial Score", sub: "Income · obligations · DTI ratio" },
  { label: "Market Rates", sub: "Live interbank rate benchmarking" },
  { label: "Credit Decision", sub: "Eligibility verdict & recommendations" },
];

const V = {
  APPROVED: {
    label: "Approved",
    accent: "#35a866",
    dim: "rgba(53,168,102,0.12)",
    border: "rgba(53,168,102,0.25)",
  },
  BORDERLINE: {
    label: "Conditional",
    accent: "#d4961e",
    dim: "rgba(212,150,30,0.12)",
    border: "rgba(212,150,30,0.25)",
  },
  DECLINED: {
    label: "Not Eligible",
    accent: "#d44e35",
    dim: "rgba(212,78,53,0.12)",
    border: "rgba(212,78,53,0.25)",
  },
};

function fmtINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return "₹" + n.toLocaleString("en-IN");
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Cabinet+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@keyframes overlayIn { from{opacity:0} to{opacity:1} }
@keyframes panelUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes barGrow   { from{width:0} to{width:var(--bar-w,0%)} }
@keyframes stepIn    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

.am-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(8,8,7,0.82);
  backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
  animation: overlayIn 0.2s ease both;
  font-family: 'Cabinet Grotesk', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.am-panel {
  width: 100%; max-width: 620px;
  max-height: 90vh;
  background: #141413;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 40px 100px rgba(0,0,0,0.7);
  animation: panelUp 0.38s cubic-bezier(0.16,1,0.3,1) both;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Scrollable content area */
.am-scroll {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.07) transparent;
}
.am-scroll::-webkit-scrollbar { width: 3px; }
.am-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); }

/* Top accent bar — verdict colour */
.am-accent-bar {
  height: 2px;
  background: var(--v-accent, #d4961e);
  flex-shrink: 0;
}

/* Close */
.am-close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
  font-size: 18px; line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.am-close:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.85); }

/* ─── LOADING ─────────────────────────────── */
.am-loading {
  padding: 3rem 2.5rem;
  display: flex; flex-direction: column; gap: 2rem;
}

.am-loading-head {
  display: flex; flex-direction: column; gap: 5px;
}

.am-loading-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; font-weight: 400;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.01em;
}

.am-loading-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.22);
}

.am-steps { display: flex; flex-direction: column; gap: 1px; }

.am-step {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s, border-color 0.2s;
}

.am-step.s-active {
  background: rgba(212,150,30,0.06);
  border-color: rgba(212,150,30,0.2);
}

.am-step.s-done {
  background: rgba(53,168,102,0.04);
  border-color: rgba(53,168,102,0.12);
}

.am-step-num {
  width: 24px; height: 24px; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px; color: rgba(255,255,255,0.25);
  transition: all 0.2s;
}

.am-step.s-active .am-step-num {
  border-color: rgba(212,150,30,0.5);
  color: #d4961e;
  background: rgba(212,150,30,0.08);
}

.am-step.s-done .am-step-num {
  border-color: rgba(53,168,102,0.4);
  background: rgba(53,168,102,0.12);
  color: #35a866;
  font-size: 12px;
}

.am-step-body { flex: 1; }

.am-step-label {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.3);
  margin-bottom: 2px;
  transition: color 0.2s;
}

.am-step.s-active .am-step-label { color: rgba(255,255,255,0.85); }
.am-step.s-done  .am-step-label { color: rgba(255,255,255,0.5); }

.am-step-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.18);
  transition: color 0.2s;
}

.am-step.s-active .am-step-sub {
  color: rgba(212,150,30,0.7);
  animation: pulse 1.8s ease infinite;
}

.am-step.s-done .am-step-sub { color: rgba(53,168,102,0.5); }

/* spinner inline */
.am-spin {
  width: 14px; height: 14px; flex-shrink: 0;
  border: 1.5px solid rgba(212,150,30,0.2);
  border-top-color: #d4961e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ─── VERDICT HERO ────────────────────────── */
.am-hero {
  padding: 2rem 2.5rem 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative;
}

.am-hero-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  margin-bottom: 1.25rem;
}

.am-verdict-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.am-verdict-left { display: flex; flex-direction: column; gap: 8px; }

.am-verdict-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.14em;
  text-transform: uppercase; font-weight: 500;
  width: fit-content;
  border: 1px solid var(--v-border);
  background: var(--v-dim);
  color: var(--v-accent);
}

.am-verdict-pill-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--v-accent);
}

.am-verdict-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem; font-weight: 400;
  color: rgba(255,255,255,0.92);
  line-height: 1; letter-spacing: -0.01em;
}

.am-verdict-who {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.22);
}

.am-verdict-right { text-align: right; flex-shrink: 0; }

.am-verdict-amt {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem; font-weight: 400;
  color: rgba(255,255,255,0.85);
  line-height: 1; margin-bottom: 4px;
}

.am-verdict-amt-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
}

/* Metric cells */
.am-metrics {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 1px; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.07);
}

.am-metric {
  background: #141413;
  padding: 1rem 1.25rem;
  position: relative;
  overflow: hidden;
}

.am-metric::before {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px;
  background: var(--v-accent);
  opacity: 0.25;
}

.am-metric-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px; letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.22);
  margin-bottom: 6px;
}

.am-metric-val {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem; font-weight: 400;
  color: rgba(255,255,255,0.88);
  line-height: 1;
}

.am-metric-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: rgba(255,255,255,0.25);
  margin-left: 3px;
}

/* ─── TABS ─────────────────────────────────── */
.am-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 2.5rem;
  flex-shrink: 0;
}

.am-tab {
  padding: 14px 0; margin-right: 2rem;
  background: none; border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.16em;
  text-transform: uppercase; cursor: pointer;
  color: rgba(255,255,255,0.25);
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}

.am-tab.on { color: rgba(255,255,255,0.82); }

/* ─── DECISION BODY ─────────────────────────── */
.am-body { padding: 1.75rem 2.5rem; }

/* Score bar */
.am-score-bar-wrap {
  margin-bottom: 1.75rem;
  animation: fadeUp 0.4s ease both;
}

.am-score-bar-head {
  display: flex; justify-content: space-between;
  align-items: baseline; margin-bottom: 8px;
}

.am-score-bar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255,255,255,0.25);
}

.am-score-bar-val {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; color: rgba(255,255,255,0.7);
}

.am-score-track {
  height: 3px;
  background: rgba(255,255,255,0.07);
  position: relative;
}

.am-score-fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--v-accent);
  animation: barGrow 1s cubic-bezier(0.16,1,0.3,1) 0.2s both;
}

/* Detail rows */
.am-details {
  display: flex; flex-direction: column; gap: 0;
  margin-bottom: 1.75rem;
  border: 1px solid rgba(255,255,255,0.06);
  animation: fadeUp 0.4s 0.05s ease both;
}

.am-detail-row {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  gap: 1rem;
}

.am-detail-row:last-child { border-bottom: none; }

.am-detail-key {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.25);
  white-space: nowrap; flex-shrink: 0;
}

.am-detail-val {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.75);
  text-align: right;
}

.am-detail-val strong {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-weight: 400;
  color: rgba(255,255,255,0.9);
}

.am-detail-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.06em;
  color: rgba(255,255,255,0.22);
  margin-left: 6px;
}

/* Lender chips */
.am-chips { display: flex; flex-wrap: wrap; gap: 5px; justify-content: flex-end; }

.am-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.06em;
  padding: 3px 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
}

/* Recommendations */
.am-rec-head {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.18em;
  text-transform: uppercase; color: rgba(255,255,255,0.2);
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 1rem;
  animation: fadeUp 0.4s 0.1s ease both;
}

.am-rec-head::after {
  content: ''; flex: 1; height: 1px;
  background: rgba(255,255,255,0.06);
}

.am-recs { display: flex; flex-direction: column; gap: 1px; }

.am-rec {
  display: flex; gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  animation: stepIn 0.35s ease both;
}

.am-rec-idx {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: rgba(255,255,255,0.2);
  flex-shrink: 0; padding-top: 2px; width: 18px;
}

.am-rec-txt {
  font-size: 13.5px; font-weight: 300; line-height: 1.7;
  color: rgba(255,255,255,0.62);
}

/* ─── TRACE BODY ─────────────────────────────── */
.am-trace {
  padding: 1.75rem 2.5rem;
  display: flex; flex-direction: column; gap: 1px;
}

.am-tstep {
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  animation: stepIn 0.3s ease both;
}

.am-tstep-head {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 16px; cursor: pointer;
  background: rgba(255,255,255,0.02);
  transition: background 0.12s;
}
.am-tstep-head:hover { background: rgba(255,255,255,0.04); }

.am-tstep-n {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.2);
  flex-shrink: 0;
}

.am-tstep-name {
  flex: 1; font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.7);
}

.am-tstep-done {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: #35a866;
}

.am-tstep-tog {
  font-size: 9px; color: rgba(255,255,255,0.2);
  margin-left: 8px;
}

.am-tstep-body {
  padding: 0 16px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
}

.am-mono-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px; letter-spacing: 0.18em;
  text-transform: uppercase; color: rgba(255,255,255,0.2);
  margin: 12px 0 6px;
}

.am-mono-block {
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 12px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; line-height: 1.7;
  color: rgba(255,255,255,0.45);
  overflow-x: auto; white-space: pre;
}

/* ─── ERROR ─────────────────────────────── */
.am-error {
  padding: 4rem 2.5rem; text-align: center;
  display: flex; flex-direction: column;
  align-items: center; gap: 1rem;
}

.am-error-mark {
  width: 44px; height: 44px;
  border: 1px solid rgba(212,78,53,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; color: #d44e35;
}

.am-error-msg {
  font-size: 14px; font-weight: 300;
  color: rgba(255,255,255,0.4);
  line-height: 1.7; max-width: 320px;
}

.am-ghost {
  margin-top: 0.5rem; padding: 10px 24px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px; letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  cursor: pointer; transition: border-color 0.15s, color 0.15s;
}
.am-ghost:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.6); }

@media (max-width: 640px) {
  .am-verdict-row { flex-direction: column; gap: 1rem; }
  .am-verdict-right { text-align: left; }
  .am-metrics { grid-template-columns: 1fr 1fr; }
  .am-hero, .am-body { padding: 1.5rem; }
  .am-tabs { padding: 0 1.5rem; }
  .am-trace { padding: 1.5rem; }
}
`;

export const AnalysisModal: React.FC<Props> = ({
  loading,
  result,
  error,
  onClose,
}) => {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [loadStep, setLoadStep] = useState(0);
  const [tab, setTab] = useState<"decision" | "trace">("decision");

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setLoadStep((s) => Math.min(s + 1, STEPS.length - 1)),
      2400,
    );
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const decision = result ?? null;
  const vm = decision ? V[decision.verdict as keyof typeof V] : null;

  const cssVars = vm
    ? ({
        "--v-accent": vm.accent,
        "--v-dim": vm.dim,
        "--v-border": vm.border,
      } as React.CSSProperties)
    : {};

  const dti = decision ? Math.round(decision.dti_ratio * 100) : 0;
  const dtiNote =
    dti < 35
      ? "Well within limits"
      : dti < 50
        ? "Moderate — acceptable"
        : "High — action advised";
  const scoreWidth = decision ? `${decision.financial_score}%` : "0%";

  return (
    <>
      <style>{CSS}</style>

      <div
        className="am-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="am-panel" style={cssVars}>
          {/* Accent bar */}
          <div className="am-accent-bar" />

          {/* Close */}
          <button className="am-close" onClick={onClose}>
            ×
          </button>

          <div className="am-scroll">
            {/* ── LOADING ── */}
            {loading && (
              <div className="am-loading">
                <div className="am-loading-head">
                  <div className="am-loading-title">Analysing your profile</div>
                  <div className="am-loading-sub">
                    AI Credit Engine · Processing
                  </div>
                </div>

                <div className="am-steps">
                  {STEPS.map((s, i) => (
                    <div
                      key={i}
                      className={`am-step${i === loadStep ? " s-active" : ""}${i < loadStep ? " s-done" : ""}`}
                    >
                      <div className="am-step-num">
                        {i < loadStep ? (
                          "✓"
                        ) : i === loadStep ? (
                          <div className="am-spin" />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </div>
                      <div className="am-step-body">
                        <div className="am-step-label">{s.label}</div>
                        <div className="am-step-sub">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {!loading && error && (
              <div className="am-error">
                <div className="am-error-mark">!</div>
                <div className="am-error-msg">{error}</div>
                <button className="am-ghost" onClick={onClose}>
                  Dismiss
                </button>
              </div>
            )}

            {/* ── RESULT ── */}
            {!loading && decision && vm && (
              <>
                {/* Hero */}
                <div className="am-hero">
                  <div className="am-hero-eyebrow">
                    Credit Eligibility · Meridian Capital · AI Assessment
                  </div>

                  <div className="am-verdict-row">
                    <div className="am-verdict-left">
                      <div className="am-verdict-pill">
                        <div className="am-verdict-pill-dot" />
                        {vm.label}
                      </div>
                      <div className="am-verdict-name">
                        {decision.applicant_name ?? "Applicant"}
                      </div>
                      <div className="am-verdict-who">Loan Applicant</div>
                    </div>
                    <div className="am-verdict-right">
                      <div className="am-verdict-amt">
                        {fmtINR(decision.requested_loan ?? 0)}
                      </div>
                      <div className="am-verdict-amt-sub">
                        Requested Principal
                      </div>
                    </div>
                  </div>

                  <div className="am-metrics">
                    {[
                      {
                        label: "Credit Score",
                        value: String(decision.financial_score),
                        unit: "/ 100",
                      },
                      {
                        label: "Debt-to-Income",
                        value: String(dti),
                        unit: "%",
                      },
                      {
                        label: "Interest Rate",
                        value: String(decision.recommended_rate),
                        unit: "% p.a.",
                      },
                    ].map((m) => (
                      <div className="am-metric" key={m.label}>
                        <div className="am-metric-lbl">{m.label}</div>
                        <div>
                          <span className="am-metric-val">{m.value}</span>
                          <span className="am-metric-unit">{m.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="am-tabs">
                  {(["decision", "trace"] as const).map((t) => (
                    <button
                      key={t}
                      className={`am-tab${tab === t ? " on" : ""}`}
                      style={tab === t ? { borderBottomColor: vm.accent } : {}}
                      onClick={() => setTab(t)}
                    >
                      {t === "decision" ? "Decision" : "Agent Trace"}
                    </button>
                  ))}
                </div>

                {/* Decision tab */}
                {tab === "decision" && (
                  <div className="am-body">
                    {/* Score bar */}
                    <div className="am-score-bar-wrap">
                      <div className="am-score-bar-head">
                        <span className="am-score-bar-label">Credit Score</span>
                        <span className="am-score-bar-val">
                          {decision.financial_score} / 100
                        </span>
                      </div>
                      <div className="am-score-track">
                        <div
                          className="am-score-fill"
                          style={
                            {
                              "--bar-w": scoreWidth,
                              width: scoreWidth,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>

                    {/* Detail rows */}
                    <div className="am-details">
                      <div className="am-detail-row">
                        <span className="am-detail-key">Monthly EMI</span>
                        <span className="am-detail-val">
                          <strong>
                            {fmtINR(decision.new_emi_estimate)}
                          </strong>
                          <span className="am-detail-note">/ month</span>
                        </span>
                      </div>
                      <div className="am-detail-row">
                        <span className="am-detail-key">Interest Rate</span>
                        <span className="am-detail-val">
                          <strong>{decision.recommended_rate}%</strong>
                          <span className="am-detail-note">per annum</span>
                        </span>
                      </div>
                      <div className="am-detail-row">
                        <span className="am-detail-key">Debt-to-Income</span>
                        <span className="am-detail-val">
                          <strong>{dti}%</strong>
                          <span className="am-detail-note">— {dtiNote}</span>
                        </span>
                      </div>
                      {decision.available_lenders?.length > 0 && (
                        <div className="am-detail-row">
                          <span className="am-detail-key">Lenders</span>
                          <div className="am-chips">
                            {decision.available_lenders.map(
                              (l: string) => (
                                <span className="am-chip" key={l}>
                                  {l}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {decision.recommendations.length > 0 && (
                      <>
                        <div className="am-rec-head">Advisor Notes</div>
                        <div className="am-recs">
                          {decision.recommendations.map((r, i) => (
                            <div
                              className="am-rec"
                              key={i}
                              style={{ animationDelay: `${i * 0.06}s` }}
                            >
                              <div className="am-rec-idx">0{i + 1}</div>
                              <div className="am-rec-txt">{r}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Trace tab */}
                {tab === "trace" && (
                  <div className="am-trace">
                    {decision.steps.map((step, i) => {
                      const cfg = TOOL_LABELS[step.tool] ?? {
                        label: step.tool,
                      };
                      const open = openStep === i;
                      return (
                        <div
                          className="am-tstep"
                          key={i}
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          <div
                            className="am-tstep-head"
                            onClick={() => setOpenStep(open ? null : i)}
                          >
                            <div className="am-tstep-n">
                              Step {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="am-tstep-name">{cfg.label}</div>
                            <div className="am-tstep-done">Complete</div>
                            <div className="am-tstep-tog">
                              {open ? "▲" : "▼"}
                            </div>
                          </div>
                          {open && (
                            <div className="am-tstep-body">
                              <div className="am-mono-lbl">Input</div>
                              <div className="am-mono-block">
                                {JSON.stringify(step.input, null, 2)}
                              </div>
                              <div className="am-mono-lbl">Output</div>
                              <div className="am-mono-block">
                                {JSON.stringify(step.output, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
