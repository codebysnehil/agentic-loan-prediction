import mongoose from "mongoose";
import { logger } from "../lib/logger";

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set");

  await mongoose.connect(uri);
  logger.info("MongoDB connected");
}

export async function closeMongo(): Promise<void> {
  await mongoose.disconnect();
}
