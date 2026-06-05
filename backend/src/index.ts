import "dotenv/config";
import { validateEnv } from "./lib/env";
import { logger } from "./lib/logger";

validateEnv();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { initDb, closeDb, pool } from "./db/client";
import { connectMongo, closeMongo } from "./db/mongo";
import { connectRabbitMQ, closeRabbitMQ } from "./queue/connection";
import { startWorker } from "./queue/worker";
import loanRoutes from "./routes/loan.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());
app.use(
  morgan("combined", {
    stream: { write: (msg: string) => logger.http(msg.trim()) },
  }),
);

app.use("/api", loanRoutes);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", db: "unreachable" });
  }
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error("Unhandled error", { error: err.message, stack: err.stack });
    res.status(500).json({ error: "Internal server error" });
  },
);

const PORT = Number(process.env.PORT ?? 3001);
let server: ReturnType<typeof app.listen>;

Promise.all([initDb(), connectMongo(), connectRabbitMQ()])
  .then(() => {
    startWorker();
    server = app.listen(PORT, () =>
      logger.info("Backend running", { port: PORT }),
    );
  })
  .catch((err) => {
    logger.error("Failed to initialise databases", { error: err.message });
    process.exit(1);
  });

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down`);
  server?.close(async () => {
    await Promise.all([closeDb(), closeMongo(), closeRabbitMQ()]);
    logger.info("Shutdown complete");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
