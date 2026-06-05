export interface LoanApplicationInput {
  name: string;
  monthly_income: number;
  existing_emis: number;
  requested_loan: number;
  tenure_months: number;
  purpose: string;
}

export interface CalculateDTIInput {
  monthly_income: number;
  existing_emis: number;
  requested_loan: number;
  tenure_months: number;
}

export interface CalculateDTIOutput {
  financial_score: number;
  dti_ratio: number;
  new_emi_estimate: number;
  total_monthly_obligations: number;
}

export interface CheckEligibilityInput {
  financial_score: number;
  dti_ratio: number;
  applicant_name: string;
  requested_loan: number;
}

export type Verdict = "APPROVED" | "BORDERLINE" | "DECLINED";

export interface CheckEligibilityOutput {
  verdict: Verdict;
  color: "green" | "amber" | "red";
  recommendations: string[];
}

export interface RecommendLenderInput {
  financial_score: number;
  loan_purpose: string;
  requested_loan: number;
}

export interface RecommendLenderOutput {
  recommended_rate: number;
  available_lenders: string[];
  market_note: string;
  solar_subsidy_applicable: boolean;
}

export interface AgentStep {
  tool: string;
  input: Record<string, unknown>;
  output: CalculateDTIOutput | CheckEligibilityOutput | RecommendLenderOutput;
}

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

export type ApplicationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ApplicationRow {
  id: string;
  name: string;
  monthly_income: number;
  existing_emis: number;
  requested_loan: number;
  tenure_months: number;
  purpose: string;
  status: ApplicationStatus;
  result: AgentResult | null;
  created_at: string;
  updated_at: string;
}
