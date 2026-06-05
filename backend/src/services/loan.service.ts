import { pool } from "../db/client";
import type { ApplicationRow, AgentResult, ApplicationStatus, LoanApplicationInput } from "../types";

export async function createApplication(input: LoanApplicationInput): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO applications
       (name, monthly_income, existing_emis, requested_loan, tenure_months, purpose)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [input.name, input.monthly_income, input.existing_emis, input.requested_loan, input.tenure_months, input.purpose],
  );
  return rows[0].id;
}

export async function setStatus(id: string, status: ApplicationStatus): Promise<void> {
  await pool.query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, id],
  );
}

export async function setResult(id: string, result: AgentResult): Promise<void> {
  await pool.query(
    `UPDATE applications SET status = 'COMPLETED', result = $1, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(result), id],
  );
}

export async function setFailed(id: string, error: string): Promise<void> {
  await pool.query(
    `UPDATE applications SET status = 'FAILED', result = $1, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify({ error }), id],
  );
}

export async function getApplication(id: string): Promise<ApplicationRow | null> {
  const { rows } = await pool.query<ApplicationRow>(
    `SELECT * FROM applications WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
