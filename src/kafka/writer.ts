import { CompressionTypes } from "kafkajs";
import { DecodedPacket } from "../types";
import { config } from "../config";
import { getProducer } from "./client";
import { logger } from "../logger";

function serializePacket(packet: DecodedPacket): string {
  return JSON.stringify(packet, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

export function publishPacket(packet: DecodedPacket): void {
  const producer = getProducer();
  if (!producer || !config.kafka) return;

  const topic = config.kafka.topic;
  const value = serializePacket(packet);

  producer
    .send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: packet.meta.nodeId,
          value,
          headers: {
            type: packet.type,
            nodeId: packet.meta.nodeId,
            gatewayId: packet.meta.gatewayId,
            channel: packet.meta.channel,
          },
        },
      ],
    })
    .catch((err) => {
      logger.error({ err, type: packet.type, nodeId: packet.meta.nodeId }, "Failed to publish packet to Kafka");
    });
}
