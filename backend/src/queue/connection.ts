import amqplib, { type ChannelModel, type Channel } from "amqplib";
import { logger } from "../lib/logger";

export const QUEUE = {
  LOAN_EVALUATION:     "loan.evaluation",
  LOAN_EVALUATION_DLQ: "loan.evaluation.dlq",
} as const;

const DLX = "loan.dlx";

let connection: ChannelModel | null = null;
let channel:    Channel      | null = null;

export async function connectRabbitMQ(): Promise<void> {
  const uri = process.env.RABBITMQ_URI;
  if (!uri) throw new Error("RABBITMQ_URI not set");

  connection = await amqplib.connect(uri);
  channel    = await connection.createChannel();

  await channel.assertExchange(DLX, "direct", { durable: true });
  await channel.assertQueue(QUEUE.LOAN_EVALUATION_DLQ, { durable: true });
  await channel.bindQueue(QUEUE.LOAN_EVALUATION_DLQ, DLX, QUEUE.LOAN_EVALUATION);

  await channel.assertQueue(QUEUE.LOAN_EVALUATION, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange":    DLX,
      "x-dead-letter-routing-key": QUEUE.LOAN_EVALUATION,
    },
  });

  await channel.prefetch(1);

  logger.info("RabbitMQ connected", { queue: QUEUE.LOAN_EVALUATION });
}

export function getChannel(): Channel {
  if (!channel) throw new Error("RabbitMQ channel not initialised");
  return channel;
}

export async function closeRabbitMQ(): Promise<void> {
  await channel?.close();
  await connection?.close();
}
