import { config } from "./config";
import { logger } from "./logger";
import { MeshtasticMqttClient, MqttMessage } from "./mqtt/client";
import { parseServiceEnvelope } from "./decoder/envelope";
import { decryptPayload } from "./decoder/decrypt";
import { decodePayload } from "./decoder/payload";
import { writePacket } from "./influx/writer";
import { closeWriteApi } from "./influx/client";
import { publishPacket } from "./kafka/writer";
import { connectProducer, disconnectProducer, isKafkaEnabled } from "./kafka/client";
import { PacketMetadata } from "./types";

function nodeIdToHex(id: number): string {
  return "!" + (id >>> 0).toString(16).padStart(8, "0");
}

function handleMessage(msg: MqttMessage): void {
  const envelope = parseServiceEnvelope(msg.payload);
  if (!envelope) return;

  const { packet, channelId, gatewayId } = envelope;

  let portnum: number;
  let payload: Uint8Array;

  if (packet.decoded) {
    portnum = packet.decoded.portnum;
    payload = packet.decoded.payload;
  } else if (packet.encrypted) {
    const decrypted = decryptPayload(packet.encrypted, packet.id, packet.from);
    if (!decrypted) {
      logger.debug(
        { packetId: packet.id, from: nodeIdToHex(packet.from) },
        "Could not decrypt packet"
      );
      return;
    }
    portnum = decrypted.portnum;
    payload = decrypted.payload;
  } else {
    logger.debug({ packetId: packet.id }, "Packet has no decoded or encrypted payload");
    return;
  }

  const meta: PacketMetadata = {
    nodeId: nodeIdToHex(packet.from),
    gatewayId,
    channel: channelId,
    toNode: nodeIdToHex(packet.to),
    packetId: packet.id,
    hopStart: packet.hopStart,
    hopLimit: packet.hopLimit,
    wantAck: packet.wantAck,
    rxTime: packet.rxTime,
    rxSnr: packet.rxSnr,
    rxRssi: packet.rxRssi,
    timestamp: new Date(),
  };

  const decoded = decodePayload(portnum, payload, meta);

  for (const pkt of decoded) {
    logger.debug(
      { type: pkt.type, nodeId: meta.nodeId, packetId: meta.packetId },
      "Writing decoded packet"
    );
    writePacket(pkt);
    if (isKafkaEnabled()) {
      publishPacket(pkt);
    }
  }
}

async function main(): Promise<void> {
  const outputs = ["InfluxDB"];
  if (isKafkaEnabled()) outputs.push("Kafka");
  logger.info({ outputs }, "Starting Meshtastic MQTT bridge");

  await connectProducer();

  const mqtt = new MeshtasticMqttClient();
  mqtt.on("message", (msg: MqttMessage) => {
    try {
      handleMessage(msg);
    } catch (err) {
      logger.error({ err }, "Unhandled error processing message");
    }
  });

  mqtt.connect();

  const shutdown = async () => {
    logger.info("Shutting down...");
    mqtt.disconnect();
    await closeWriteApi();
    await disconnectProducer();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal error");
  process.exit(1);
});
