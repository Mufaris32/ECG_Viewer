import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { Platform, PermissionsAndroid } from "react-native";

// Create BLE manager
const bleManager = new BleManager();

// Request necessary permissions (Android)
export async function requestPermissions(): Promise<void> {
  if (Platform.OS === "android" && Platform.Version >= 23) {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  }
}

// Scan for BLE devices and connect to your ECG device
export function scanAndConnect(
  deviceName: string,
  onDataReceived: (value: number) => void
) {
  bleManager.startDeviceScan(null, null, async (error, device: Device | null) => {
    if (error) {
      console.log("Scan error:", error.message);
      return;
    }

    if (device && device.name === deviceName) {
      console.log("Found device:", device.name);
      bleManager.stopDeviceScan();

      try {
        const connectedDevice = await device.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();

        const services = await connectedDevice.services();
        for (const service of services) {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            // Replace with your ECG characteristic UUID
            if (char.isNotifiable) {
              char.monitor((err, c: Characteristic | null) => {
                if (err || !c?.value) return;

                const rawData = c.value; // base64 string
                const num = parseECGData(rawData);
                onDataReceived(num);
              });
            }
          }
        }
      } catch (e) {
        console.error("Connection error:", e);
      }
    }
  });
}

// Helper: Convert base64 from BLE characteristic to numeric ECG value
function parseECGData(base64: string): number {
  const buffer = Buffer.from(base64, "base64");
  // Example: take first 2 bytes as int16
  return buffer.readInt16LE(0) / 1000; // convert to mV
}
