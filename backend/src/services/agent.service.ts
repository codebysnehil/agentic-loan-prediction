import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool } from "../tools";
import { logger } from "../lib/logger";
import type { LoanApplicationInput, AgentResult, AgentStep } from "../types";

const MAX_ITERATIONS = 10;
const MODEL = "claude-haiku-4-5";

export interface AgentRunMeta {
  result: AgentResult;
  iterations: number;
  duration_ms: number;
  model: string;
}

export async function runLoanAgent(input: LoanApplicationInput): Promise<AgentRunMeta> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startedAt = Date.now();

  const prompt = `You are a solar loan eligibility agent. Analyze the application step by step.
Call tools in this exact order: calculateDTI → checkEligibility → recommendLender.
Do not skip any tool. After all three tool calls, write a concise 2-sentence summary.

Applicant: ${input.name}
Monthly Income: ₹${input.monthly_income}
Existing EMIs: ₹${input.existing_emis}
Requested Loan: ₹${input.requested_loan}
Tenure: ${input.tenure_months} months
Purpose: ${input.purpose}`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  const agentSteps: AgentStep[] = [];
  let iterations = 0;
  let totalInputTokens  = 0;
  let totalOutputTokens = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools: toolDefinitions,
      messages,
    });

    totalInputTokens  += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
      const summary = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const dtiStep    = agentSteps.find((s) => s.tool === "calculateDTI")?.output as any;
      const eligStep   = agentSteps.find((s) => s.tool === "checkEligibility")?.output as any;
      const lenderStep = agentSteps.find((s) => s.tool === "recommendLender")?.output as any;

      if (!dtiStep || !eligStep || !lenderStep) {
        throw new Error(`Agent completed without all required tool calls. Steps: ${agentSteps.map(s => s.tool).join(", ")}`);
      }

      const result: AgentResult = {
        verdict:           eligStep.verdict,
        color:             eligStep.color,
        applicant_name:    input.name,
        requested_loan:    input.requested_loan,
        financial_score:   dtiStep.financial_score,
        dti_ratio:         dtiStep.dti_ratio,
        recommended_rate:  lenderStep.recommended_rate,
        new_emi_estimate:  dtiStep.new_emi_estimate,
        available_lenders: lenderStep.available_lenders,
        recommendations:   eligStep.recommendations,
        summary,
        steps: agentSteps,
      };

      const costUSD =
        (totalInputTokens  / 1_000_000) * 0.80 +
        (totalOutputTokens / 1_000_000) * 4.00;

      logger.info("Token usage", {
        input_tokens:  totalInputTokens,
        output_tokens: totalOutputTokens,
        cost_usd:      `$${costUSD.toFixed(6)}`,
        model:         MODEL,
      });

      return { result, iterations, duration_ms: Date.now() - startedAt, model: MODEL };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => {
      logger.info("Agent tool call", { tool: block.name, input: block.input });
      const output = executeTool(block.name, block.input as Record<string, unknown>);
      agentSteps.push({ tool: block.name, input: block.input as Record<string, unknown>, output });
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(output),
      };
    });

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS})`);
}
