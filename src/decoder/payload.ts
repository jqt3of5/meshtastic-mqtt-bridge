import {
  Position,
  User,
  Telemetry,
  NeighborInfo,
  RouteDiscovery,
  Waypoint,
  MapReport,
} from "./protobufs";
import { PacketMetadata, DecodedPacket } from "../types";
import { logger } from "../logger";

// Portnum constants
const PORTNUM = {
  TEXT_MESSAGE_APP: 1,
  POSITION_APP: 3,
  NODEINFO_APP: 4,
  WAYPOINT_APP: 8,
  TELEMETRY_APP: 67,
  TRACEROUTE_APP: 70,
  NEIGHBORINFO_APP: 71,
  MAP_REPORT_APP: 73,
} as const;

const PORTNUM_NAMES: Record<number, string> = {
  0: "UNKNOWN_APP",
  1: "TEXT_MESSAGE_APP",
  2: "REMOTE_HARDWARE_APP",
  3: "POSITION_APP",
  4: "NODEINFO_APP",
  5: "ROUTING_APP",
  6: "ADMIN_APP",
  7: "TEXT_MESSAGE_COMPRESSED_APP",
  8: "WAYPOINT_APP",
  9: "AUDIO_APP",
  10: "DETECTION_SENSOR_APP",
  32: "REPLY_APP",
  33: "IP_TUNNEL_APP",
  34: "PAXCOUNTER_APP",
  64: "SERIAL_APP",
  65: "STORE_FORWARD_APP",
  66: "RANGE_TEST_APP",
  67: "TELEMETRY_APP",
  68: "ZPS_APP",
  69: "SIMULATOR_APP",
  70: "TRACEROUTE_APP",
  71: "NEIGHBORINFO_APP",
  72: "ATAK_PLUGIN",
  73: "MAP_REPORT_APP",
  256: "PRIVATE_APP",
  257: "ATAK_FORWARDER",
};

function nodeIdToHex(id: number): string {
  return "!" + (id >>> 0).toString(16).padStart(8, "0");
}

export function decodePayload(
  portnum: number,
  payload: Uint8Array,
  meta: PacketMetadata,
  replyId?: number
): DecodedPacket[] {
  const results: DecodedPacket[] = [];

  try {
    switch (portnum) {
      case PORTNUM.TEXT_MESSAGE_APP: {
        const text = Buffer.from(payload).toString("utf-8");
        results.push({
          type: "text_message",
          meta,
          text,
          replyId: replyId || 0,
        });
        break;
      }

      case PORTNUM.POSITION_APP: {
        const pos = Position.decode(payload) as any;
        results.push({
          type: "position",
          meta,
          latitude: (pos.latitudeI || 0) * 1e-7,
          longitude: (pos.longitudeI || 0) * 1e-7,
          altitude: pos.altitude || 0,
          satsInView: pos.satsInView || 0,
          precisionBits: pos.precisionBits || 0,
          time: pos.time || 0,
        });
        break;
      }

      case PORTNUM.NODEINFO_APP: {
        const user = User.decode(payload) as any;
        let macAddr = "";
        if (user.macaddr && user.macaddr.length > 0) {
          macAddr = Buffer.from(user.macaddr)
            .toString("hex")
            .match(/.{2}/g)
            ?.join(":") || "";
        }
        results.push({
          type: "nodeinfo",
          meta,
          longName: user.longName || "",
          shortName: user.shortName || "",
          hwModel: String(user.hwModel || 0),
          macAddr,
        });
        break;
      }

      case PORTNUM.TELEMETRY_APP: {
        const telemetry = Telemetry.decode(payload) as any;
        const dm = telemetry.deviceMetrics;
        const em = telemetry.environmentMetrics;

        results.push({
          type: "telemetry",
          meta,
          batteryLevel: dm?.batteryLevel ?? null,
          voltage: dm?.voltage ?? null,
          channelUtilization: dm?.channelUtilization ?? null,
          airUtilTx: dm?.airUtilTx ?? null,
          temperature: em?.temperature ?? null,
          relativeHumidity: em?.relativeHumidity ?? null,
          barometricPressure: em?.barometricPressure ?? null,
          uptimeSeconds: dm?.uptimeSeconds ?? null,
        });
        break;
      }

      case PORTNUM.NEIGHBORINFO_APP: {
        const info = NeighborInfo.decode(payload) as any;
        const neighbors = (info.neighbors || []).map((n: any) => ({
          nodeId: nodeIdToHex(n.nodeId || 0),
          snr: n.snr || 0,
        }));
        results.push({
          type: "neighborinfo",
          meta,
          neighborCount: neighbors.length,
          neighbors,
        });
        break;
      }

      case PORTNUM.TRACEROUTE_APP: {
        const route = RouteDiscovery.decode(payload) as any;
        results.push({
          type: "traceroute",
          meta,
          route: (route.route || []).map((id: number) => nodeIdToHex(id)),
        });
        break;
      }

      case PORTNUM.MAP_REPORT_APP: {
        const report = MapReport.decode(payload) as any;
        results.push({
          type: "map_report",
          meta,
          longName: report.longName || "",
          shortName: report.shortName || "",
          hwModel: String(report.hwModel || 0),
          latitude: (report.latitudeI || 0) * 1e-7,
          longitude: (report.longitudeI || 0) * 1e-7,
          altitude: report.altitude || 0,
          firmwareVersion: report.firmwareVersion || "",
        });
        break;
      }

      case PORTNUM.WAYPOINT_APP: {
        const wp = Waypoint.decode(payload) as any;
        results.push({
          type: "waypoint",
          meta,
          name: wp.name || "",
          description: wp.description || "",
          latitude: (wp.latitudeI || 0) * 1e-7,
          longitude: (wp.longitudeI || 0) * 1e-7,
          expire: wp.expire || 0,
          icon: wp.icon || 0,
        });
        break;
      }

      default: {
        logger.debug(
          { portnum, name: PORTNUM_NAMES[portnum] || "UNKNOWN" },
          "Unknown portnum, storing raw"
        );
      }
    }
  } catch (err) {
    logger.warn(
      { err, portnum, name: PORTNUM_NAMES[portnum] || "UNKNOWN" },
      "Failed to decode payload"
    );
  }

  // Always emit a raw_packet for every portnum
  results.push({
    type: "raw_packet",
    meta,
    portnum,
    portnumName: PORTNUM_NAMES[portnum] || `UNKNOWN(${portnum})`,
    payloadHex: Buffer.from(payload).toString("hex"),
  });

  return results;
}
