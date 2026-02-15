import { ServiceEnvelope } from "./protobufs";
import { logger } from "../logger";

export interface ParsedEnvelope {
  packet: {
    from: number;
    to: number;
    channel: number;
    id: number;
    rxTime: number;
    rxSnr: number;
    rxRssi: number;
    hopLimit: number;
    hopStart: number;
    wantAck: boolean;
    decoded?: {
      portnum: number;
      payload: Uint8Array;
      wantResponse: boolean;
      dest: number;
      source: number;
      requestId: number;
      replyId: number;
    };
    encrypted?: Uint8Array;
  };
  channelId: string;
  gatewayId: string;
}

export function parseServiceEnvelope(
  payload: Buffer
): ParsedEnvelope | null {
  try {
    const envelope = ServiceEnvelope.decode(payload) as any;

    if (!envelope.packet) {
      logger.debug("ServiceEnvelope has no packet");
      return null;
    }

    const packet = envelope.packet;

    return {
      packet: {
        from: packet.from >>> 0,
        to: packet.to >>> 0,
        channel: packet.channel || 0,
        id: packet.id >>> 0,
        rxTime: packet.rxTime >>> 0,
        rxSnr: packet.rxSnr || 0,
        rxRssi: packet.rxRssi || 0,
        hopLimit: packet.hopLimit || 0,
        hopStart: packet.hopStart || 0,
        wantAck: packet.wantAck || false,
        decoded: packet.decoded
          ? {
              portnum: packet.decoded.portnum || 0,
              payload: packet.decoded.payload || new Uint8Array(),
              wantResponse: packet.decoded.wantResponse || false,
              dest: packet.decoded.dest >>> 0,
              source: packet.decoded.source >>> 0,
              requestId: packet.decoded.requestId >>> 0,
              replyId: packet.decoded.replyId >>> 0,
            }
          : undefined,
        encrypted: packet.encrypted || undefined,
      },
      channelId: envelope.channelId || "",
      gatewayId: envelope.gatewayId || "",
    };
  } catch (err) {
    logger.error({ err }, "Failed to parse ServiceEnvelope");
    return null;
  }
}
