import { Kafka, Producer, SASLOptions, logLevel } from "kafkajs";
import { config } from "../config";
import { logger } from "../logger";

let producer: Producer | null = null;

export function isKafkaEnabled(): boolean {
  return config.kafka !== null;
}

export function getProducer(): Producer | null {
  return producer;
}

function buildSaslOptions(sasl: NonNullable<NonNullable<typeof config.kafka>["sasl"]>): SASLOptions {
  return { mechanism: sasl.mechanism, username: sasl.username, password: sasl.password } as SASLOptions;
}

export async function connectProducer(): Promise<void> {
  if (!config.kafka) return;

  const { brokers, clientId, ssl, sasl } = config.kafka;

  logger.info({ brokers, clientId }, "Initializing Kafka producer");

  const kafka = new Kafka({
    clientId,
    brokers,
    ssl,
    sasl: sasl ? buildSaslOptions(sasl) : undefined,
    logLevel: logLevel.WARN,
    retry: {
      initialRetryTime: 300,
      retries: 8,
    },
  });

  producer = kafka.producer({
    allowAutoTopicCreation: true,
  });

  await producer.connect();
  logger.info("Kafka producer connected");
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    logger.info("Disconnecting Kafka producer");
    await producer.disconnect();
    producer = null;
  }
}
