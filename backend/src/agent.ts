import Anthropic from "@anthropic-ai/sdk";
import {
  calculate_financial_score,
  get_market_rates,
  generate_decision,
} from "./tools";
import type {
  LoanApplicationInput,
  AgentStep,
  AgentResponse,
  FinancialScoreInput,
  MarketRatesInput,
  DecisionInput,
} from "./types";

// ─── Tool schema (tells Claude what tools exist) ──────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "calculate_financial_score",
    description:
      "Calculates a financial health score (0–100) and debt-to-income ratio from the applicant's income, obligations, and loan request.",
    input_schema: {
      type: "object",
      properties: {
        monthly_income: {
          type: "number",
          description: "Applicant monthly income in INR",
        },
        existing_emis: {
          type: "number",
          description: "Total existing EMI obligations per month in INR",
        },
        requested_loan: {
          type: "number",
          description: "Loan amount requested in INR",
        },
        loan_tenure_months: {
          type: "number",
          description: "Requested loan tenure in months",
        },
      },
      required: [
        "monthly_income",
        "existing_emis",
        "requested_loan",
        "loan_tenure_months",
      ],
    },
  },
  {
    name: "get_market_rates",
    description:
      "Fetches current solar loan market interest rates and lender availability based on financial score and loan purpose.",
    input_schema: {
      type: "object",
      properties: {
        financial_score: {
          type: "number",
          description: "Score from calculate_financial_score",
        },
        loan_purpose: {
          type: "string",
          description: "Purpose e.g. rooftop solar, solar pump",
        },
      },
      required: ["financial_score", "loan_purpose"],
    },
  },
  {
    name: "generate_decision",
    description:
      "Generates final loan eligibility verdict with recommendations based on all prior tool outputs.",
    input_schema: {
      type: "object",
      properties: {
        financial_score: { type: "number" },
        debt_to_income: { type: "number" },
        recommended_rate: { type: "number" },
        monthly_emi_estimate: { type: "number" },
        applicant_name: { type: "string" },
        requested_loan: { type: "number" },
      },
      required: [
        "financial_score",
        "debt_to_income",
        "recommended_rate",
        "monthly_emi_estimate",
        "applicant_name",
        "requested_loan",
      ],
    },
  },
];

// ─── Tool router ──────────────────────────────────────────────────────────────

function executeTool(
  name: string,
  args: Record<string, unknown>,
): AgentStep["output"] {
  console.log(`\n🔧 Agent calling: ${name}`, args);

  switch (name) {
    case "calculate_financial_score":
      return calculate_financial_score(args as unknown as FinancialScoreInput);
    case "get_market_rates":
      return get_market_rates(args as unknown as MarketRatesInput);
    case "generate_decision":
      return generate_decision(args as unknown as DecisionInput);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function runLoanAgent(
  input: LoanApplicationInput,
): Promise<AgentResponse> {
  const client = new Anthropic({ apiKey: process.env.API_KEY });

  const prompt = `You are a solar loan eligibility agent. Analyze the following application step by step.
Use your tools in this order: calculate the financial score → get market rates → generate the final decision.
Do not skip any tool.

Applicant: ${input.name}
Monthly Income: ₹${input.monthly_income}
Existing EMIs: ₹${input.existing_emis}
Requested Loan: ₹${input.requested_loan}
Tenure: ${input.tenure_months} months
Purpose: ${input.purpose}`;

  const agentSteps: AgentStep[] = [];
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  // The agentic loop — runs until Claude stops requesting tool calls
  while (true) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      tools,
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    // No more tool calls — agent is done
    if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
      const finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const decision = agentSteps.find((s) => s.tool === "generate_decision")
        ?.output as AgentResponse["decision"];

      return {
        steps: agentSteps,
        summary: finalText,
        decision: decision ?? null,
      };
    }

    // Execute each tool Claude called
    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(
      (block) => {
        const output = executeTool(
          block.name,
          block.input as Record<string, unknown>,
        );
        agentSteps.push({
          tool: block.name,
          input: block.input as Record<string, unknown>,
          output,
        });
        return {
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(output),
        };
      },
    );

    // Feed assistant response + tool results back into the conversation
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }
}
