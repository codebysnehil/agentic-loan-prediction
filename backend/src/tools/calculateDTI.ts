import type { CalculateDTIInput, CalculateDTIOutput } from "../types";

export function calculateDTI(args: CalculateDTIInput): CalculateDTIOutput {
  const { monthly_income, existing_emis, requested_loan, tenure_months } = args;

  const new_emi = (requested_loan / tenure_months) * 1.1;
  const total_monthly_obligations = existing_emis + new_emi;
  const dti_ratio = total_monthly_obligations / monthly_income;

  let score = 100;
  if (dti_ratio > 0.6) score -= 50;
  else if (dti_ratio > 0.4) score -= 25;
  else if (dti_ratio > 0.3) score -= 10;

  if (monthly_income < 20_000) score -= 20;
  else if (monthly_income < 40_000) score -= 10;

  if (requested_loan > monthly_income * 60) score -= 15;

  return {
    financial_score: Math.round(Math.max(0, Math.min(100, score))),
    dti_ratio: Math.round(dti_ratio * 100) / 100,
    new_emi_estimate: Math.round(new_emi),
    total_monthly_obligations: Math.round(total_monthly_obligations),
  };
}
