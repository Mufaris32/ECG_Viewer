import { Buffer } from "buffer";
import { PermissionsAndroid, Platform } from "react-native";

// Check if BLE is available (not available in Expo Go)
let BleManager: any;
let bleManagerInstance: any = null;

try {
  const BleModule = require("react-native-ble-plx");
  BleManager = BleModule.BleManager;
  bleManagerInstance = new BleManager();
} catch (error) {
  console.warn("⚠️ Bluetooth not available in Expo Go. Please use development build or test with fake data.");
}

// ESP32 BLE Service & Characteristic UUIDs
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Device name to scan for (case-insensitive partial match)
// Will match: "ECG", "ESP32_ECG", "MyECG", "ECG_Device", etc.
const TARGET_DEVICE_NAME = "ESP32";

// State management
let connectedDevice: any = null;
let subscription: any = null;
let scanTimeout: ReturnType<typeof setTimeout> | null = null;

// Connection status
export enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  SCANNING = "SCANNING",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  ERROR = "ERROR",
}

let currentStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
let statusCallback: ((status: ConnectionStatus) => void) | null = null;

// Helper: Update connection status
function updateStatus(status: ConnectionStatus) {
  currentStatus = status;
  if (statusCallback) {
    statusCallback(status);
  }
  console.log("� Bluetooth Status:", status);
}

// Helper: Request Bluetooth permissions (Android)
async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      if (Platform.Version >= 31) {
        // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        const scanGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Bluetooth Scan Permission",
            message: "This app needs Bluetooth scan permission to find ECG devices.",
            buttonPositive: "OK",
          }
        );
        const connectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Bluetooth Connect Permission",
            message: "This app needs Bluetooth connect permission to connect to ECG devices.",
            buttonPositive: "OK",
          }
        );
        return scanGranted === PermissionsAndroid.RESULTS.GRANTED && 
               connectGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth requires location permission on Android.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error("❌ Permission request error:", error);
      return false;
    }
  }
  // iOS doesn't require runtime permissions
  return true;
}

// 🟢 Connect to ECG device and start monitoring
export async function connectToECGDevice(
  onData: (value: number) => void,
  onStatusChange?: (status: ConnectionStatus) => void
): Promise<boolean> {
  try {
    // Check if BLE is available
    if (!bleManagerInstance) {
      console.error("❌ Bluetooth not available (Expo Go doesn't support native modules)");
      updateStatus(ConnectionStatus.ERROR);
      return false;
    }

    // Set status callback
    statusCallback = onStatusChange || null;

    // Check if already connected
    if (connectedDevice) {
      console.log("⚠️ Already connected to device");
      updateStatus(ConnectionStatus.CONNECTED);
      return true;
    }

    // Request permissions
    const hasPermissions = await requestBluetoothPermissions();
    if (!hasPermissions) {
      console.error("❌ Bluetooth permissions not granted");
      console.error("⚠️ Please enable Bluetooth permissions in Settings:");
      console.error("  Settings > Apps > ECGVisualizer > Permissions");
      updateStatus(ConnectionStatus.ERROR);
      return false;
    }
    console.log("✅ Bluetooth permissions granted");

    // Check Bluetooth state
    const state = await bleManagerInstance.state();
    console.log("📡 Bluetooth state:", state);
    if (state !== "PoweredOn") {
      console.error("❌ Bluetooth is not powered on:", state);
      console.error("⚠️ Please enable Bluetooth in your phone settings");
      updateStatus(ConnectionStatus.ERROR);
      return false;
    }
    console.log("✅ Bluetooth is powered on");

    updateStatus(ConnectionStatus.SCANNING);
    console.log("🔍 Scanning for ECG BLE devices...");
    console.log("📱 Looking for devices with name containing:", TARGET_DEVICE_NAME);

    let devicesFound = 0;
    const discoveredDeviceNames = new Set<string>(); // Track unique device names

    return new Promise((resolve) => {
      // Set scan timeout (30 seconds)
      scanTimeout = setTimeout(() => {
        bleManagerInstance.stopDeviceScan();
        if (!connectedDevice) {
          console.error("❌ Device not found within timeout");
          console.error(`📊 Total devices discovered: ${devicesFound}`);
          
          // Show unique device names
          if (discoveredDeviceNames.size > 0) {
            console.log("📋 Unique device names found:");
            Array.from(discoveredDeviceNames)
              .sort()
              .forEach((name, index) => {
                console.log(`  ${index + 1}. "${name}"`);
              });
            console.error(`⚠️ None matched "${TARGET_DEVICE_NAME}"`);
            console.error("💡 Tip: Check your ESP32 device name or update TARGET_DEVICE_NAME");
          } else if (devicesFound === 0) {
            console.error("⚠️ NO DEVICES FOUND - Check:");
            console.error("  1. Bluetooth permissions granted?");
            console.error("  2. Location services enabled? (Android)");
            console.error("  3. ESP32 powered on and advertising?");
          }
          updateStatus(ConnectionStatus.ERROR);
          resolve(false);
        }
      }, 30000);

      bleManagerInstance.startDeviceScan(null, null, async (error: any, device: any) => {
        if (error) {
          console.error("❌ BLE Scan error:", error);
          console.error("Error details:", JSON.stringify(error));
          bleManagerInstance.stopDeviceScan();
          if (scanTimeout) clearTimeout(scanTimeout);
          updateStatus(ConnectionStatus.ERROR);
          resolve(false);
          return;
        }

        // Log all discovered devices for debugging
        const deviceName = device?.name || device?.localName || "";
        if (deviceName) {
          devicesFound++;
          // Add to unique names set
          discoveredDeviceNames.add(deviceName);
          // Only log first 10 devices to avoid spam
          if (devicesFound <= 10) {
            console.log(`🔍 [${devicesFound}] Found BLE device: "${deviceName}"`);
          }
        } else if (device?.id) {
          // Device with no name but has ID
          devicesFound++;
        }

        // Check if device matches target name (case-insensitive)
        if (device && deviceName.toUpperCase().includes(TARGET_DEVICE_NAME.toUpperCase())) {
          console.log("✅ Target device found:", deviceName);
          bleManagerInstance.stopDeviceScan();
          if (scanTimeout) clearTimeout(scanTimeout);

          updateStatus(ConnectionStatus.CONNECTING);

          try {
            // Connect to device
            connectedDevice = await device.connect();
            console.log("🔗 Connected to device:", connectedDevice.id);

            // Discover services and characteristics
            await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("🔍 Discovered services and characteristics");

            // Start monitoring data
            await monitorECGData(onData);

            updateStatus(ConnectionStatus.CONNECTED);
            resolve(true);
          } catch (connectError) {
            console.error("❌ Connection error:", connectError);
            connectedDevice = null;
            updateStatus(ConnectionStatus.ERROR);
            resolve(false);
          }
        }
      });
    });
  } catch (error) {
    console.error("❌ connectToECGDevice error:", error);
    updateStatus(ConnectionStatus.ERROR);
    return false;
  }
}

// 🔵 Monitor ECG data from connected device
export async function monitorECGData(onData: (value: number) => void): Promise<boolean> {
  if (!connectedDevice) {
    console.error("❌ No device connected");
    return false;
  }

  try {
    // Get characteristics for the target service
    const characteristics = await connectedDevice.characteristicsForService(SERVICE_UUID);
    const char = characteristics.find(
      (c: any) =>
        c.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase() ||
        c.uuid.toLowerCase().includes(CHARACTERISTIC_UUID.toLowerCase())
    );

    if (!char) {
      console.error("❌ Characteristic not found");
      return false;
    }

    console.log("📊 Found characteristic:", char.uuid);

    // Check if characteristic supports notifications
    if (char.isNotifiable) {
      console.log("✅ Starting notification monitoring...");
      subscription = char.monitor((error: any, characteristic: any) => {
        if (error) {
          console.error("❌ Monitor error:", error);
          return;
        }

        if (characteristic?.value) {
          const value = parseECGData(characteristic.value);
          onData(value);
        }
      });
      return true;
    } else {
      // If not notifiable, try periodic reading
      console.log("⚠️ Characteristic not notifiable, trying periodic read...");
      const readInterval: ReturnType<typeof setInterval> = setInterval(async () => {
        try {
          if (!connectedDevice) {
            clearInterval(readInterval);
            return;
          }
          const readChar = await connectedDevice.readCharacteristicForService(
            SERVICE_UUID,
            char.uuid
          );
          if (readChar?.value) {
            onData(parseECGData(readChar.value));
          }
        } catch (readError) {
          console.warn("⚠️ Read error:", readError);
        }
      }, 100); // Read every 100ms

      // Store interval reference for cleanup
      subscription = {
        remove: () => clearInterval(readInterval),
      };
      return true;
    }
  } catch (error) {
    console.error("❌ monitorECGData error:", error);
    return false;
  }
}

// Parse received BLE data (base64) to float ECG value (mV)
function parseECGData(base64: string): number {
  try {
    const buf = Buffer.from(base64, "base64");
    
    // Try parsing as float (4 bytes)
    if (buf.length >= 4) {
      return buf.readFloatLE(0);
    }
    
    // Fallback: parse as int16 and convert to mV
    if (buf.length >= 2) {
      return buf.readInt16LE(0) / 1000.0;
    }
    
    // Fallback: single byte
    if (buf.length >= 1) {
      return buf.readUInt8(0) / 10.0;
    }
    
    console.warn("⚠️ Invalid data length:", buf.length);
    return 0;
  } catch (error) {
    console.error("❌ Parse error:", error);
    return 0;
  }
}

// 🔴 Disconnect from ECG device
export async function disconnectFromECGDevice(): Promise<void> {
  console.log("🔌 Disconnecting from device...");

  // Stop monitoring subscription
  if (subscription) {
    try {
      subscription.remove();
      console.log("✅ Subscription removed");
    } catch (error) {
      console.warn("⚠️ Error removing subscription:", error);
    }
    subscription = null;
  }

  // Clear scan timeout if exists
  if (scanTimeout) {
    clearTimeout(scanTimeout);
    scanTimeout = null;
  }

  // Stop any ongoing scan
  try {
    if (bleManagerInstance) {
      bleManagerInstance.stopDeviceScan();
    }
  } catch (error) {
    // Ignore if not scanning
  }

  // Disconnect device
  if (connectedDevice) {
    try {
      await connectedDevice.cancelConnection();
      console.log("✅ Device disconnected");
    } catch (error) {
      console.warn("⚠️ Error disconnecting device:", error);
    } finally {
      connectedDevice = null;
    }
  }

  updateStatus(ConnectionStatus.DISCONNECTED);
  statusCallback = null;
}

// 📊 Get current connection status
export function getConnectionStatus(): ConnectionStatus {
  return currentStatus;
}

// 🔄 Check if device is connected
export function isConnected(): boolean {
  return connectedDevice !== null && currentStatus === ConnectionStatus.CONNECTED;
}

// 📱 Get connected device info
export function getConnectedDeviceInfo(): { id: string; name: string } | null {
  if (!connectedDevice) return null;
  return {
    id: connectedDevice.id,
    name: connectedDevice.name || "Unknown ECG Device",
  };
}

// 🧹 Cleanup on app exit
export async function cleanup(): Promise<void> {
  await disconnectFromECGDevice();
  try {
    if (bleManagerInstance) {
      bleManagerInstance.destroy();
    }
  } catch (error) {
    console.warn("⚠️ Error destroying BLE manager:", error);
  }
}

     
