import { useState } from "react";
import axios from "axios";
import type { LoanFormData, AgentResponse } from "../types";

interface UseAgentReturn {
  result:   AgentResponse | null;
  loading:  boolean;
  error:    string | null;
  analyze:  (data: LoanFormData) => Promise<void>;
  reset:    () => void;
}

export function useAgent(): UseAgentReturn {
  const [result,  setResult]  = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const analyze = async (formData: LoanFormData): Promise<void> => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post<AgentResponse>("/api/analyze", {
        ...formData,
        monthly_income: Number(formData.monthly_income),
        existing_emis:  Number(formData.existing_emis || 0),
        requested_loan: Number(formData.requested_loan),
        tenure_months:  Number(formData.tenure_months),
      });
      setResult(data);
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
