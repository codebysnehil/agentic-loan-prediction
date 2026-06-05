import type { CheckEligibilityInput, CheckEligibilityOutput } from "../types";

export function checkEligibility(args: CheckEligibilityInput): CheckEligibilityOutput {
  const { financial_score, dti_ratio, applicant_name: _name, requested_loan } = args;

  const verdict =
    financial_score >= 70 ? "APPROVED" :
    financial_score >= 45 ? "BORDERLINE" : "DECLINED";

  const color =
    verdict === "APPROVED" ? "green" :
    verdict === "BORDERLINE" ? "amber" : "red";

  const recommendations: string[] = [];
  if (dti_ratio > 0.4) recommendations.push("Reduce existing EMI obligations before applying");
  if (financial_score < 70) recommendations.push("Consider a co-applicant to strengthen the application");
  if (requested_loan > 500_000) recommendations.push("Explore PM Surya Ghar subsidy to reduce loan amount");
  if (verdict === "APPROVED") recommendations.push("Proceed with documentation — approval likely within 3–5 business days");

  return { verdict, color, recommendations };
}
