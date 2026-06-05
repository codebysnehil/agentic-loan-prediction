import { z, ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const loanApplicationSchema = z.object({
  name:           z.string().min(1, "Name is required"),
  monthly_income: z.number().positive("Monthly income must be positive"),
  existing_emis:  z.number().min(0).default(0),
  requested_loan: z.number().positive("Requested loan must be positive"),
  tenure_months:  z.number().int().min(6).max(360),
  purpose:        z.string().min(1, "Purpose is required"),
});

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }
    req.body = result.data;
    next();
  };
}
