import crypto from "crypto";
import { config } from "../config";
import { Data } from "./protobufs";
import { logger } from "../logger";

const channelKey = Buffer.from(config.mesh.encryptionKey, "base64");

// Expand key to 16 bytes if needed (default key "AQ==" is 1 byte)
function expandKey(key: Buffer): Buffer {
  if (key.length === 16) return key;
  if (key.length === 32) return key;
  // For short keys, pad with zeros to 16 bytes
  const expanded = Buffer.alloc(16, 0);
  key.copy(expanded);
  return expanded;
}

const aesKey = expandKey(channelKey);

export function buildNonce(packetId: number, fromNode: number): Buffer {
  const nonce = Buffer.alloc(16, 0);
  nonce.writeUInt32LE(packetId >>> 0, 0);
  nonce.writeUInt32LE(fromNode >>> 0, 8);
  return nonce;
}

export function decryptPayload(
  encrypted: Uint8Array,
  packetId: number,
  fromNode: number
): { portnum: number; payload: Uint8Array } | null {
  try {
    const nonce = buildNonce(packetId, fromNode);
    const algorithm = aesKey.length === 32 ? "aes-256-ctr" : "aes-128-ctr";
    const decipher = crypto.createDecipheriv(algorithm, aesKey, nonce);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted)),
      decipher.final(),
    ]);

    const data = Data.decode(decrypted) as any;
    return {
      portnum: data.portnum || 0,
      payload: data.payload || new Uint8Array(),
    };
  } catch (err) {
    logger.debug({ err, packetId, fromNode }, "Failed to decrypt packet");
    return null;
  }
}
