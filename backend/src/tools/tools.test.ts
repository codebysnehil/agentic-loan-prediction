import { describe, it, expect } from "vitest";
import { calculateDTI } from "./calculateDTI";
import { checkEligibility } from "./checkEligibility";
import { recommendLender } from "./recommendLender";

describe("calculateDTI", () => {
  it("returns a score of 100 for a high-income, low-debt applicant", () => {
    const result = calculateDTI({
      monthly_income: 200_000,
      existing_emis: 0,
      requested_loan: 500_000,
      tenure_months: 60,
    });
    expect(result.financial_score).toBe(100);
    expect(result.dti_ratio).toBeLessThan(0.3);
  });

  it("penalises heavily when DTI exceeds 60%", () => {
    const result = calculateDTI({
      monthly_income: 30_000,
      existing_emis: 15_000,
      requested_loan: 500_000,
      tenure_months: 24,
    });
    expect(result.financial_score).toBeLessThanOrEqual(50);
    expect(result.dti_ratio).toBeGreaterThan(0.6);
  });

  it("score never goes below 0", () => {
    const result = calculateDTI({
      monthly_income: 10_000,
      existing_emis: 9_000,
      requested_loan: 2_000_000,
      tenure_months: 12,
    });
    expect(result.financial_score).toBeGreaterThanOrEqual(0);
  });

  it("new_emi_estimate includes 10% buffer", () => {
    const result = calculateDTI({
      monthly_income: 100_000,
      existing_emis: 0,
      requested_loan: 120_000,
      tenure_months: 12,
    });
    expect(result.new_emi_estimate).toBe(11_000);
  });
});

describe("checkEligibility", () => {
  it("returns APPROVED for score >= 70", () => {
    const result = checkEligibility({
      financial_score: 80,
      dti_ratio: 0.25,
      applicant_name: "Test",
      requested_loan: 300_000,
    });
    expect(result.verdict).toBe("APPROVED");
    expect(result.color).toBe("green");
  });

  it("returns BORDERLINE for score 45–69", () => {
    const result = checkEligibility({
      financial_score: 55,
      dti_ratio: 0.38,
      applicant_name: "Test",
      requested_loan: 300_000,
    });
    expect(result.verdict).toBe("BORDERLINE");
    expect(result.color).toBe("amber");
  });

  it("returns DECLINED for score below 45", () => {
    const result = checkEligibility({
      financial_score: 30,
      dti_ratio: 0.65,
      applicant_name: "Test",
      requested_loan: 300_000,
    });
    expect(result.verdict).toBe("DECLINED");
    expect(result.color).toBe("red");
  });

  it("recommends EMI reduction when DTI > 40%", () => {
    const result = checkEligibility({
      financial_score: 65,
      dti_ratio: 0.45,
      applicant_name: "Test",
      requested_loan: 300_000,
    });
    expect(result.recommendations.some((r) => r.includes("EMI"))).toBe(true);
  });

  it("recommends PM Surya Ghar subsidy for large loans", () => {
    const result = checkEligibility({
      financial_score: 75,
      dti_ratio: 0.2,
      applicant_name: "Test",
      requested_loan: 600_000,
    });
    expect(result.recommendations.some((r) => r.includes("Surya Ghar"))).toBe(true);
  });
});

describe("recommendLender", () => {
  it("returns premium lenders for score >= 60", () => {
    const result = recommendLender({
      financial_score: 75,
      loan_purpose: "rooftop solar",
      requested_loan: 500_000,
    });
    expect(result.available_lenders).toContain("SBI Solar Loan");
    expect(result.recommended_rate).toBe(7.5);
  });

  it("returns NBFC lenders for score 40–59", () => {
    const result = recommendLender({
      financial_score: 50,
      loan_purpose: "solar pump",
      requested_loan: 200_000,
    });
    expect(result.available_lenders).toContain("Muthoot Finance");
    expect(result.recommended_rate).toBe(8.0);
  });

  it("returns no lenders for score below 40", () => {
    const result = recommendLender({
      financial_score: 35,
      loan_purpose: "solar pump",
      requested_loan: 100_000,
    });
    expect(result.available_lenders).toHaveLength(0);
  });

  it("marks solar subsidy applicable for rooftop purpose", () => {
    const result = recommendLender({
      financial_score: 70,
      loan_purpose: "Rooftop Solar (Residential)",
      requested_loan: 400_000,
    });
    expect(result.solar_subsidy_applicable).toBe(true);
  });

  it("does not mark subsidy for non-rooftop purpose", () => {
    const result = recommendLender({
      financial_score: 70,
      loan_purpose: "solar pump",
      requested_loan: 400_000,
    });
    expect(result.solar_subsidy_applicable).toBe(false);
  });
});
