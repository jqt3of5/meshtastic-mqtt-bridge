export interface PacketMetadata {
  nodeId: string;
  gatewayId: string;
  channel: string;
  toNode: string;
  packetId: number;
  hopStart: number;
  hopLimit: number;
  wantAck: boolean;
  rxTime: number;
  rxSnr: number;
  rxRssi: number;
  timestamp: Date;
}

export interface PositionData {
  type: "position";
  meta: PacketMetadata;
  latitude: number;
  longitude: number;
  altitude: number;
  satsInView: number;
  precisionBits: number;
  time: number;
}

export interface TelemetryData {
  type: "telemetry";
  meta: PacketMetadata;
  batteryLevel: number | null;
  voltage: number | null;
  channelUtilization: number | null;
  airUtilTx: number | null;
  temperature: number | null;
  relativeHumidity: number | null;
  barometricPressure: number | null;
  uptimeSeconds: number | null;
}

export interface TextMessageData {
  type: "text_message";
  meta: PacketMetadata;
  text: string;
  replyId: number;
}

export interface NodeInfoData {
  type: "nodeinfo";
  meta: PacketMetadata;
  longName: string;
  shortName: string;
  hwModel: string;
  macAddr: string;
}

export interface NeighborInfoData {
  type: "neighborinfo";
  meta: PacketMetadata;
  neighborCount: number;
  neighbors: Array<{ nodeId: string; snr: number }>;
}

export interface TracerouteData {
  type: "traceroute";
  meta: PacketMetadata;
  route: string[];
}

export interface MapReportData {
  type: "map_report";
  meta: PacketMetadata;
  longName: string;
  shortName: string;
  hwModel: string;
  latitude: number;
  longitude: number;
  altitude: number;
  firmwareVersion: string;
}

export interface WaypointData {
  type: "waypoint";
  meta: PacketMetadata;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  expire: number;
  icon: number;
}

export interface RawPacketData {
  type: "raw_packet";
  meta: PacketMetadata;
  portnum: number;
  portnumName: string;
  payloadHex: string;
}

export type DecodedPacket =
  | PositionData
  | TelemetryData
  | TextMessageData
  | NodeInfoData
  | NeighborInfoData
  | TracerouteData
  | MapReportData
  | WaypointData
  | RawPacketData;
