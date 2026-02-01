import protobuf from "protobufjs";

const root = protobuf.Root.fromJSON({
  nested: {
    meshtastic: {
      nested: {
        ServiceEnvelope: {
          fields: {
            packet: { type: "MeshPacket", id: 1 },
            channelId: { type: "string", id: 2 },
            gatewayId: { type: "string", id: 3 },
          },
        },
        MeshPacket: {
          oneofs: {
            payloadVariant: {
              oneof: ["decoded", "encrypted"],
            },
          },
          fields: {
            from: { type: "fixed32", id: 1 },
            to: { type: "fixed32", id: 2 },
            channel: { type: "uint32", id: 3 },
            decoded: { type: "Data", id: 4 },
            encrypted: { type: "bytes", id: 5 },
            id: { type: "fixed32", id: 6 },
            rxTime: { type: "fixed32", id: 7 },
            rxSnr: { type: "float", id: 8 },
            hopLimit: { type: "uint32", id: 9 },
            wantAck: { type: "bool", id: 10 },
            priority: { type: "uint32", id: 11 },
            rxRssi: { type: "int32", id: 12 },
            viaMqtt: { type: "bool", id: 14 },
            hopStart: { type: "uint32", id: 15 },
          },
        },
        Data: {
          fields: {
            portnum: { type: "uint32", id: 1 },
            payload: { type: "bytes", id: 2 },
            wantResponse: { type: "bool", id: 3 },
            dest: { type: "fixed32", id: 4 },
            source: { type: "fixed32", id: 5 },
            requestId: { type: "fixed32", id: 6 },
            replyId: { type: "fixed32", id: 7 },
            emoji: { type: "fixed32", id: 8 },
          },
        },
        Position: {
          fields: {
            latitudeI: { type: "sfixed32", id: 1 },
            longitudeI: { type: "sfixed32", id: 2 },
            altitude: { type: "int32", id: 3 },
            time: { type: "fixed32", id: 4 },
            locationSource: { type: "uint32", id: 5 },
            altitudeSource: { type: "uint32", id: 6 },
            timestamp: { type: "fixed32", id: 7 },
            altitudeHae: { type: "sint32", id: 9 },
            altitudeGeoidalSeparation: { type: "sint32", id: 10 },
            PDOP: { type: "uint32", id: 11 },
            HDOP: { type: "uint32", id: 12 },
            VDOP: { type: "uint32", id: 13 },
            gpsAccuracy: { type: "uint32", id: 14 },
            groundSpeed: { type: "uint32", id: 15 },
            groundTrack: { type: "uint32", id: 16 },
            fixQuality: { type: "uint32", id: 17 },
            fixType: { type: "uint32", id: 18 },
            satsInView: { type: "uint32", id: 19 },
            sensorId: { type: "uint32", id: 20 },
            nextUpdate: { type: "uint32", id: 21 },
            seqNumber: { type: "uint32", id: 22 },
            precisionBits: { type: "uint32", id: 23 },
          },
        },
        User: {
          fields: {
            id: { type: "string", id: 1 },
            longName: { type: "string", id: 2 },
            shortName: { type: "string", id: 3 },
            macaddr: { type: "bytes", id: 4 },
            hwModel: { type: "uint32", id: 5 },
            isLicensed: { type: "bool", id: 6 },
            role: { type: "uint32", id: 7 },
            publicKey: { type: "bytes", id: 8 },
          },
        },
        Telemetry: {
          oneofs: {
            variant: {
              oneof: [
                "deviceMetrics",
                "environmentMetrics",
                "airQualityMetrics",
                "powerMetrics",
                "localStats",
              ],
            },
          },
          fields: {
            time: { type: "fixed32", id: 1 },
            deviceMetrics: { type: "DeviceMetrics", id: 2 },
            environmentMetrics: { type: "EnvironmentMetrics", id: 3 },
            airQualityMetrics: { type: "AirQualityMetrics", id: 4 },
            powerMetrics: { type: "PowerMetrics", id: 5 },
            localStats: { type: "LocalStats", id: 6 },
          },
        },
        DeviceMetrics: {
          fields: {
            batteryLevel: { type: "uint32", id: 1 },
            voltage: { type: "float", id: 2 },
            channelUtilization: { type: "float", id: 3 },
            airUtilTx: { type: "float", id: 4 },
            uptimeSeconds: { type: "uint32", id: 5 },
          },
        },
        EnvironmentMetrics: {
          fields: {
            temperature: { type: "float", id: 1 },
            relativeHumidity: { type: "float", id: 2 },
            barometricPressure: { type: "float", id: 3 },
            gasResistance: { type: "float", id: 4 },
            voltage: { type: "float", id: 5 },
            current: { type: "float", id: 6 },
            iaq: { type: "uint32", id: 7 },
            distance: { type: "float", id: 8 },
            lux: { type: "float", id: 9 },
            whiteLux: { type: "float", id: 10 },
            irLux: { type: "float", id: 11 },
            uvLux: { type: "float", id: 12 },
            windDirection: { type: "uint32", id: 13 },
            windSpeed: { type: "float", id: 14 },
            weight: { type: "float", id: 15 },
            windGust: { type: "float", id: 16 },
            windLull: { type: "float", id: 17 },
          },
        },
        AirQualityMetrics: {
          fields: {
            pm10Standard: { type: "uint32", id: 1 },
            pm25Standard: { type: "uint32", id: 2 },
            pm100Standard: { type: "uint32", id: 3 },
            pm10Environmental: { type: "uint32", id: 4 },
            pm25Environmental: { type: "uint32", id: 5 },
            pm100Environmental: { type: "uint32", id: 6 },
          },
        },
        PowerMetrics: {
          fields: {
            ch1Voltage: { type: "float", id: 1 },
            ch1Current: { type: "float", id: 2 },
            ch2Voltage: { type: "float", id: 3 },
            ch2Current: { type: "float", id: 4 },
            ch3Voltage: { type: "float", id: 5 },
            ch3Current: { type: "float", id: 6 },
          },
        },
        LocalStats: {
          fields: {
            uptimeSeconds: { type: "uint32", id: 1 },
            channelUtilization: { type: "float", id: 2 },
            airUtilTx: { type: "float", id: 3 },
            numPacketsTx: { type: "uint32", id: 4 },
            numPacketsRx: { type: "uint32", id: 5 },
            numPacketsRxBad: { type: "uint32", id: 6 },
            numOnlineNodes: { type: "uint32", id: 7 },
            numTotalNodes: { type: "uint32", id: 8 },
          },
        },
        NeighborInfo: {
          fields: {
            nodeId: { type: "uint32", id: 1 },
            lastSentById: { type: "uint32", id: 2 },
            nodeBroadcastIntervalSecs: { type: "uint32", id: 3 },
            neighbors: { type: "Neighbor", id: 4, rule: "repeated" },
          },
        },
        Neighbor: {
          fields: {
            nodeId: { type: "uint32", id: 1 },
            snr: { type: "float", id: 2 },
            lastRxTime: { type: "fixed32", id: 3 },
            nodeBroadcastIntervalSecs: { type: "uint32", id: 4 },
          },
        },
        RouteDiscovery: {
          fields: {
            route: { type: "fixed32", id: 1, rule: "repeated" },
            snrTowards: { type: "int32", id: 2, rule: "repeated" },
            routeBack: { type: "fixed32", id: 3, rule: "repeated" },
            snrBack: { type: "int32", id: 4, rule: "repeated" },
          },
        },
        Waypoint: {
          fields: {
            id: { type: "uint32", id: 1 },
            latitudeI: { type: "sfixed32", id: 2 },
            longitudeI: { type: "sfixed32", id: 3 },
            expire: { type: "uint32", id: 4 },
            lockedTo: { type: "uint32", id: 5 },
            name: { type: "string", id: 6 },
            description: { type: "string", id: 7 },
            icon: { type: "fixed32", id: 8 },
          },
        },
        MapReport: {
          fields: {
            longName: { type: "string", id: 1 },
            shortName: { type: "string", id: 2 },
            role: { type: "uint32", id: 3 },
            hwModel: { type: "uint32", id: 4 },
            firmwareVersion: { type: "string", id: 5 },
            region: { type: "uint32", id: 6 },
            modemPreset: { type: "uint32", id: 7 },
            hasDefaultChannel: { type: "bool", id: 8 },
            latitudeI: { type: "sfixed32", id: 9 },
            longitudeI: { type: "sfixed32", id: 10 },
            altitude: { type: "int32", id: 11 },
            positionPrecision: { type: "uint32", id: 12 },
            numOnlineLocalNodes: { type: "uint32", id: 13 },
          },
        },
      },
    },
  },
});

export const ServiceEnvelope = root.lookupType("meshtastic.ServiceEnvelope");
export const MeshPacket = root.lookupType("meshtastic.MeshPacket");
export const Data = root.lookupType("meshtastic.Data");
export const Position = root.lookupType("meshtastic.Position");
export const User = root.lookupType("meshtastic.User");
export const Telemetry = root.lookupType("meshtastic.Telemetry");
export const NeighborInfo = root.lookupType("meshtastic.NeighborInfo");
export const RouteDiscovery = root.lookupType("meshtastic.RouteDiscovery");
export const Waypoint = root.lookupType("meshtastic.Waypoint");
export const MapReport = root.lookupType("meshtastic.MapReport");
