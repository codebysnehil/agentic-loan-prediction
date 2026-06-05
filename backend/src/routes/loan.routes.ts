import { Router } from "express";
import { applyHandler, statusHandler, traceHandler } from "../controllers/loan.controller";
import { validateBody, loanApplicationSchema } from "../middleware/validate";

const router = Router();

router.post("/apply",          validateBody(loanApplicationSchema), applyHandler);
router.get("/status/:id",      statusHandler);
router.get("/trace/:id",       traceHandler);   // MongoDB agent audit trail

export default router;
