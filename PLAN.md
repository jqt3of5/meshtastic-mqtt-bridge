# Meshtastic MQTT Decoder → InfluxDB

## Overview
A Node.js/TypeScript service that subscribes to a Meshtastic MQTT broker, decodes all protobuf packets, and writes structured data to InfluxDB.

## Project Structure
```
meshtastic-mqtt-influx/
├── src/
│   ├── index.ts              # Entry point: wires up MQTT → decoder → InfluxDB
│   ├── config.ts             # Configuration from env vars
│   ├── mqtt/
│   │   └── client.ts         # MQTT connection, subscription, raw message handling
│   ├── decoder/
│   │   ├── envelope.ts       # ServiceEnvelope → MeshPacket extraction
│   │   ├── decrypt.ts        # AES-CTR decryption of encrypted MeshPackets
│   │   └── payload.ts        # Portnum-based payload decoding (Position, Telemetry, etc.)
│   ├── influx/
│   │   ├── client.ts         # InfluxDB write client setup
│   │   └── writer.ts         # Converts decoded packets → InfluxDB points
│   └── types.ts              # Shared TypeScript types for decoded packets
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml        # App + InfluxDB for local dev / EC2 deployment
└── .env.example
```

## Dependencies
- `mqtt` — MQTT client (mqtt.js)
- `@buf/meshtastic_protobufs.bufbuild_es` — Pre-generated Meshtastic protobuf types (preferred if available), OR `protobufjs` with `.proto` files from github.com/meshtastic/protobufs
- `@influxdata/influxdb-client` — InfluxDB v2 write client
- `dotenv` — Env var loading
- `winston` or `pino` — Structured logging
- TypeScript, ts-node, nodemon for dev

## Configuration (env vars)
```
MQTT_BROKER_URL=mqtt://broker-host:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_TOPIC=msh/+/+/+          # Meshtastic topic pattern
MESH_ENCRYPTION_KEY=AQ==       # Base64 channel encryption key (default key)

INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=meshtastic
INFLUXDB_BUCKET=meshtastic
```

## Decoding Pipeline

### Step 1: MQTT → ServiceEnvelope
- Subscribe to configured topic pattern
- Each message payload is a protobuf-encoded `ServiceEnvelope`
- Decode with: `ServiceEnvelope.fromBinary(payload)`
- Extract the `MeshPacket` and metadata (channel_id, gateway_id)

### Step 2: MeshPacket Decryption
- Check `MeshPacket.payloadVariant` — if `encrypted` (not `decoded`):
  - Derive nonce from packet: `packetId (4 bytes LE) + fromNode (4 bytes LE)` padded to 16 bytes
  - Decrypt using AES-128-CTR with the channel key
  - Parse decrypted bytes as `Data` protobuf message
- If already `decoded`, use the `Data` directly

### Step 3: Portnum-based Payload Decoding
Map `Data.portnum` to the correct protobuf decoder:

| Portnum | Proto Message | Key Fields |
|---------|--------------|------------|
| TEXT_MESSAGE_APP (1) | Raw UTF-8 string | text content |
| POSITION_APP (3) | Position | latitude, longitude, altitude, time |
| NODEINFO_APP (4) | User | longName, shortName, hwModel, macaddr |
| TELEMETRY_APP (67) | Telemetry | batteryLevel, voltage, temperature, humidity, pressure |
| NEIGHBORINFO_APP (71) | NeighborInfo | neighbors list with SNR |
| TRACEROUTE_APP (70) | RouteDiscovery | route node list |
| MAP_REPORT_APP (73) | MapReport | longName, shortName, position, hwModel |
| WAYPOINT_APP (8) | Waypoint | name, description, lat, lon |

Other portnums: log and store raw hex payload for future decoding.

## InfluxDB Schema

### Measurement: `position`
- **Tags:** `node_id`, `gateway_id`, `channel`
- **Fields:** `latitude` (float), `longitude` (float), `altitude` (int), `sats_in_view` (int), `precision_bits` (int)
- **Timestamp:** packet timestamp or receive time

### Measurement: `telemetry`
- **Tags:** `node_id`, `gateway_id`, `channel`
- **Fields:** `battery_level` (int), `voltage` (float), `channel_utilization` (float), `air_util_tx` (float), `temperature` (float), `relative_humidity` (float), `barometric_pressure` (float)
- **Timestamp:** packet timestamp or receive time

### Measurement: `text_message`
- **Tags:** `node_id`, `gateway_id`, `channel`, `to_node`
- **Fields:** `text` (string)
- **Timestamp:** packet timestamp or receive time

### Measurement: `nodeinfo`
- **Tags:** `node_id`, `gateway_id`
- **Fields:** `long_name` (string), `short_name` (string), `hw_model` (string), `mac_addr` (string)
- **Timestamp:** receive time

### Measurement: `neighborinfo`
- **Tags:** `node_id`, `gateway_id`
- **Fields:** `neighbor_count` (int), `neighbors` (string, JSON array of {node_id, snr})
- **Timestamp:** receive time

### Measurement: `raw_packet`
- **Tags:** `node_id`, `gateway_id`, `channel`, `portnum`
- **Fields:** `payload_hex` (string), `hop_start` (int), `hop_limit` (int), `want_ack` (bool)
- **Timestamp:** receive time
- Captures all packets including unknown portnums as a catch-all

## Implementation Steps

1. **Initialize project** — `npm init`, install deps, configure tsconfig
2. **Set up protobuf decoding** — Pull Meshtastic proto definitions, generate TS types (or use `@buf/meshtastic_protobufs.bufbuild_es`)
3. **Implement `config.ts`** — Load and validate env vars
4. **Implement `mqtt/client.ts`** — Connect, subscribe, emit raw buffers
5. **Implement `decoder/envelope.ts`** — ServiceEnvelope parsing
6. **Implement `decoder/decrypt.ts`** — AES-CTR decryption
7. **Implement `decoder/payload.ts`** — Portnum dispatch and payload decoding
8. **Implement `influx/client.ts`** — InfluxDB connection setup
9. **Implement `influx/writer.ts`** — Map decoded packets to InfluxDB points, batch writes
10. **Implement `index.ts`** — Wire everything together
11. **Docker setup** — Dockerfile for the app, docker-compose with InfluxDB
12. **Test end-to-end** — Connect to real MQTT broker, verify data in InfluxDB

## Verification
1. Run `docker-compose up` to start InfluxDB and the app
2. Check app logs for successful MQTT connection and incoming packets
3. Open InfluxDB UI (port 8086), query the `meshtastic` bucket
4. Verify data appears in each measurement (position, telemetry, text_message, etc.)
5. Spot-check decoded values against known packet data
