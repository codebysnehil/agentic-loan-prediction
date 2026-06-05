import type { RecommendLenderInput, RecommendLenderOutput } from "../types";

export function recommendLender(args: RecommendLenderInput): RecommendLenderOutput {
  const { financial_score, loan_purpose, requested_loan: _loan } = args;

  const recommended_rate = financial_score >= 60 ? 7.5 : 8.0;

  const available_lenders =
    financial_score >= 60
      ? ["SBI Solar Loan", "HDFC Green Energy", "Tata Capital Solar"]
      : financial_score >= 40
        ? ["Muthoot Finance", "Bajaj Finserv"]
        : [];

  return {
    recommended_rate,
    available_lenders,
    market_note:
      financial_score >= 60
        ? "Strong lender appetite for solar loans in current market"
        : "Limited lender options — NBFC route recommended",
    solar_subsidy_applicable: loan_purpose.toLowerCase().includes("rooftop"),
  };
}
