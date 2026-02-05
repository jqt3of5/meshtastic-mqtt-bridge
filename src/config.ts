import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function buildKafkaConfig() {
  const brokers = process.env.KAFKA_BROKERS;
  if (!brokers) return null;

  const mechanism = process.env.KAFKA_SASL_MECHANISM as "plain" | "scram-sha-256" | "scram-sha-512" | undefined;
  const sasl = mechanism && process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD
    ? {
        mechanism,
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
      }
    : null;

  return {
    brokers: brokers.split(",").map((b) => b.trim()),
    topic: optional("KAFKA_TOPIC", "meshtastic.packets"),
    clientId: optional("KAFKA_CLIENT_ID", "meshtastic-mqtt-bridge"),
    compression: optional("KAFKA_COMPRESSION", "gzip"),
    ssl: process.env.KAFKA_SSL === "true",
    sasl,
  };
}

export const config = {
  mqtt: {
    brokerUrl: optional("MQTT_BROKER_URL", "mqtt://mqtt.meshtastic.org:1883"),
    username: process.env.MQTT_USERNAME || "",
    password: process.env.MQTT_PASSWORD || "",
    topic: optional("MQTT_TOPIC", "msh/+/+/+"),
  },
  mesh: {
    encryptionKey: optional("MESH_ENCRYPTION_KEY", "AQ=="),
  },
  influx: {
    url: optional("INFLUXDB_URL", "http://localhost:8086"),
    token: required("INFLUXDB_TOKEN"),
    org: optional("INFLUXDB_ORG", "meshtastic"),
    bucket: optional("INFLUXDB_BUCKET", "meshtastic"),
  },
  kafka: buildKafkaConfig(),
};
