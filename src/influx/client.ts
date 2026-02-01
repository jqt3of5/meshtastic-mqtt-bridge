import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import { config } from "../config";
import { logger } from "../logger";

let writeApi: WriteApi | null = null;

export function getWriteApi(): WriteApi {
  if (!writeApi) {
    const { url, token, org, bucket } = config.influx;
    logger.info({ url, org, bucket }, "Initializing InfluxDB write client");

    const influx = new InfluxDB({ url, token });
    writeApi = influx.getWriteApi(org, bucket, "s", {
      batchSize: 100,
      flushInterval: 5000,
      maxRetries: 3,
      retryJitter: 200,
    });
  }
  return writeApi;
}

export async function closeWriteApi(): Promise<void> {
  if (writeApi) {
    logger.info("Flushing and closing InfluxDB write client");
    await writeApi.close();
    writeApi = null;
  }
}
