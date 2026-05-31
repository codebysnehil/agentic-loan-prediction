import React from "react";
import type { DecisionOutput } from "../types";
import { VERDICT_CONFIG } from "../types";

interface DecisionCardProps {
  decision: DecisionOutput;
  summary:  string;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, summary }) => {
  const vc = VERDICT_CONFIG[decision.verdict];

  const metrics: [string, string][] = [
    ["Financial Score",  `${decision.financial_score}/100`],
    ["Debt-to-Income",   `${(decision.debt_to_income * 100).toFixed(0)}%`],
    ["Interest Rate",    `${decision.recommended_rate}% p.a.`],
  ];

  return (
    <>
      <div style={{ background: vc.bg, border: `1.5px solid ${vc.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: vc.border, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 20, fontWeight: 700,
          }}>
            {vc.icon}
          </div>
          <div>
            <p style={{ fontSize: 12, color: vc.text, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Eligibility Decision
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: vc.text }}>{decision.verdict}</h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {metrics.map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ fontSize: 11, color: vc.text, opacity: 0.7, marginBottom: 2 }}>{k}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: vc.text }}>{v}</p>
            </div>
          ))}
        </div>

        {decision.recommendations.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: vc.text, marginBottom: 8 }}>
              Recommendations
            </p>
            {decision.recommendations.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: vc.text }}>
                <span>→</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {summary && (
        <div style={{ background: "#f8f9fa", borderRadius: 12, border: "1px solid #e8e8e8", padding: "1.25rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Agent Summary</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", whiteSpace: "pre-wrap" }}>{summary}</p>
        </div>
      )}
    </>
  );
};
