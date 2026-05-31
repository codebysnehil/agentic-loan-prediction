export interface LoanApplicationInput {
  name: string;
  monthly_income: number;
  existing_emis: number;
  requested_loan: number;
  tenure_months: number;
  purpose: string;
}

export interface FinancialScoreInput {
  monthly_income: number;
  existing_emis: number;
  requested_loan: number;
  loan_tenure_months: number;
}

export interface FinancialScoreOutput {
  score: number;
  debt_to_income: number;
  new_emi_estimate: number;
  total_monthly_obligations: number;
}

export interface MarketRatesInput {
  financial_score: number;
  loan_purpose: string;
}

export interface MarketRatesOutput {
  recommended_rate: number;
  available_lenders: string[];
  market_note: string;
  solar_subsidy_applicable: boolean;
}

export interface DecisionInput {
  financial_score: number;
  debt_to_income: number;
  recommended_rate: number;
  monthly_emi_estimate: number;
  applicant_name: string;
  requested_loan: number;
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
  output: FinancialScoreOutput | MarketRatesOutput | DecisionOutput;
}

export interface AgentResponse {
  steps: AgentStep[];
  summary: string;
  decision: DecisionOutput | null;
}
