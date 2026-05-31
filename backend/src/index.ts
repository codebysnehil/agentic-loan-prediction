import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { runLoanAgent } from "./agent";
import type { LoanApplicationInput } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

app.post(
  "/api/analyze",
  async (req: Request<object, object, Partial<LoanApplicationInput>>, res: Response) => {
    const { name, monthly_income, existing_emis, requested_loan, tenure_months, purpose } = req.body;

    if (!name || !monthly_income || !requested_loan || !tenure_months || !purpose) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      console.log(`\n🚀 Starting agent for: ${name}`);
      const result = await runLoanAgent({
        name,
        monthly_income:  Number(monthly_income),
        existing_emis:   Number(existing_emis ?? 0),
        requested_loan:  Number(requested_loan),
        tenure_months:   Number(tenure_months),
        purpose,
      });
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Agent error:", message);
      res.status(500).json({ error: message });
    }
  }
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => console.log(`✅ Backend on http://localhost:${PORT}`));
