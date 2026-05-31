import type {
  FinancialScoreInput,
  FinancialScoreOutput,
  MarketRatesInput,
  MarketRatesOutput,
  DecisionInput,
  DecisionOutput,
} from "./types";

export function calculate_financial_score(
  args: FinancialScoreInput,
): FinancialScoreOutput {
  const { monthly_income, existing_emis, requested_loan, loan_tenure_months } =
    args;

  const new_emi = (requested_loan / loan_tenure_months) * 1.1;
  const total_obligations = existing_emis + new_emi;
  const dti = total_obligations / monthly_income;

  let score = 100;
  if (dti > 0.6) score -= 50;
  else if (dti > 0.4) score -= 25;
  else if (dti > 0.3) score -= 10;

  if (monthly_income < 20_000) score -= 20;
  else if (monthly_income < 40_000) score -= 10;

  if (requested_loan > monthly_income * 60) score -= 15;

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    debt_to_income: Math.round(dti * 100) / 100,
    new_emi_estimate: Math.round(new_emi),
    total_monthly_obligations: Math.round(total_obligations),
  };
}

export function get_market_rates(args: MarketRatesInput): MarketRatesOutput {
  const { financial_score, loan_purpose } = args;

  // Rates capped at 7.5–8% band
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

export function generate_decision(args: DecisionInput): DecisionOutput {
  const {
    financial_score,
    debt_to_income,
    recommended_rate,
    monthly_emi_estimate,
    applicant_name,
    requested_loan,
  } = args;

  const verdict =
    financial_score >= 70
      ? "APPROVED"
      : financial_score >= 45
        ? "BORDERLINE"
        : "DECLINED";

  const color =
    verdict === "APPROVED"
      ? "green"
      : verdict === "BORDERLINE"
        ? "amber"
        : "red";

  const recommendations: string[] = [];
  if (debt_to_income > 0.4)
    recommendations.push("Reduce existing EMI obligations before applying");
  if (financial_score < 70)
    recommendations.push(
      "Consider a co-applicant to strengthen the application",
    );
  if (requested_loan > 500_000)
    recommendations.push("Explore PM Surya Ghar subsidy to reduce loan amount");
  if (verdict === "APPROVED")
    recommendations.push(
      "Proceed with documentation — approval likely within 3–5 business days",
    );

  return {
    verdict,
    color,
    financial_score,
    debt_to_income,
    recommended_rate,
    monthly_emi_estimate,
    applicant_name,
    requested_loan,
    recommendations,
  };
}
