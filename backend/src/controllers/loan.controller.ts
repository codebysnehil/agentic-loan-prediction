import type { Request, Response } from "express";
import { createApplication, getApplication } from "../services/loan.service";
import { publishLoanEvaluation } from "../queue/publisher";
import { AgentTrace } from "../models/AgentTrace";
import { logger } from "../lib/logger";
import type { LoanApplicationInput } from "../types";

export async function applyHandler(
  req: Request<object, object, LoanApplicationInput>,
  res: Response,
): Promise<void> {
  const input = req.body;
  const applicationId = await createApplication(input);

  publishLoanEvaluation({ applicationId, input });

  logger.info("Application queued", { applicationId, applicant: input.name });
  res.status(202).json({ applicationId, status: "PENDING" });
}

export async function statusHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const row = await getApplication(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(row);
}

export async function traceHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const trace = await AgentTrace.findOne({ applicationId: req.params.id }).lean();
  if (!trace) {
    res.status(404).json({ error: "Trace not found" });
    return;
  }
  res.json(trace);
}
