import Anthropic from "@anthropic-ai/sdk";
import { calculateDTI } from "./calculateDTI";
import { checkEligibility } from "./checkEligibility";
import { recommendLender } from "./recommendLender";
import type {
  CalculateDTIInput,
  CheckEligibilityInput,
  RecommendLenderInput,
  AgentStep,
} from "../types";

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "calculateDTI",
    description:
      "Calculates the debt-to-income ratio and a financial health score (0–100) from the applicant's income, obligations, and loan request. Always call this first.",
    input_schema: {
      type: "object",
      properties: {
        monthly_income: { type: "number", description: "Applicant monthly income in INR" },
        existing_emis:  { type: "number", description: "Total existing EMI obligations per month in INR" },
        requested_loan: { type: "number", description: "Loan amount requested in INR" },
        tenure_months:  { type: "number", description: "Requested loan tenure in months" },
      },
      required: ["monthly_income", "existing_emis", "requested_loan", "tenure_months"],
    },
  },
  {
    name: "checkEligibility",
    description:
      "Determines the loan eligibility verdict (APPROVED / BORDERLINE / DECLINED) and generates tailored recommendations. Call after calculateDTI.",
    input_schema: {
      type: "object",
      properties: {
        financial_score: { type: "number", description: "Score from calculateDTI" },
        dti_ratio:       { type: "number", description: "DTI ratio from calculateDTI" },
        applicant_name:  { type: "string" },
        requested_loan:  { type: "number" },
      },
      required: ["financial_score", "dti_ratio", "applicant_name", "requested_loan"],
    },
  },
  {
    name: "recommendLender",
    description:
      "Returns the best lender options and interest rates based on the applicant's financial score and loan purpose. Call after checkEligibility.",
    input_schema: {
      type: "object",
      properties: {
        financial_score: { type: "number" },
        loan_purpose:    { type: "string", description: "e.g. rooftop solar, solar pump" },
        requested_loan:  { type: "number" },
      },
      required: ["financial_score", "loan_purpose", "requested_loan"],
    },
  },
];

export function executeTool(
  name: string,
  args: Record<string, unknown>,
): AgentStep["output"] {
  switch (name) {
    case "calculateDTI":
      return calculateDTI(args as unknown as CalculateDTIInput);
    case "checkEligibility":
      return checkEligibility(args as unknown as CheckEligibilityInput);
    case "recommendLender":
      return recommendLender(args as unknown as RecommendLenderInput);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
