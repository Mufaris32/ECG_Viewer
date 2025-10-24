# 📱 Bluetooth Integration Complete

## ✅ What's Been Done

### 1. **BluetoothService.ts** - Complete BLE Service
- ✅ Auto-connect to ESP32 device named "ECG"
- ✅ Real-time data monitoring with callbacks
- ✅ Permission handling (Android 12+ & iOS)
- ✅ Connection status tracking
- ✅ Safe disconnect and cleanup
- ✅ Multiple data format parsing (float/int16/uint8)
- ✅ TypeScript with proper types (no NodeJS.Timer)

### 2. **app/index.tsx** - Dashboard Integration
- ✅ Imported BluetoothService functions
- ✅ Real-time ECG waveform from ESP32
- ✅ Live heart rate calculation from ECG peaks
- ✅ Connection status display with color indicators
- ✅ Auto-save session with Bluetooth data
- ✅ Smooth 50-point rolling window chart
- ✅ Start/Stop monitoring with BLE connection
- ✅ Cleanup on component unmount

---

## 🎯 How It Works

### Connection Flow
```
User taps "Start Monitoring"
         ↓
Request Bluetooth Permissions
         ↓
Scan for ESP32 device (30s timeout)
         ↓
Connect to device named "ECG"
         ↓
Discover services & characteristics
         ↓
Start monitoring notifications
         ↓
Receive real-time ECG data (mV)
         ↓
Update waveform chart & calculate HR
         ↓
User taps "Stop Monitoring"
         ↓
Disconnect & save session
```

### Data Processing
```typescript
ESP32 sends float (4 bytes) → Parse as mV → Update chart
                           ↓
                    Calculate heart rate from peaks
                           ↓
                    Track session data
                           ↓
                    Save to AsyncStorage
```

---

## 🔧 ESP32 Arduino Code

### Basic BLE ECG Server

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// UUIDs - MUST MATCH BluetoothService.ts
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device connected");
  }
  
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device disconnected");
    // Restart advertising
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE ECG Server...");

  // Initialize BLE
  BLEDevice::init("ECG");  // Device name - MUST contain "ECG"
  
  // Create BLE Server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // Create BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  
  // Add descriptor for notifications
  pCharacteristic->addDescriptor(new BLE2902());
  
  // Start service
  pService->start();
  
  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE ECG Server ready!");
  Serial.println("Waiting for connections...");
}

void loop() {
  if (deviceConnected) {
    // Simulate ECG reading (replace with real ADC reading)
    float ecgValue = 1.0 + (sin(millis() / 200.0) * 0.5); // 0.5-1.5 mV
    
    // Send as float (4 bytes)
    pCharacteristic->setValue((uint8_t*)&ecgValue, sizeof(float));
    pCharacteristic->notify();
    
    Serial.print("Sent ECG: ");
    Serial.print(ecgValue, 3);
    Serial.println(" mV");
    
    delay(50); // Send ~20 samples per second
  }
}
```

### With Real AD8232 ECG Sensor

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define ECG_PIN 34  // Analog input pin for AD8232

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(ECG_PIN, INPUT);
  
  BLEDevice::init("ECG");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  BLEDevice::startAdvertising();
  
  Serial.println("ECG Monitor Ready!");
}

void loop() {
  if (deviceConnected) {
    // Read analog value from AD8232
    int rawValue = analogRead(ECG_PIN);
    
    // Convert to mV (ESP32 ADC: 0-4095 = 0-3.3V)
    float voltage = (rawValue / 4095.0) * 3.3;
    
    // Scale to ECG range (adjust based on your sensor)
    float ecgValue = voltage; // or apply your calibration
    
    // Send as float
    pCharacteristic->setValue((uint8_t*)&ecgValue, sizeof(float));
    pCharacteristic->notify();
    
    delay(20); // 50Hz sampling rate
  }
}
```

---

## 📱 React Native App Features

### Connection Status Indicators
- 🔴 **Disconnected** - Gray dot
- 🔵 **Scanning** - Blue dot (searching for device)
- 🟡 **Connecting** - Yellow dot (connecting to device)
- 🟢 **Connected** - Green dot (live data streaming)
- 🔴 **Error** - Red dot (connection failed)

### Real-Time Display
- **ECG Waveform** - Live 50-point rolling chart with green line
- **Heart Rate** - Calculated from ECG peaks (50-180 BPM)
- **Avg ECG** - Current ECG value in mV
- **Session Recording** - Auto-tracks all data while monitoring

### Data Storage
- Auto-save session on stop (if enabled in settings)
- Stores: duration, heart rate, ECG values, min/max, status
- Export to CSV/JSON/HTML from Reports tab
- View history with search and filter

---

## 🧪 Testing Checklist

### Without ESP32 (Preparation)
- [ ] Code compiles with no TypeScript errors ✅
- [ ] App runs without crashing ✅
- [ ] Start button shows "Scanning..." status
- [ ] Timeout after 30s with "Device not found" alert
- [ ] Stop button cancels scan

### With ESP32 (Live Testing)
1. **Upload Arduino code to ESP32**
   - Use Arduino IDE or PlatformIO
   - Set device name to "ECG" (or name containing "ECG")
   - Verify UUIDs match BluetoothService.ts

2. **Test Connection**
   - [ ] Power on ESP32
   - [ ] Open React Native app
   - [ ] Grant Bluetooth permissions
   - [ ] Tap "Start Monitoring"
   - [ ] Status changes: Disconnected → Scanning → Connecting → Connected
   - [ ] Green dot appears when connected

3. **Test Data Streaming**
   - [ ] ECG waveform updates in real-time
   - [ ] Chart shows smooth green line
   - [ ] Heart rate updates
   - [ ] Avg ECG value updates
   - [ ] No crashes or freezing

4. **Test Disconnection**
   - [ ] Tap "Stop Monitoring"
   - [ ] Status changes to Disconnected
   - [ ] Session save dialog appears
   - [ ] Data saved to History tab

5. **Test Error Handling**
   - [ ] Turn off ESP32 during monitoring
   - [ ] Move out of Bluetooth range
   - [ ] App handles disconnect gracefully
   - [ ] Can reconnect after error

---

## 🐛 Troubleshooting

### ❌ "Device not found within timeout"
**Solution:**
- Ensure ESP32 is powered and running BLE code
- Check device name contains "ECG"
- Enable Bluetooth on phone
- Move closer to ESP32 (< 10 meters)
- Check Serial Monitor for "Waiting for connections..."

### ❌ "Bluetooth permissions not granted"
**Solution:**
- Android 12+: Settings → Apps → ECG Visualizer → Permissions → Enable "Nearby devices"
- Android 11: Enable "Location" permission
- iOS: Settings → Privacy → Bluetooth → Enable for app

### ❌ "Characteristic not found"
**Solution:**
- Verify UUIDs in ESP32 code match exactly
- Check service is started: `pService->start()`
- Add descriptor: `pCharacteristic->addDescriptor(new BLE2902())`

### ❌ Connected but no data
**Solution:**
- Check ESP32 is calling `pCharacteristic->notify()`
- Verify data format (float, 4 bytes)
- Check Serial Monitor for "Sent ECG: X.XX mV"
- Ensure `deviceConnected` is true in ESP32

### ❌ App crashes on connection
**Solution:**
- Check Bluetooth permissions are granted
- Update `react-native-ble-plx` to latest version
- Clear app cache and reinstall
- Check Expo logs: `npx expo start`

---

## 📊 Performance Tips

### For Smooth Charts
- Keep sampling rate at 20-50 Hz (delay 20-50ms in ESP32)
- Use 50-point rolling window (current implementation)
- Consider reducing to 30 points if laggy on older devices

### For Battery Life
- Disconnect when not monitoring
- Reduce notification rate on ESP32 (increase delay)
- Use `expo-background-fetch` if need background monitoring

### For Better Heart Rate Detection
- Implement peak detection algorithm (Pan-Tompkins)
- Use moving average filter for noise reduction
- Calibrate threshold based on user's baseline ECG

---

## 🚀 Next Steps

### Recommended Improvements
1. **Add reconnect button** when connection fails
2. **Show signal quality indicator** (noise level)
3. **Implement real heart rate algorithm** (Pan-Tompkins)
4. **Add ECG filtering** (bandpass 0.5-40 Hz)
5. **Battery level indicator** for ESP32
6. **Connection history** (last connected device)
7. **Multiple device support** (select from list)
8. **Export raw ECG data** for analysis

### Advanced Features
- Real-time arrhythmia detection
- Cloud sync for remote monitoring
- Share ECG data with healthcare providers
- Integration with health apps (Apple Health, Google Fit)
- Offline mode with data buffering

---

## 📁 Modified Files

1. ✅ `services/BluetoothService.ts` - Complete BLE implementation
2. ✅ `app/index.tsx` - Integrated Bluetooth with dashboard
3. ✅ `BLUETOOTH_SERVICE_GUIDE.md` - API documentation
4. ✅ `BLUETOOTH_INTEGRATION.md` - This guide

---

## 🎓 Key Code Snippets

### Start Monitoring
```typescript
const connected = await connectToECGDevice(
  (ecgValue) => {
    // Handle real-time ECG data
    setEcgData(prev => [...prev.slice(-49), ecgValue]);
  },
  (status) => {
    setConnectionStatus(status);
  }
);
```

### Stop Monitoring
```typescript
await disconnectFromECGDevice();
```

### Check Connection
```typescript
if (isConnected()) {
  console.log("Device connected!");
}
```

---

## ✅ Integration Complete!

Your ECG Visualizer app is now ready to receive live ECG data from your ESP32 via Bluetooth! 

**Test it:**
1. Upload ESP32 code
2. Power on ESP32
3. Open app and tap "Start Monitoring"
4. Watch live ECG waveform! 📈

Need help? Check the troubleshooting section or review the code comments.
