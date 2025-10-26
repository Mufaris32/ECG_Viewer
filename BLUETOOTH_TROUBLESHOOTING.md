# 🔧 Bluetooth Connection Troubleshooting Guide

## ⚡ Quick Test - Web Bluetooth (Recommended)

Since `eas build` failed, **test with Web Bluetooth first** - it works in Chrome/Edge without any build!

### Steps:
1. **Upload ESP32 Code** (see below)
2. **Run Expo:**
   ```powershell
   npx expo start
   ```
3. **Open in Chrome/Edge** (press `w` when Expo starts)
4. **Enable Bluetooth on your PC/phone**
5. **Click "Connect Device"** in the app

---

## 🔍 Why Can't You Connect? - Common Issues

### Issue #1: Running in Wrong Environment
- ❌ **Expo Go** - Bluetooth DOESN'T work (needs native modules)
- ✅ **Web Browser (Chrome/Edge)** - Works with Web Bluetooth API
- ✅ **Development Build (EAS)** - Works when built correctly

**Current Status:** You're likely in Expo Go or Web. Web will work, but you need correct ESP32 setup.

---

### Issue #2: ESP32 Not Advertising Correctly

Your app looks for device name: **`ESP32_ECG`**

#### ✅ Correct ESP32 Arduino Code:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// MUST MATCH YOUR APP!
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define DEVICE_NAME         "ESP32_ECG"  // CRITICAL: Must be exactly this

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected!");
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected!");
      BLEDevice::startAdvertising(); // Restart advertising
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE ECG Server...");

  // Initialize BLE with EXACT device name
  BLEDevice::init(DEVICE_NAME);
  
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

  // Add BLE2902 descriptor (required for notifications)
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
  
  Serial.println("BLE ECG Server ready! Waiting for connections...");
  Serial.printf("Device Name: %s\n", DEVICE_NAME);
  Serial.printf("Service UUID: %s\n", SERVICE_UUID);
  Serial.printf("Characteristic UUID: %s\n", CHARACTERISTIC_UUID);
}

void loop() {
  if (deviceConnected) {
    // Generate simulated ECG data (sine wave)
    static float angle = 0;
    float ecgValue = 512 + (sin(angle) * 200); // Range: 312-712
    angle += 0.1;
    if (angle > 2 * PI) angle = 0;

    // Convert to bytes (float32)
    uint8_t ecgData[4];
    memcpy(ecgData, &ecgValue, 4);
    
    // Send notification
    pCharacteristic->setValue(ecgData, 4);
    pCharacteristic->notify();
    
    Serial.printf("Sent ECG value: %.2f\n", ecgValue);
    delay(10); // ~100 samples/second
  }
  delay(10);
}
```

**Upload this to your ESP32:**
1. Open Arduino IDE
2. Install "ESP32 BLE Arduino" library (Tools → Manage Libraries)
3. Copy/paste code above
4. Select your ESP32 board (Tools → Board)
5. Upload (Ctrl+U)
6. Open Serial Monitor (Ctrl+Shift+M) - verify it says "BLE ECG Server ready!"

---

### Issue #3: Bluetooth Not Enabled

**Windows:**
```powershell
# Check Bluetooth status
Get-PnpDevice -Class Bluetooth | Select-Object Status, FriendlyName
```

**Enable if off:**
- Settings → Bluetooth & devices → Turn ON

**Android Phone:**
- Swipe down → Enable Bluetooth

---

### Issue #4: Device Too Far / Interference

- **Keep ESP32 within 3 meters** of your computer/phone
- **Remove obstacles** (walls, metal objects)
- **Restart ESP32** (press EN/RST button)

---

## 🧪 Diagnostic Checklist

Run through this checklist:

- [ ] **ESP32 powered on?** (LED should be lit)
- [ ] **Serial Monitor shows "BLE ECG Server ready!"?**
- [ ] **Device name is exactly "ESP32_ECG"?** (case-sensitive!)
- [ ] **UUIDs match exactly?** (copy from code above)
- [ ] **Bluetooth enabled on computer/phone?**
- [ ] **Using Chrome/Edge browser?** (for Web Bluetooth)
- [ ] **Not using Expo Go?** (doesn't support Bluetooth)
- [ ] **ESP32 within 3 meters?**

---

## 🐛 Still Not Working? Enable Debug Logs

### Add Debug Console to Your App:

Edit `app/index.tsx` to add a debug section:

```typescript
// Add this state at the top
const [debugLog, setDebugLog] = useState<string[]>([]);

// Add this helper function
const addDebugLog = (message: string) => {
  console.log(`[BLE DEBUG] ${message}`);
  setDebugLog(prev => [...prev.slice(-5), `${new Date().toLocaleTimeString()}: ${message}`]);
};

// Modify handleConnect to add logging:
const handleConnect = async () => {
  addDebugLog('Connect button pressed');
  setIsConnecting(true);
  try {
    addDebugLog('Requesting Bluetooth permissions...');
    const result = await BluetoothService.connectToECGDevice();
    
    if (result.success) {
      addDebugLog(`Connected to device: ${result.deviceName}`);
      setIsConnected(true);
      startMonitoring();
    } else {
      addDebugLog(`Connection failed: ${result.error}`);
      Alert.alert('Connection Failed', result.error);
    }
  } catch (error) {
    addDebugLog(`Exception: ${error}`);
    console.error('Connection error:', error);
    Alert.alert('Error', 'Failed to connect to device');
  } finally {
    setIsConnecting(false);
  }
};

// Add this debug panel in your JSX (before </View> closing tag):
<View style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
  <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Debug Log:</Text>
  {debugLog.map((log, i) => (
    <Text key={i} style={{ fontSize: 10, color: '#666' }}>{log}</Text>
  ))}
</View>
```

---

## 📱 Test Without Hardware (Fake Data Mode)

Your app already has fake data mode! To test the UI without ESP32:

1. Open `services/BluetoothService.ts`
2. Find the `connectToECGDevice` function
3. Temporarily return fake success:

```typescript
// TEMPORARY: Test without hardware
return {
  success: true,
  deviceName: 'FAKE_ESP32_ECG'
};
```

This will use `FakeData.ts` to generate simulated ECG waveforms.

---

## 🎯 Expected Behavior When Working

When Bluetooth connects successfully, you should see:

1. **ESP32 Serial Monitor:**
   ```
   Device connected!
   Sent ECG value: 512.00
   Sent ECG value: 531.45
   Sent ECG value: 550.89
   ```

2. **Your App:**
   - "Connect Device" button disappears
   - "Connected" badge appears
   - Heart rate shows: **~75 BPM**
   - ECG waveform animates smoothly
   - Debug log shows "Connected to device: ESP32_ECG"

3. **Browser Console (F12):**
   ```
   [BLE DEBUG] Connect button pressed
   [BLE DEBUG] Requesting Bluetooth permissions...
   [BLE DEBUG] Connected to device: ESP32_ECG
   Received ECG data: 512.0
   ```

---

## 🚀 Next Steps

1. **Upload ESP32 code** from this guide
2. **Test with Web Bluetooth** (easiest path)
3. **Add debug logs** if still not working
4. **Check ESP32 Serial Monitor** for connection messages

If you see specific error messages, share them and I can help debug further!
