import { getChannel, QUEUE } from "./connection";
import { runLoanAgent } from "../services/agent.service";
import { setStatus, setResult, setFailed } from "../services/loan.service";
import { AgentTrace } from "../models/AgentTrace";
import { logger } from "../lib/logger";
import type { LoanEvaluationJob } from "./publisher";

export function startWorker(): void {
  const channel = getChannel();

  channel.consume(QUEUE.LOAN_EVALUATION, async (msg) => {
    if (!msg) return;

    let job: LoanEvaluationJob;

    try {
      job = JSON.parse(msg.content.toString()) as LoanEvaluationJob;
    } catch {
      logger.error("Malformed job message, discarding");
      channel.nack(msg, false, false);
      return;
    }

    const { applicationId, input } = job;
    logger.info("Worker picked up job", { applicationId, applicant: input.name });

    try {
      await setStatus(applicationId, "PROCESSING");

      const { result, iterations, duration_ms, model } = await runLoanAgent(input);

      await setResult(applicationId, result);

      AgentTrace.create({
        applicationId,
        applicant_name:  input.name,
        requested_loan:  input.requested_loan,
        purpose:         input.purpose,
        verdict:         result.verdict,
        financial_score: result.financial_score,
        dti_ratio:       result.dti_ratio,
        iterations,
        duration_ms,
        steps:           result.steps,
        summary:         result.summary,
        llm_model:       model,
      }).catch((err) =>
        logger.error("Failed to save agent trace", { error: err.message }),
      );

      channel.ack(msg);

      logger.info("Job completed", { applicationId, verdict: result.verdict, duration_ms });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error("Job failed", { applicationId, error });

      await setFailed(applicationId, error).catch(() => {});
      channel.nack(msg, false, false);
    }
  });

  logger.info("Worker listening", { queue: QUEUE.LOAN_EVALUATION });
}
