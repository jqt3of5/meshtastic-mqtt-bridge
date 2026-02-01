import mqtt, { MqttClient } from "mqtt";
import { EventEmitter } from "events";
import { config } from "../config";
import { logger } from "../logger";

export interface MqttMessage {
  topic: string;
  payload: Buffer;
}

export class MeshtasticMqttClient extends EventEmitter {
  private client: MqttClient | null = null;

  connect(): void {
    const { brokerUrl, username, password, topic } = config.mqtt;

    logger.info({ brokerUrl, topic }, "Connecting to MQTT broker");

    this.client = mqtt.connect(brokerUrl, {
      username: username || undefined,
      password: password || undefined,
      reconnectPeriod: 5000,
    });

    this.client.on("connect", () => {
      logger.info("Connected to MQTT broker");
      this.client!.subscribe(topic, (err) => {
        if (err) {
          logger.error({ err }, "Failed to subscribe to topic");
        } else {
          logger.info({ topic }, "Subscribed to topic");
        }
      });
    });

    this.client.on("message", (topic: string, payload: Buffer) => {
      this.emit("message", { topic, payload } as MqttMessage);
    });

    this.client.on("error", (err) => {
      logger.error({ err }, "MQTT connection error");
    });

    this.client.on("reconnect", () => {
      logger.info("Reconnecting to MQTT broker");
    });

    this.client.on("close", () => {
      logger.warn("MQTT connection closed");
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      logger.info("Disconnected from MQTT broker");
    }
  }
}
