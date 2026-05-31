import React, { useState } from "react";
import type { AgentStep } from "../types";
import { TOOL_LABELS } from "../types";

interface AgentStepsProps {
  steps: AgentStep[];
}

export const AgentSteps: React.FC<AgentStepsProps> = ({ steps }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={card}>
      <h2 style={sectionTitle}>🔧 Agent Tool Calls</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
        Click any step to inspect input / output
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => {
          const cfg = TOOL_LABELS[step.tool] ?? { label: step.tool, icon: "⚙️" };
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}
            >
              <div
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer",
                  background: isOpen ? "#f9f9f9" : "#fff",
                }}
              >
                <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>
                  Step {i + 1}: {cfg.label}
                </span>
                <span style={{ fontSize: 12, color: "#43a047", fontWeight: 500 }}>✓ Done</span>
                <span style={{ color: "#aaa", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div style={{ padding: "12px 14px", borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
                  <p style={codeLabel}>INPUT</p>
                  <pre style={codeBlock}>{JSON.stringify(step.input, null, 2)}</pre>
                  <p style={{ ...codeLabel, marginTop: 10 }}>OUTPUT</p>
                  <pre style={codeBlock}>{JSON.stringify(step.output, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const card:        React.CSSProperties = { background: "#fff", borderRadius: 12, border: "1px solid #e8e8e8", padding: "1.25rem", marginBottom: "1rem" };
const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 600, marginBottom: 14 };
const codeLabel:   React.CSSProperties = { fontSize: 12, color: "#888", marginBottom: 4 };
const codeBlock:   React.CSSProperties = { background: "#f0f0f0", borderRadius: 6, padding: "8px 10px", fontSize: 12, overflowX: "auto", fontFamily: "monospace", lineHeight: 1.5 };
