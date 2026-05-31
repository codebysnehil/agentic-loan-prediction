export interface LoanFormData {
  name: string;
  monthly_income: string;
  existing_emis: string;
  requested_loan: string;
  tenure_months: string;
  purpose: string;
}

export type Verdict = "APPROVED" | "BORDERLINE" | "DECLINED";

export interface DecisionOutput {
  verdict: Verdict;
  color: "green" | "amber" | "red";
  financial_score: number;
  debt_to_income: number;
  recommended_rate: number;
  monthly_emi_estimate: number;
  applicant_name: string;
  requested_loan: number;
  recommendations: string[];
}

export interface AgentStep {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface AgentResponse {
  steps: AgentStep[];
  summary: string;
  decision: DecisionOutput | null;
}

export const PURPOSES = [
  "Rooftop Solar (Residential)",
  "Rooftop Solar (Commercial)",
  "Solar Water Pump",
  "Solar Street Light",
  "Other Solar",
] as const;

export const TENURE_OPTIONS = [12, 24, 36, 48, 60, 84, 360] as const;

export const VERDICT_CONFIG: Record<
  Verdict,
  { bg: string; border: string; text: string; icon: string }
> = {
  APPROVED: { bg: "#e8f5e9", border: "#43a047", text: "#1b5e20", icon: "✓" },
  BORDERLINE: { bg: "#fff8e1", border: "#ffa000", text: "#e65100", icon: "~" },
  DECLINED: { bg: "#ffebee", border: "#e53935", text: "#b71c1c", icon: "✗" },
};

export const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  calculate_financial_score: { label: "Financial Score Engine", icon: "📊" },
  get_market_rates: { label: "Market Rate Lookup", icon: "📈" },
  generate_decision: { label: "Decision Generator", icon: "🤖" },
};
