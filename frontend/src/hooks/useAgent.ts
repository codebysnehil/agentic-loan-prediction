import { useState } from "react";
import axios from "axios";
import type { LoanFormData, AgentResult, ApplicationRow } from "../types";

interface UseAgentReturn {
  result:   AgentResult | null;
  loading:  boolean;
  error:    string | null;
  analyze:  (data: LoanFormData) => Promise<void>;
  reset:    () => void;
}

const POLL_INITIAL_MS = 1_500;
const POLL_MAX_MS     = 8_000;
const POLL_TIMEOUT_MS = 120_000;

export function useAgent(): UseAgentReturn {
  const [result,  setResult]  = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const analyze = async (formData: LoanFormData): Promise<void> => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post<{ applicationId: string }>("/api/apply", {
        ...formData,
        monthly_income: Number(formData.monthly_income),
        existing_emis:  Number(formData.existing_emis || 0),
        requested_loan: Number(formData.requested_loan),
        tenure_months:  Number(formData.tenure_months),
      });

      const { applicationId } = data;
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      let delay = POLL_INITIAL_MS;

      while (Date.now() < deadline) {
        await sleep(delay);
        // Exponential backoff — caps at POLL_MAX_MS
        delay = Math.min(delay * 1.5, POLL_MAX_MS);

        const { data: row } = await axios.get<ApplicationRow>(
          `/api/status/${applicationId}`,
        );

        if (row.status === "COMPLETED" && row.result) {
          setResult(row.result);
          return;
        }

        if (row.status === "FAILED") {
          setError((row.result as any)?.error ?? "Evaluation failed");
          return;
        }
      }

      setError("Evaluation timed out — please try again");
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? (err.response?.data as { error?: string })?.error ?? err.message
          : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = (): void => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, analyze, reset };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
