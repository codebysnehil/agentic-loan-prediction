import React, { type ChangeEvent, type FormEvent, useState } from "react";
import type { LoanFormData } from "../types";
import { PURPOSES, TENURE_OPTIONS } from "../types";

interface LoanFormProps {
  form: LoanFormData;
  loading: boolean;
  onChange: (
    key: keyof LoanFormData,
  ) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

.lf-root {
  font-family: 'Geist', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Section label ── */
.lf-sec {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.lf-sec-text {
  font-family: 'Geist Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  white-space: nowrap;
}

.lf-sec-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
}

/* ── Field label ── */
.lf-label {
  font-family: 'Geist Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 7px;
  display: block;
}

/* ── Input box ── */
.lf-box {
  height: 46px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
  transition: border-color 0.15s, background 0.15s;
  position: relative;
}

.lf-box:focus-within {
  border-color: rgba(212,150,30,0.6);
  background: rgba(212,150,30,0.04);
}

.lf-box::after {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0;
  background: rgba(212,150,30,0.7);
  transition: width 0.15s;
}

.lf-box:focus-within::after { width: 2px; }

.lf-pre {
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  color: rgba(255,255,255,0.22);
  flex-shrink: 0;
  user-select: none;
}

.lf-box input,
.lf-box select {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Geist', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255,255,255,0.92);
  appearance: none;
  width: 100%;
}

.lf-box select { cursor: pointer; }

.lf-box input::placeholder {
  color: rgba(255,255,255,0.15);
  font-weight: 300;
}

/* Amount helper */
.lf-amt-hint {
  font-family: 'Geist Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.06em;
  color: rgba(212,150,30,0.6);
  margin-top: 5px;
  height: 12px;
}

/* Grid */
.lf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.lf-full  { grid-column: 1/-1; }

/* ── CTA ── */
.lf-cta {
  width: 100%;
  height: 54px;
  background: rgba(255,255,255,0.0);
  border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
  margin-top: 4px;
}

.lf-cta::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #d4961e;
}

.lf-cta:not(:disabled):hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.2);
}

/* Gold sweep on hover */
.lf-cta::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(212,150,30,0.07) 50%, transparent 70%);
  background-size: 200% 100%;
  background-position: -200% center;
}

.lf-cta:not(:disabled):hover::after {
  animation: lf-sweep 0.6s ease forwards;
}

@keyframes lf-sweep {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.lf-cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.lf-cta-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lf-cta-eyebrow {
  font-family: 'Geist Mono', monospace;
  font-size: 7.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(212,150,30,0.7);
}

.lf-cta-label {
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.01em;
}

.lf-cta:disabled .lf-cta-label { color: rgba(255,255,255,0.3); }
.lf-cta:disabled .lf-cta-eyebrow { color: rgba(255,255,255,0.15); }

.lf-cta-icon {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.lf-spin {
  width: 16px; height: 16px;
  border: 1.5px solid rgba(255,255,255,0.12);
  border-top-color: rgba(255,255,255,0.7);
  border-radius: 50%;
  animation: lf-spin 0.75s linear infinite;
}

@keyframes lf-spin { to { transform: rotate(360deg); } }

.lf-arr {
  font-size: 20px;
  color: rgba(255,255,255,0.3);
  transition: transform 0.2s, color 0.2s;
  line-height: 1;
}

.lf-cta:not(:disabled):hover .lf-arr {
  transform: translateX(5px);
  color: #d4aa30;
}
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCrore(val: string): string {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatIncome(val: string): string {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "";
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L / mo`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K / mo`;
  return `₹${n.toLocaleString("en-IN")} / mo`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const LoanForm: React.FC<LoanFormProps> = ({
  form,
  loading,
  onChange,
  onSubmit,
}) => {
  const [focused, setFocused] = useState<string | null>(null);

  const focus = (k: string) => () => setFocused(k);
  const unfocus = () => setFocused(null);

  return (
    <div className="lf-root">
      <style>{CSS}</style>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* ── Personal ── */}
        <div>
          <div className="lf-sec">
            <span className="lf-sec-text">Applicant</span>
            <div className="lf-sec-line" />
          </div>

          <label className="lf-label">Full Legal Name</label>
          <div className="lf-box">
            <input
              type="text"
              placeholder="As per PAN card"
              value={form.name}
              onChange={onChange("name")}
              onFocus={focus("name")}
              onBlur={unfocus}
              required
            />
          </div>
        </div>

        {/* ── Financial Profile ── */}
        <div>
          <div className="lf-sec">
            <span className="lf-sec-text">Financial Profile</span>
            <div className="lf-sec-line" />
          </div>

          <div className="lf-grid2">
            <div>
              <label className="lf-label">Monthly Income</label>
              <div className="lf-box">
                <span className="lf-pre">₹</span>
                <input
                  type="number"
                  placeholder="5,00,000"
                  value={form.monthly_income}
                  onChange={onChange("monthly_income")}
                  onFocus={focus("income")}
                  onBlur={unfocus}
                  required
                />
              </div>
              <div className="lf-amt-hint">
                {focused === "income" || form.monthly_income
                  ? formatIncome(form.monthly_income)
                  : ""}
              </div>
            </div>

            <div>
              <label className="lf-label">Existing EMIs</label>
              <div className="lf-box">
                <span className="lf-pre">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={form.existing_emis}
                  onChange={onChange("existing_emis")}
                  onFocus={focus("emi")}
                  onBlur={unfocus}
                />
              </div>
              <div className="lf-amt-hint">
                {form.existing_emis ? formatIncome(form.existing_emis) : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ── Loan Details ── */}
        <div>
          <div className="lf-sec">
            <span className="lf-sec-text">Loan Requirements</span>
            <div className="lf-sec-line" />
          </div>

          <div className="lf-grid2">
            <div className="lf-full">
              <label className="lf-label">Principal Amount</label>
              <div className="lf-box">
                <span className="lf-pre">₹</span>
                <input
                  type="number"
                  placeholder="1,00,00,000"
                  value={form.requested_loan}
                  onChange={onChange("requested_loan")}
                  onFocus={focus("loan")}
                  onBlur={unfocus}
                  required
                />
              </div>
              <div
                className="lf-amt-hint"
                style={{ fontSize: "10px", letterSpacing: "0.04em" }}
              >
                {form.requested_loan
                  ? formatCrore(form.requested_loan)
                  : "Enter amount — e.g. 10000000 for ₹1 Cr"}
              </div>
            </div>

            <div>
              <label className="lf-label">Tenure</label>
              <div className="lf-box">
                <select
                  value={form.tenure_months}
                  onChange={onChange("tenure_months")}
                >
                  {TENURE_OPTIONS.map((t) => (
                    <option key={t} value={t} style={{ background: "#111210" }}>
                      {t >= 12
                        ? `${(t / 12) % 1 === 0 ? t / 12 : (t / 12).toFixed(1)} yr`
                        : `${t} mo`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="lf-label">Purpose</label>
              <div className="lf-box">
                <select value={form.purpose} onChange={onChange("purpose")}>
                  {PURPOSES.map((p) => (
                    <option key={p} style={{ background: "#111210" }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <button className="lf-cta" type="submit" disabled={loading}>
          <div className="lf-cta-left">
            <span className="lf-cta-eyebrow">
              {loading ? "AI Agent Running" : "Credit Intelligence Engine"}
            </span>
            <span className="lf-cta-label">
              {loading
                ? "Analysing your profile…"
                : "Run Eligibility Assessment →"}
            </span>
          </div>
          <div className="lf-cta-icon">
            {loading ? (
              <div className="lf-spin" />
            ) : (
              <span className="lf-arr">→</span>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};
