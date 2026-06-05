const REQUIRED = ["ANTHROPIC_API_KEY", "DATABASE_URL", "MONGO_URI", "RABBITMQ_URI"] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
