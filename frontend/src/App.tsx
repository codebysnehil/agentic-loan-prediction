import React, {
  type ChangeEvent,
  type FormEvent,
  useState,
  useEffect,
} from "react";
import { useAgent } from "./hooks/useAgent";
import { AnalysisModal } from "./components/AnalysisModal";
import type { LoanFormData } from "./types";

const LOAN_TYPES = [
  {
    id: "home",
    label: "Home",
    cat: "Residential",
    rate: 8.5,
    tenure: "360",
    tag: "Most Popular",
  },
  {
    id: "car",
    label: "Auto",
    cat: "Vehicle",
    rate: 9.2,
    tenure: "84",
    tag: "",
  },
  {
    id: "student",
    label: "Education",
    cat: "Academic",
    rate: 10.5,
    tenure: "180",
    tag: "0% Margin",
  },
  {
    id: "personal",
    label: "Personal",
    cat: "Unsecured",
    rate: 13.0,
    tenure: "60",
    tag: "",
  },
  {
    id: "business",
    label: "Enterprise",
    cat: "Commerce",
    rate: 11.5,
    tenure: "120",
    tag: "Fast Approval",
  },
  {
    id: "solar",
    label: "Green",
    cat: "Climate",
    rate: 7.5,
    tenure: "240",
    tag: "Lowest Rate",
  },
];

const DEFAULT_TENURE: Record<string, string> = {
  home: "360",
  car: "84",
  student: "180",
  personal: "60",
  business: "120",
  solar: "240",
};

const INITIAL_FORM: LoanFormData = {
  name: "",
  monthly_income: "",
  monthly_emi: "",
  requested_loan: "",
  tenure_months: "60",
  purpose: "personal",
};

function fmt(val: string): string {
  const n = parseFloat(val);
  if (!val || isNaN(n) || n === 0) return "";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Cabinet+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --ink:   #09090a;
  --ink2:  #111113;
  --ink3:  #1a1a1d;
  --ink4:  #252528;
  --ink5:  #303035;
  --g:     #c8881a;
  --g2:    #e8a830;
  --g3:    #f5c050;
  --g-bg:  rgba(200,136,26,0.07);
  --g-bd:  rgba(200,136,26,0.18);
  --cr:    #f0f0ed;
  --cr2:   #d8d6d0;
  --cr3:   #a8a6a0;
  --cr4:   rgba(240,240,237,0.55);
  --cr5:   rgba(240,240,237,0.28);
  --cr6:   rgba(240,240,237,0.12);
  --cr7:   rgba(240,240,237,0.06);
  --cr8:   rgba(240,240,237,0.04);
  --grn:   #34c270;
  --line:  rgba(240,240,237,0.07);
  --line2: rgba(240,240,237,0.12);
}

@keyframes riseIn { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes dot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
@keyframes slide  { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
@keyframes tickIn { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }

html,body {
  height:100%; overflow:hidden;
  background:var(--ink);
  font-family:'Cabinet Grotesk',sans-serif;
  color:var(--cr);
  -webkit-font-smoothing:antialiased;
  letter-spacing:-0.01em;
}

/* ══════════════════════════════════
   SHELL — full viewport, no scroll
══════════════════════════════════ */
.shell {
  height:100vh;
  display:grid;
  grid-template-columns: 1fr 480px;
  overflow:hidden;
}

/* ══════════════════════════════════
   LEFT — editorial dark
══════════════════════════════════ */
.L {
  background: var(--ink);
  display:grid;
  grid-template-rows: 58px 1fr 68px;
  border-right:1px solid var(--line);
  position:relative;
  overflow:hidden;
}

/* Noise grain overlay */
.L::before {
  content:'';
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size:256px 256px;
  pointer-events:none;z-index:0;opacity:0.6;
}

/* Large Playfair watermark number */
.L-watermark {
  position:absolute;
  bottom:-2rem; right:-1rem;
  font-family:'Playfair Display',serif;
  font-size:22rem; font-weight:700;
  color:rgba(255,255,255,0.018);
  line-height:1; pointer-events:none;
  z-index:0; user-select:none;
  letter-spacing:-0.05em;
}

/* ── Nav ── */
.L-nav {
  position:relative;z-index:2;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2.5rem;
  border-bottom:1px solid var(--line);
}

.logo {
  display:flex;align-items:center;gap:10px;
  cursor:default;
}

.logo-mark {
  width:30px;height:30px;
  position:relative;flex-shrink:0;
}

.logo-sq {
  position:absolute;inset:0;
  border:1.5px solid var(--cr6);
  transition:border-color 0.3s;
}

.logo:hover .logo-sq { border-color:var(--g-bd); }

.logo-dm {
  position:absolute;
  width:10px;height:10px;
  background:var(--g);
  top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(45deg);
  transition:background 0.3s;
}

.logo:hover .logo-dm { background:var(--g2); }

.logo-name {
  font-size:15px;font-weight:700;
  letter-spacing:0.06em;text-transform:uppercase;
  color:var(--cr);line-height:1;
}

.logo-sep { width:1px;height:14px;background:var(--line2); }

.logo-tagline {
  font-family:'JetBrains Mono',monospace;
  font-size:8.5px;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--cr5);
}

.L-nav-r {
  display:flex;align-items:center;gap:2rem;
}

.nav-a {
  font-family:'JetBrains Mono',monospace;
  font-size:9px;letter-spacing:0.1em;
  text-transform:uppercase;color:var(--cr6);
  cursor:pointer;transition:color 0.15s;
}
.nav-a:hover { color:var(--cr4); }

.live-badge {
  display:flex;align-items:center;gap:6px;
  padding:4px 11px;
  border:1px solid var(--g-bd);
  background:var(--g-bg);
}

.live-d {
  width:5px;height:5px;border-radius:50%;
  background:var(--g3);
  animation:dot 2.4s ease infinite;
}

.live-t {
  font-family:'JetBrains Mono',monospace;
  font-size:8px;letter-spacing:0.16em;
  text-transform:uppercase;color:var(--g2);
}

/* ── Hero body ── */
.L-hero {
  position:relative;z-index:1;
  padding:2.5rem 2.5rem 2rem;
  display:flex;flex-direction:column;
  justify-content:center;gap:2rem;
}

.eyebrow {
  display:flex;align-items:center;gap:10px;
  font-family:'JetBrains Mono',monospace;
  font-size:9px;letter-spacing:0.2em;
  text-transform:uppercase;color:var(--g);
  animation:fadeIn 0.7s 0.1s both;
}

.eyebrow::before {
  content:'';display:block;
  width:18px;height:1.5px;background:var(--g);
}

/* BIG display headline — the hero */
.display {
  animation:riseIn 0.9s 0.15s cubic-bezier(0.16,1,0.3,1) both;
}

.display-top {
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:clamp(1rem,1.4vw,1.3rem);
  font-weight:300;
  color:var(--cr5);
  letter-spacing:0.02em;
  margin-bottom:0.3rem;
}

.display-main {
  font-family:'Playfair Display',serif;
  font-size:clamp(3rem,5vw,5rem);
  font-weight:400;
  line-height:0.95;
  letter-spacing:-0.03em;
  color:var(--cr);
}

.display-main em {
  font-style:italic;font-weight:400;
  color:var(--g2);
}

.display-sub {
  font-family:'Playfair Display',serif;
  font-size:clamp(3rem,5vw,5rem);
  font-weight:400;
  line-height:0.95;
  letter-spacing:-0.03em;
  color:var(--cr5);
}

.body-copy {
  font-size:13.5px;font-weight:300;
  line-height:1.85;color:var(--cr5);
  max-width:400px;
  animation:riseIn 0.9s 0.25s cubic-bezier(0.16,1,0.3,1) both;
}

/* ── Loan type list — vertical stack, not grid ── */
.type-list {
  display:flex;flex-direction:column;gap:1px;
  background:var(--line);
  border:1px solid var(--line);
  animation:riseIn 0.8s 0.35s cubic-bezier(0.16,1,0.3,1) both;
}

.trow {
  background:var(--ink);
  display:flex;align-items:center;
  padding:10px 14px;
  cursor:pointer;
  transition:background 0.12s;
  position:relative;
  gap:12px;
}

.trow:hover { background:var(--ink3); }

.trow.on { background:var(--ink3); }

/* active left bar */
.trow::before {
  content:'';
  position:absolute;left:0;top:0;bottom:0;
  width:0;background:var(--g2);
  transition:width 0.15s;
}

.trow.on::before { width:2px; }

.tr-idx {
  font-family:'JetBrains Mono',monospace;
  font-size:9px;color:var(--cr6);
  width:20px;flex-shrink:0;
  transition:color 0.12s;
}

.trow.on .tr-idx { color:var(--g); }

.tr-cat {
  font-family:'JetBrains Mono',monospace;
  font-size:8px;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--cr6);
  width:72px;flex-shrink:0;
  transition:color 0.12s;
}

.trow.on .tr-cat { color:var(--cr5); }

.tr-name {
  font-size:13px;font-weight:600;
  color:var(--cr5);flex:1;
  transition:color 0.12s;
}

.trow.on .tr-name  { color:var(--cr); }
.trow:hover .tr-name { color:var(--cr4); }

.tr-tag {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.1em;
  text-transform:uppercase;
  padding:2px 7px;
  border:1px solid var(--g-bd);
  background:var(--g-bg);
  color:var(--g2);
}

.tr-rate {
  font-family:'JetBrains Mono',monospace;
  font-size:12px;font-weight:500;
  color:rgba(200,136,26,0.4);
  text-align:right;width:52px;flex-shrink:0;
  transition:color 0.12s;
}

.trow.on .tr-rate  { color:var(--g2); }
.trow:hover .tr-rate { color:var(--g); }

/* ── Stats ── */
.L-stats {
  position:relative;z-index:1;
  border-top:1px solid var(--line);
  display:grid;grid-template-columns:repeat(4,1fr);
}

.st {
  padding:14px 20px;
  border-right:1px solid var(--line);
}
.st:last-child { border-right:none; }

.st-n {
  font-family:'Playfair Display',serif;
  font-size:1.5rem;font-weight:500;
  color:var(--cr);line-height:1;margin-bottom:3px;
}

.st-l {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--cr6);
}

/* ══════════════════════════════════
   RIGHT — form, slightly lighter bg
══════════════════════════════════ */
.R {
  background:var(--ink2);
  display:grid;
  grid-template-rows:58px 1fr 54px;
  border-left:1px solid var(--line);
  overflow:hidden;
  position:relative;
}

/* accent edge */
.R::after {
  content:'';
  position:absolute;top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,var(--g) 0%,var(--g2) 45%,transparent 100%);
  z-index:5;
}

/* ── R topbar ── */
.R-nav {
  position:relative;z-index:2;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 1.75rem;
  border-bottom:1px solid var(--line);
}

.R-nav-lbl {
  font-family:'JetBrains Mono',monospace;
  font-size:9px;letter-spacing:0.16em;
  text-transform:uppercase;color:var(--cr6);
}

/* Progress dots */
.pdots { display:flex;align-items:center;gap:4px; }

.pdot {
  width:20px;height:2px;
  background:var(--cr7);
  transition:background 0.25s, width 0.25s;
}

.pdot.on { background:var(--g2);width:28px; }

/* ── R body ── */
.R-body {
  overflow:hidden;
  padding:1.5rem 1.75rem 1.25rem;
  display:flex;flex-direction:column;
  gap:1.1rem;
}

/* Selected loan — prominent display */
.sel-display {
  display:flex;align-items:stretch;
  border:1px solid var(--line2);
  overflow:hidden;
  background:var(--ink);
}

.sd-left {
  flex:1;padding:14px 16px;
  display:flex;flex-direction:column;
  justify-content:center;gap:4px;
  border-right:1px solid var(--line);
}

.sd-cat {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.18em;
  text-transform:uppercase;color:var(--cr6);
}

.sd-name {
  font-family:'Playfair Display',serif;
  font-size:1.4rem;font-weight:400;
  color:var(--cr);line-height:1;
}

.sd-id {
  font-size:11px;font-weight:300;
  color:var(--cr5);
}

.sd-right {
  padding:14px 18px;
  display:flex;flex-direction:column;
  align-items:flex-end;justify-content:center;
  gap:2px;
  background:linear-gradient(135deg,rgba(200,136,26,0.06),transparent);
}


.sd-rate-sub {
  font-family:'JetBrains Mono',monospace;
  font-size:8px;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--cr6);
}

/* Form sections */
.form { display:flex;flex-direction:column;gap:0.85rem; }

.sec {
  display:flex;align-items:center;gap:8px;
}

.sec-lbl {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.2em;
  text-transform:uppercase;color:var(--cr6);
  white-space:nowrap;
}

.sec-rule { flex:1;height:1px;background:var(--line); }

/* Two-col row */
.row2 { display:grid;grid-template-columns:1fr 1fr;gap:10px; }

/* Field */
.f { display:flex;flex-direction:column;gap:5px; }
.f.full { grid-column:1/-1; }

.f-lbl {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.16em;
  text-transform:uppercase;color:var(--cr6);
}

.f-box {
  height:44px;
  background:var(--ink3);
  border:1px solid var(--line);
  display:flex;align-items:center;
  padding:0 12px;gap:7px;
  transition:border-color 0.15s,background 0.15s;
  position:relative;overflow:hidden;
}

/* shimmer on focus */
.f-box::before {
  content:'';
  position:absolute;top:0;bottom:0;width:50px;
  background:linear-gradient(90deg,transparent,rgba(200,136,26,0.06),transparent);
  transform:translateX(-100%);
}

.f-box:focus-within {
  border-color:rgba(200,136,26,0.4);
  background:rgba(200,136,26,0.03);
}

.f-box:focus-within::before { animation:slide 0.5s ease forwards; }

/* left accent line on focus */
.f-box::after {
  content:'';
  position:absolute;left:0;top:0;bottom:0;
  width:0;background:var(--g);
  transition:width 0.15s;
}

.f-box:focus-within::after { width:2px; }

.fpx {
  font-family:'JetBrains Mono',monospace;
  font-size:11px;color:var(--cr6);
  flex-shrink:0;user-select:none;
}

.f-box input,
.f-box select {
  flex:1;background:transparent;
  border:none;outline:none;
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:14px;font-weight:500;
  color:var(--cr);appearance:none;width:100%;
}

.f-box select { cursor:pointer; }

.f-box input::placeholder { color:var(--cr6);font-weight:300; }

.f-hint {
  font-family:'JetBrains Mono',monospace;
  font-size:8px;color:var(--g);
  min-height:10px;letter-spacing:0.04em;
  animation:tickIn 0.2s ease both;
}

/* ── CTA ── */
.cta {
  width:100%;height:52px;
  background:var(--g);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 18px;
  position:relative;overflow:hidden;
  transition:background 0.2s;
  margin-top:4px;
}

.cta::before {
  content:'';
  position:absolute;top:0;bottom:0;width:60px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);
  transform:translateX(-200%);
}

.cta:not(:disabled):hover { background:var(--g2); }
.cta:not(:disabled):hover::before { animation:slide 0.55s ease forwards; }
.cta:active { background:var(--g); }

.cta:disabled {
  background:var(--ink4);
  cursor:not-allowed;
}

.cta-l { display:flex;flex-direction:column;gap:1px; }

.cta-eye {
  font-family:'JetBrains Mono',monospace;
  font-size:7px;letter-spacing:0.22em;
  text-transform:uppercase;
  color:rgba(0,0,0,0.4);
}

.cta:disabled .cta-eye { color:var(--cr6); }

.cta-lbl {
  font-size:15px;font-weight:700;
  color:#09090a;letter-spacing:-0.01em;
}

.cta:disabled .cta-lbl { color:var(--cr5); }

.cta-arr {
  font-family:'Playfair Display',serif;
  font-size:22px;color:rgba(0,0,0,0.35);
  transition:transform 0.2s;
  line-height:1;
}

.cta:not(:disabled):hover .cta-arr { transform:translateX(6px); }
.cta:disabled .cta-arr { color:var(--cr6); }

.spin-w {
  width:16px;height:16px;
  border:2px solid rgba(0,0,0,0.12);
  border-top-color:rgba(0,0,0,0.5);
  border-radius:50%;
  animation:spin 0.75s linear infinite;
}

/* ── R footer ── */
.R-foot {
  border-top:1px solid var(--line);
  background:var(--ink);
  padding:0 1.75rem;
  display:flex;align-items:center;justify-content:space-between;
}

.R-foot-note {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.08em;
  text-transform:uppercase;color:var(--cr6);
  line-height:1.9;
}

.R-foot-r { display:flex;align-items:center;gap:7px; }

.sys-d {
  width:5px;height:5px;border-radius:50%;
  background:var(--grn);
  animation:dot 3s ease infinite;
}

.sys-t {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.1em;
  text-transform:uppercase;color:var(--cr6);
}

.err-bar {
  margin-top:8px;padding:8px 12px;
  background:rgba(212,78,53,0.06);
  border-left:2px solid rgba(212,78,53,0.4);
  font-family:'JetBrains Mono',monospace;
  font-size:10px;color:#d44e35;line-height:1.5;
}

/* ── Editable rate widget ── */
.sd-rate-label {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.18em;
  text-transform:uppercase;color:var(--cr6);
  margin-bottom:5px;
}

.sd-rate-wrap {
  display:flex;align-items:center;gap:6px;
  margin-bottom:4px;
}

.sd-rate-box {
  display:flex;align-items:baseline;
  cursor:text;
  padding:2px 4px 2px 2px;
  border:1px solid transparent;
  transition:border-color 0.15s,background 0.15s;
}

.sd-rate-box:hover { border-color:var(--g-bd); }

.sd-rate-box.editing {
  border-color:var(--g);
  background:rgba(200,136,26,0.05);
}

.sd-rate-box.custom {
  border-color:var(--g-bd);
}

.sd-rate-box input {
  font-family:'Playfair Display',serif;
  font-size:2rem;font-weight:500;
  color:var(--g2);line-height:1;
  background:transparent;border:none;outline:none;
  width:72px;
  -moz-appearance:textfield;
}

.sd-rate-box.custom input { color:var(--g3); }

.sd-rate-box input::-webkit-outer-spin-button,
.sd-rate-box input::-webkit-inner-spin-button { -webkit-appearance:none; }

.sd-rate-pct {
  font-family:'Playfair Display',serif;
  font-size:1.1rem;font-weight:400;
  color:var(--g2);line-height:1;
  margin-left:1px;
}

.sd-rate-box.custom .sd-rate-pct { color:var(--g3); }

.sd-rate-reset {
  width:22px;height:22px;
  background:rgba(200,136,26,0.1);
  border:1px solid var(--g-bd);
  color:var(--g2);
  font-size:13px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background 0.15s;
  flex-shrink:0;
}

.sd-rate-reset:hover { background:rgba(200,136,26,0.2); }

.sd-rate-custom-note {
  font-family:'JetBrains Mono',monospace;
  font-size:7.5px;letter-spacing:0.08em;
  color:var(--g);
}

`;

export default function App(): React.ReactElement {
  const [form, setForm] = useState<LoanFormData>(INITIAL_FORM);
  const [selId, setSelId] = useState("personal");
  const [modalOpen, setModalOpen] = useState(false);
  const [filled, setFilled] = useState(0);
  const [customRate, setCustomRate] = useState("13.00");
  const [rateEditing, setRateEditing] = useState(false);
  const { result, loading, error, analyze } = useAgent();

  const active = LOAN_TYPES.find((l) => l.id === selId)!;

  useEffect(() => {
    setFilled(
      [
        form.name,
        form.monthly_income,
        form.monthly_emi,
        form.requested_loan,
      ].filter(Boolean).length,
    );
  }, [form]);

  const handle =
    (k: keyof LoanFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const pick = (id: string) => {
    const lt = LOAN_TYPES.find((l) => l.id === id)!;
    setSelId(id);
    setCustomRate(lt.rate.toFixed(2));
    setRateEditing(false);
    setForm((p) => ({
      ...p,
      purpose: id,
      tenure_months: DEFAULT_TENURE[id] ?? "60",
    }));
  };

  const effectiveRate = parseFloat(customRate) || active.rate;
  const rateChanged = Math.abs(effectiveRate - active.rate) > 0.001;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalOpen(true);
    await analyze({ ...form, custom_rate: String(effectiveRate) });
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* ═══════ LEFT ═══════ */}
        <div className="L">
          <div className="L-watermark">M</div>

          {/* Nav */}
          <nav className="L-nav">
            <div className="logo">
              <div className="logo-mark">
                <div className="logo-sq" />
                <div className="logo-dm" />
              </div>
              <span className="logo-name">Meridian</span>
              <div className="logo-sep" />
              <span className="logo-tagline">Credit Intelligence</span>
            </div>
            <div className="L-nav-r">
              {["Products", "Rates", "About"].map((n) => (
                <span key={n} className="nav-a">
                  {n}
                </span>
              ))}
              <div className="live-badge">
                <div className="live-d" />
                <span className="live-t">AI Live</span>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <div className="L-hero">
            <div className="eyebrow">Credit Intelligence Platform</div>

            <div className="display">
              <div className="display-top">AI-powered loan eligibility</div>
              <div className="display-main">
                Know your
                <br />
                <em>verdict</em>
              </div>
              <div className="display-sub">in 30 seconds.</div>
            </div>

            <p className="body-copy">
              Our AI agent benchmarks your financial profile against live
              interbank rates across six loan categories — delivering an
              institutional-grade eligibility verdict, instantly.
            </p>

            {/* Vertical loan list — visually distinct from previous grid */}
            <div>
              <div className="type-list">
                {LOAN_TYPES.map((lt, i) => (
                  <div
                    key={lt.id}
                    className={`trow${selId === lt.id ? " on" : ""}`}
                    onClick={() => pick(lt.id)}
                  >
                    <span className="tr-idx">0{i + 1}</span>
                    <span className="tr-cat">{lt.cat}</span>
                    <span className="tr-name">{lt.label}</span>
                    {lt.tag && <span className="tr-tag">{lt.tag}</span>}
                    <span className="tr-rate">{lt.rate.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="L-stats">
            {[
              { n: "₹0", l: "Application fee" },
              { n: "30s", l: "Decision time" },
              { n: "6", l: "Loan categories" },
              { n: "100%", l: "Digital" },
            ].map((s) => (
              <div className="st" key={s.l}>
                <div className="st-n">{s.n}</div>
                <div className="st-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ RIGHT ═══════ */}
        <div className="R">
          {/* Topbar */}
          <div className="R-nav">
            <span className="R-nav-lbl">Eligibility Assessment</span>
            <div className="pdots">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`pdot${i < filled ? " on" : ""}`} />
              ))}
            </div>
          </div>

          {/* Form body */}
          <div className="R-body">
            {/* Selected loan display */}
            <div className="sel-display">
              <div className="sd-left">
                <div className="sd-cat">
                  {active.cat} · {active.id.toUpperCase()}
                </div>
                <div className="sd-name">{active.label}</div>
                <div className="sd-id">Select a category on the left</div>
              </div>
              <div className="sd-right">
                <div className="sd-rate-label">Interest Rate</div>
                <div className="sd-rate-wrap">
                  <div
                    className={`sd-rate-box${rateEditing ? " editing" : ""}${rateChanged ? " custom" : ""}`}
                    onClick={() => setRateEditing(true)}
                  >
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="36"
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      onFocus={() => setRateEditing(true)}
                      onBlur={() => setRateEditing(false)}
                    />
                    <span className="sd-rate-pct">%</span>
                  </div>
                  {rateChanged && (
                    <button
                      type="button"
                      className="sd-rate-reset"
                      onClick={() => {
                        setCustomRate(active.rate.toFixed(2));
                        setRateEditing(false);
                      }}
                    >
                      ↺
                    </button>
                  )}
                </div>
                <div className="sd-rate-sub">
                  {rateChanged ? (
                    <span className="sd-rate-custom-note">
                      Custom · Default {active.rate.toFixed(2)}%
                    </span>
                  ) : (
                    "p.a. indicative"
                  )}
                </div>
              </div>
            </div>

            <form className="form" onSubmit={onSubmit}>
              <div className="sec">
                <span className="sec-lbl">Applicant</span>
                <div className="sec-rule" />
              </div>

              <div className="f full">
                <div className="f-lbl">Full Legal Name</div>
                <div className="f-box">
                  <input
                    type="text"
                    placeholder="As per PAN card"
                    value={form.name}
                    onChange={handle("name")}
                    required
                  />
                </div>
              </div>

              <div className="sec">
                <span className="sec-lbl">Financial Profile</span>
                <div className="sec-rule" />
              </div>

              <div className="row2">
                <div className="f">
                  <div className="f-lbl">Monthly Income</div>
                  <div className="f-box">
                    <span className="fpx">₹</span>
                    <input
                      type="number"
                      placeholder="5,00,000"
                      value={form.monthly_income}
                      onChange={handle("monthly_income")}
                      required
                    />
                  </div>
                  <div className="f-hint">{fmt(form.monthly_income)}</div>
                </div>
                <div className="f">
                  <div className="f-lbl">EMI Capacity</div>
                  <div className="f-box">
                    <span className="fpx">₹</span>
                    <input
                      type="number"
                      placeholder="50,000"
                      value={form.monthly_emi}
                      onChange={handle("monthly_emi")}
                      required
                    />
                  </div>
                  <div className="f-hint">{fmt(form.monthly_emi)}</div>
                </div>
              </div>

              <div className="sec">
                <span className="sec-lbl">Loan Requirements</span>
                <div className="sec-rule" />
              </div>

              <div className="row2">
                <div className="f">
                  <div className="f-lbl">Principal Amount</div>
                  <div className="f-box">
                    <span className="fpx">₹</span>
                    <input
                      type="number"
                      placeholder="1,00,00,000"
                      value={form.requested_loan}
                      onChange={handle("requested_loan")}
                      required
                    />
                  </div>
                  <div className="f-hint">{fmt(form.requested_loan)}</div>
                </div>
                <div className="f">
                  <div className="f-lbl">Tenure</div>
                  <div className="f-box">
                    <select
                      value={form.tenure_months}
                      onChange={handle("tenure_months")}
                    >
                      {[
                        ["12", "1 Year"],
                        ["24", "2 Years"],
                        ["36", "3 Years"],
                        ["60", "5 Years"],
                        ["84", "7 Years"],
                        ["120", "10 Years"],
                        ["180", "15 Years"],
                        ["240", "20 Years"],
                        ["300", "25 Years"],
                        ["360", "30 Years"],
                      ].map(([v, l]) => (
                        <option
                          key={v}
                          value={v}
                          style={{ background: "#111113" }}
                        >
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button className="cta" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="cta-l">
                      <span className="cta-eye">Processing</span>
                      <span
                        className="cta-lbl"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Analysing profile…
                      </span>
                    </div>
                    <div
                      className="spin-w"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        borderTopColor: "rgba(255,255,255,0.5)",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="cta-l">
                      <span className="cta-eye">AI Credit Engine</span>
                      <span className="cta-lbl">
                        Assess {active.label} Eligibility
                      </span>
                    </div>
                    <span className="cta-arr">→</span>
                  </>
                )}
              </button>

              {error && !modalOpen && <div className="err-bar">{error}</div>}
            </form>
          </div>

          {/* Footer */}
          <div className="R-foot">
            <div className="R-foot-note">
              No credit pull · Indicative rates only
              <br />
              256-bit TLS · RBI compliant
            </div>
            <div className="R-foot-r">
              <div className="sys-d" />
              <span className="sys-t">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <AnalysisModal
          loading={loading}
          result={result}
          error={error}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
