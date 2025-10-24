# 📡 Bluetooth Service Implementation Guide

## Overview
Complete Bluetooth Low Energy (BLE) service for connecting to ESP32 ECG device using `react-native-ble-plx`.

## Features ✨
- ✅ Auto-connect to ESP32 device named "ECG"
- ✅ Android & iOS Bluetooth permission handling
- ✅ Connection status tracking
- ✅ Real-time ECG data monitoring via BLE notifications
- ✅ Fallback to polling if notifications unavailable
- ✅ Float/Int16 data parsing support
- ✅ Safe disconnection and cleanup
- ✅ TypeScript with proper types
- ✅ Comprehensive error handling

## ESP32 Configuration
```cpp
// Use these UUIDs in your ESP32 code:
SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
DEVICE_NAME = "ECG"  // or any name containing "ECG"
```

## API Reference

### `connectToECGDevice()`
Connect to ESP32 and start monitoring ECG data.

```typescript
await connectToECGDevice(
  (value: number) => {
    console.log("ECG Value:", value, "mV");
  },
  (status: ConnectionStatus) => {
    console.log("Status:", status);
  }
);
```

**Parameters:**
- `onData: (value: number) => void` - Callback for each ECG reading
- `onStatusChange?: (status: ConnectionStatus) => void` - Optional status updates

**Returns:** `Promise<boolean>` - `true` if connected successfully

---

### `monitorECGData()`
Manually start monitoring after connection (usually called internally).

```typescript
await monitorECGData((value: number) => {
  console.log("ECG:", value);
});
```

---

### `disconnectFromECGDevice()`
Safely disconnect from device and cleanup resources.

```typescript
await disconnectFromECGDevice();
```

---

### `isConnected()`
Check if currently connected to device.

```typescript
if (isConnected()) {
  console.log("Connected!");
}
```

**Returns:** `boolean`

---

### `getConnectionStatus()`
Get current connection status.

```typescript
const status = getConnectionStatus();
// DISCONNECTED | SCANNING | CONNECTING | CONNECTED | ERROR
```

**Returns:** `ConnectionStatus` enum

---

### `getConnectedDeviceInfo()`
Get connected device information.

```typescript
const info = getConnectedDeviceInfo();
// { id: "XX:XX:XX:XX:XX:XX", name: "ECG" }
```

**Returns:** `{ id: string; name: string } | null`

---

### `cleanup()`
Cleanup BLE manager on app exit.

```typescript
await cleanup();
```

---

## Usage Example

### In Dashboard Component (`app/index.tsx`)

```typescript
import * as BluetoothService from "@/services/BluetoothService";
import { ConnectionStatus } from "@/services/BluetoothService";

export default function Dashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );

  const handleStartMonitoring = async () => {
    const connected = await BluetoothService.connectToECGDevice(
      (ecgValue) => {
        // Handle real-time ECG data
        console.log("ECG:", ecgValue, "mV");
        setHeartRate(Math.floor(60 + Math.random() * 40)); // Calculate from ECG
      },
      (status) => {
        setConnectionStatus(status);
      }
    );

    if (connected) {
      setIsMonitoring(true);
      console.log("✅ Monitoring started");
    } else {
      Alert.alert("Error", "Failed to connect to ECG device");
    }
  };

  const handleStopMonitoring = async () => {
    await BluetoothService.disconnectFromECGDevice();
    setIsMonitoring(false);
    console.log("⏹️ Monitoring stopped");
  };

  return (
    <View>
      <Text>Status: {connectionStatus}</Text>
      <Button
        title={isMonitoring ? "Stop" : "Start"}
        onPress={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
      />
    </View>
  );
}
```

---

## Data Format

### ESP32 Should Send:
- **Float (4 bytes):** Little-endian float representing mV directly
- **Int16 (2 bytes):** Little-endian int16, will be divided by 1000
- **Uint8 (1 byte):** Single byte, will be divided by 10

### Example ESP32 Code:
```cpp
// Send float value
float ecgValue = 0.85; // 0.85 mV
pCharacteristic->setValue((uint8_t*)&ecgValue, sizeof(float));
pCharacteristic->notify();
```

---

## Permissions Required

### Android (`app.json`)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21
          }
        }
      ]
    ],
    "android": {
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### iOS (`app.json`)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to connect to your ECG device.",
        "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to connect to your ECG device."
      }
    }
  }
}
```

---

## Connection Flow

```
1. User taps "Start Monitoring"
   ↓
2. Request Bluetooth permissions (Android)
   ↓
3. Check Bluetooth state (PoweredOn?)
   ↓
4. Start scanning (30s timeout)
   ↓
5. Find device with name containing "ECG"
   ↓
6. Connect to device
   ↓
7. Discover services & characteristics
   ↓
8. Start monitoring notifications
   ↓
9. Receive ECG data → callback
   ↓
10. User taps "Stop" → Disconnect
```

---

## Troubleshooting

### ❌ "Device not found within timeout"
- Ensure ESP32 is powered on and advertising
- Check device name includes "ECG"
- Verify Bluetooth is enabled on phone

### ❌ "Characteristic not found"
- Verify UUIDs match ESP32 code exactly
- Check ESP32 BLE service is properly initialized

### ❌ "Bluetooth permissions not granted"
- Grant all Bluetooth permissions in Settings
- For Android 12+, enable "Nearby devices" permission

### ❌ "No data received"
- Verify ESP32 is sending notifications
- Check parseECGData() handles your data format
- Enable verbose logging in ESP32

---

## Testing Without ESP32

Replace in `app/index.tsx`:
```typescript
// Use fake data for testing
import { FakeData } from "@/services/FakeData";
const fakeInterval = setInterval(() => {
  const ecgValue = Math.random() * 2; // 0-2 mV
  console.log("Fake ECG:", ecgValue);
}, 100);
```

---

## Next Steps
1. ✅ Bluetooth service implemented
2. 🔄 Integrate into `app/index.tsx` dashboard
3. 🔄 Test with real ESP32 hardware
4. 🔄 Add connection retry logic
5. 🔄 Implement ECG waveform visualization with real data

---

## File Location
`services/BluetoothService.ts` - Main Bluetooth service implementation

## Dependencies
- `react-native-ble-plx`: BLE communication
- `buffer`: Data parsing
- `react-native`: Platform & permissions
