import { Point } from "@influxdata/influxdb-client";
import { DecodedPacket, PacketMetadata } from "../types";
import { getWriteApi } from "./client";
import { logger } from "../logger";

function getTimestamp(meta: PacketMetadata): Date {
  if (meta.rxTime > 0) {
    return new Date(meta.rxTime * 1000);
  }
  return meta.timestamp;
}

export function writePacket(packet: DecodedPacket): void {
  const api = getWriteApi();
  const ts = getTimestamp(packet.meta);

  try {
    switch (packet.type) {
      case "position": {
        const point = new Point("position")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .tag("channel", packet.meta.channel)
          .floatField("latitude", packet.latitude)
          .floatField("longitude", packet.longitude)
          .intField("altitude", packet.altitude)
          .intField("sats_in_view", packet.satsInView)
          .intField("precision_bits", packet.precisionBits)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "telemetry": {
        const point = new Point("telemetry")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .tag("channel", packet.meta.channel)
          .timestamp(ts);

        if (packet.batteryLevel !== null)
          point.intField("battery_level", packet.batteryLevel);
        if (packet.voltage !== null)
          point.floatField("voltage", packet.voltage);
        if (packet.channelUtilization !== null)
          point.floatField("channel_utilization", packet.channelUtilization);
        if (packet.airUtilTx !== null)
          point.floatField("air_util_tx", packet.airUtilTx);
        if (packet.temperature !== null)
          point.floatField("temperature", packet.temperature);
        if (packet.relativeHumidity !== null)
          point.floatField("relative_humidity", packet.relativeHumidity);
        if (packet.barometricPressure !== null)
          point.floatField("barometric_pressure", packet.barometricPressure);
        if (packet.uptimeSeconds !== null)
          point.intField("uptime_seconds", packet.uptimeSeconds);

        api.writePoint(point);
        break;
      }

      case "text_message": {
        const point = new Point("text_message")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .tag("channel", packet.meta.channel)
          .tag("to_node", packet.meta.toNode)
          .stringField("text", packet.text)
          .uintField("reply_id", packet.replyId)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "nodeinfo": {
        const point = new Point("nodeinfo")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .stringField("long_name", packet.longName)
          .stringField("short_name", packet.shortName)
          .stringField("hw_model", packet.hwModel)
          .stringField("mac_addr", packet.macAddr)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "neighborinfo": {
        const point = new Point("neighborinfo")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .intField("neighbor_count", packet.neighborCount)
          .stringField("neighbors", JSON.stringify(packet.neighbors))
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "traceroute": {
        const point = new Point("traceroute")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .stringField("route", JSON.stringify(packet.route))
          .intField("route_length", packet.route.length)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "map_report": {
        const point = new Point("map_report")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .stringField("long_name", packet.longName)
          .stringField("short_name", packet.shortName)
          .stringField("hw_model", packet.hwModel)
          .floatField("latitude", packet.latitude)
          .floatField("longitude", packet.longitude)
          .intField("altitude", packet.altitude)
          .stringField("firmware_version", packet.firmwareVersion)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "waypoint": {
        const point = new Point("waypoint")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .stringField("name", packet.name)
          .stringField("description", packet.description)
          .floatField("latitude", packet.latitude)
          .floatField("longitude", packet.longitude)
          .intField("expire", packet.expire)
          .intField("icon", packet.icon)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }

      case "raw_packet": {
        const point = new Point("raw_packet")
          .tag("node_id", packet.meta.nodeId)
          .tag("gateway_id", packet.meta.gatewayId)
          .tag("channel", packet.meta.channel)
          .tag("portnum", packet.portnumName)
          .stringField("payload_hex", packet.payloadHex)
          .intField("hop_start", packet.meta.hopStart)
          .intField("hop_limit", packet.meta.hopLimit)
          .booleanField("want_ack", packet.meta.wantAck)
          .timestamp(ts);
        api.writePoint(point);
        break;
      }
    }
  } catch (err) {
    logger.error({ err, type: packet.type }, "Failed to write point to InfluxDB");
  }
}
