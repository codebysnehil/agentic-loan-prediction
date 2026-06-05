import { getChannel, QUEUE } from "./connection";
import type { LoanApplicationInput } from "../types";

export interface LoanEvaluationJob {
  applicationId: string;
  input: LoanApplicationInput;
}

export function publishLoanEvaluation(job: LoanEvaluationJob): void {
  const channel = getChannel();

  channel.sendToQueue(
    QUEUE.LOAN_EVALUATION,
    Buffer.from(JSON.stringify(job)),
    {
      persistent: true,       // message survives broker restart
      contentType: "application/json",
    },
  );
}
