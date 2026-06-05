export interface LoanFormData {
  name: string;
  monthly_income: string;
  existing_emis: string;
  requested_loan: string;
  tenure_months: string;
  purpose: string;
}

export type Verdict = "APPROVED" | "BORDERLINE" | "DECLINED";
export type ApplicationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AgentStep {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

/** Flat result stored in DB and returned by /api/status/:id */
export interface AgentResult {
  verdict: Verdict;
  color: "green" | "amber" | "red";
  applicant_name: string;
  requested_loan: number;
  financial_score: number;
  dti_ratio: number;
  recommended_rate: number;
  new_emi_estimate: number;
  available_lenders: string[];
  recommendations: string[];
  summary: string;
  steps: AgentStep[];
}

export interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  result: AgentResult | null;
  created_at: string;
  updated_at: string;
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
  APPROVED:   { bg: "#e8f5e9", border: "#43a047", text: "#1b5e20", icon: "✓" },
  BORDERLINE: { bg: "#fff8e1", border: "#ffa000", text: "#e65100", icon: "~" },
  DECLINED:   { bg: "#ffebee", border: "#e53935", text: "#b71c1c", icon: "✗" },
};

export const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  calculateDTI:      { label: "DTI & Financial Score", icon: "📊" },
  checkEligibility:  { label: "Eligibility Check",     icon: "✅" },
  recommendLender:   { label: "Lender Recommendation", icon: "🏦" },
};
