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
} as const;
