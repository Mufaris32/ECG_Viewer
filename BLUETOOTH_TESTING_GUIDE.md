# 🧪 Complete Bluetooth Testing Guide

## 🎯 Testing Options

You have **4 ways** to test Bluetooth in your ECG Visualizer app:

---

## ✅ **Option 1: Web Bluetooth Testing (Recommended - Works Now!)**

### Why This Works
Your app runs on web via Expo, and **web browsers support native Bluetooth API**!

### Requirements
- ✅ Chrome, Edge, or Opera browser (Safari doesn't support Web Bluetooth)
- ✅ ESP32 with Bluetooth code uploaded
- ✅ HTTPS or localhost (required for Web Bluetooth API)

### Steps

#### 1. Start Expo Development Server
```powershell
cd E:\Projects\ECG_Viewer\ECGVisualizer
npx expo start
```

#### 2. Open in Web Browser
- Press `w` in terminal, or
- Open: `http://localhost:8081`
- **Must use Chrome, Edge, or Opera**

#### 3. Prepare ESP32
Upload this Arduino code to your ESP32:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("✅ Device connected");
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("❌ Device disconnected");
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("🚀 Starting BLE ECG Server...");

  BLEDevice::init("ECG");  // Device name - MUST contain "ECG"
  
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
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  
  Serial.println("✅ BLE Server Ready!");
  Serial.println("📡 Waiting for connections...");
}

void loop() {
  if (deviceConnected) {
    // Simulate realistic ECG waveform
    static float angle = 0;
    float ecgValue = 1.0 + (sin(angle) * 0.5); // 0.5-1.5 mV
    angle += 0.1;
    
    // Send as float (4 bytes)
    pCharacteristic->setValue((uint8_t*)&ecgValue, sizeof(float));
    pCharacteristic->notify();
    
    Serial.printf("📊 ECG: %.3f mV\n", ecgValue);
    delay(50); // 20 samples/second
  } else {
    delay(100);
  }
}
```

#### 4. Test Connection
1. Power on ESP32
2. In web app, click **"Start Monitoring"**
3. Browser shows device picker
4. Select your ESP32 device
5. Watch live ECG waveform! 📈

### Expected Results
- ✅ Connection status: Disconnected → Scanning → Connected
- ✅ Green indicator dot appears
- ✅ ECG chart updates in real-time
- ✅ Heart rate calculated from data
- ✅ Session auto-saves on stop

---

## ✅ **Option 2: Fake Data Testing (Current - No Hardware Needed)**

### Why Use This
- ✅ No ESP32 hardware required
- ✅ Test UI/UX without Bluetooth
- ✅ Perfect for development
- ✅ Already working in Expo Go

### Steps

1. **Start app in Expo Go:**
   ```powershell
   npx expo start
   ```

2. **Press `w` for web or scan QR code with Expo Go app**

3. **Click "Start Monitoring"**
   - Alert appears: "Bluetooth Not Available"
   - Click **"Use Fake Data"**

4. **Watch simulated ECG:**
   - Realistic waveform with P, QRS, T waves
   - Calculated heart rate
   - All features work except real Bluetooth

### How It Works
```typescript
// services/FakeData.ts generates realistic ECG patterns
const ecgValue = generateECGPattern(time);
// Simulates: P wave → QRS complex → T wave
```

---

## ✅ **Option 3: Native App with EAS Build (Full Bluetooth)**

### Why Use This
- ✅ Full native Bluetooth support on Android/iOS
- ✅ Test on real devices
- ✅ Production-ready

### Steps

#### 1. Install EAS CLI
```powershell
npm install -g eas-cli
```

#### 2. Login to Expo
```powershell
eas login
```

#### 3. Configure Project
```powershell
eas build:configure
```

#### 4. Build Development APK (Android)
```powershell
# For Android development build
eas build --platform android --profile development

# For iOS (requires Apple Developer account)
eas build --platform ios --profile development
```

#### 5. Install on Device
- Download APK from Expo dashboard
- Install on Android device
- Or use: `eas build:run --platform android`

#### 6. Test with ESP32
- Upload ESP32 code
- Open app on device
- Grant Bluetooth permissions
- Click "Start Monitoring"
- Real Bluetooth connection! 🎉

### Build Configuration

Add to `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## ✅ **Option 4: React Native CLI (Advanced)**

### Why Use This
- ✅ Full control over native code
- ✅ No Expo limitations
- ✅ Can modify native modules

### Steps

#### 1. Eject from Expo (⚠️ Cannot be undone!)
```powershell
npx expo prebuild
```

#### 2. Install Dependencies
```powershell
npm install react-native-ble-plx
```

#### 3. Link Native Modules
```powershell
npx pod-install  # iOS only
```

#### 4. Run on Device
```powershell
# Android
npx react-native run-android

# iOS (Mac only)
npx react-native run-ios
```

---

## 🧪 **Testing Checklist**

### Web Bluetooth Testing
- [ ] ESP32 powered and running BLE code
- [ ] Chrome/Edge browser opened
- [ ] Bluetooth enabled on computer
- [ ] ESP32 within 10 meters
- [ ] Device picker shows ESP32
- [ ] Connection successful
- [ ] Live data streaming
- [ ] Chart updates in real-time
- [ ] Heart rate calculated
- [ ] Disconnect works properly

### Fake Data Testing
- [ ] App starts without errors
- [ ] "Start Monitoring" button works
- [ ] Alert shows "Use Fake Data" option
- [ ] Simulated waveform displays
- [ ] All UI elements functional
- [ ] Session saving works
- [ ] Export features work

### Native App Testing
- [ ] Build completed successfully
- [ ] App installed on device
- [ ] Bluetooth permissions granted
- [ ] ESP32 discovered during scan
- [ ] Connection established
- [ ] Real-time data received
- [ ] App doesn't crash
- [ ] Background monitoring works
- [ ] Reconnection after disconnect

---

## 🐛 **Troubleshooting**

### Web Bluetooth Issues

#### ❌ "Bluetooth not available"
**Solutions:**
- Use Chrome, Edge, or Opera (not Safari/Firefox)
- Check `chrome://flags/#enable-web-bluetooth` is enabled
- Ensure you're on HTTPS or localhost
- Enable Bluetooth on your computer

#### ❌ "Device not found"
**Solutions:**
- Check ESP32 is powered on
- Verify ESP32 Serial Monitor shows "Waiting for connections..."
- Move ESP32 closer (< 10 meters)
- Check device name contains "ECG"
- Restart ESP32

#### ❌ "Connection failed"
**Solutions:**
- Verify UUIDs match exactly in ESP32 code
- Check BLE service is started: `pService->start()`
- Add notification descriptor: `new BLE2902()`
- Check ESP32 isn't connected to another device

### ESP32 Issues

#### ❌ "Upload failed"
**Solutions:**
- Install ESP32 board in Arduino IDE:
  - File → Preferences → Additional Board URLs:
  - `https://dl.espressif.com/dl/package_esp32_index.json`
  - Tools → Board → Boards Manager → Install ESP32
- Select correct port in Tools → Port
- Hold BOOT button while uploading

#### ❌ "No data in Serial Monitor"
**Solutions:**
- Check baud rate is 115200
- Press ESP32 RESET button
- Select correct COM port
- Check USB cable is data cable (not charge-only)

---

## 📊 **Expected Output**

### ESP32 Serial Monitor
```
🚀 Starting BLE ECG Server...
✅ BLE Server Ready!
📡 Waiting for connections...
✅ Device connected
📊 ECG: 0.987 mV
📊 ECG: 1.123 mV
📊 ECG: 1.245 mV
...
```

### Web App Console
```
🔍 Scanning for ECG BLE devices...
📡 Found device: ECG
🔗 Connected to device: XX:XX:XX:XX:XX:XX
🔍 Discovered services and characteristics
📊 Found characteristic: beb5483e-36e1-4688-b7f5-ea07361b26a8
✅ Starting notification monitoring...
💚 Bluetooth Status: CONNECTED
```

---

## 🎯 **Recommended Testing Order**

1. **Start with Fake Data** (5 minutes)
   - Test all UI features
   - Verify no crashes
   - Check data flow

2. **Test Web Bluetooth** (30 minutes)
   - Upload ESP32 code
   - Test connection
   - Verify real-time data

3. **Build Native App** (optional, 1-2 hours)
   - For production testing
   - Full Bluetooth support
   - Background monitoring

---

## 🚀 **Quick Start Commands**

### Test on Web (Recommended)
```powershell
cd E:\Projects\ECG_Viewer\ECGVisualizer
npx expo start
# Press 'w' to open in browser
```

### Build for Android
```powershell
eas build --platform android --profile development
```

### Upload to ESP32
1. Open Arduino IDE
2. Copy code from above
3. Tools → Board → ESP32 Dev Module
4. Tools → Port → Select COM port
5. Click Upload ⬆️

---

## 📚 **Additional Resources**

### Documentation
- ✅ `BLUETOOTH_INTEGRATION.md` - Full integration guide
- ✅ `BLUETOOTH_SERVICE_GUIDE.md` - API documentation
- ✅ `QUICK_START.md` - App overview

### ESP32 Resources
- [ESP32 BLE Arduino Guide](https://randomnerdtutorials.com/esp32-bluetooth-low-energy-ble-arduino-ide/)
- [BLE Characteristic UUIDs](https://www.uuidgenerator.net/)
- [AD8232 ECG Sensor Tutorial](https://lastminuteengineers.com/ad8232-ecg-sensor-arduino-tutorial/)

### Web Bluetooth
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Chrome Web Bluetooth](https://developer.chrome.com/articles/bluetooth/)
- [Can I Use Web Bluetooth](https://caniuse.com/web-bluetooth)

---

## ✅ **Success Criteria**

Your Bluetooth is working correctly when:
- ✅ Device discovered within 10 seconds
- ✅ Connection established successfully
- ✅ ECG waveform updates smoothly (20 fps)
- ✅ Heart rate calculated correctly
- ✅ No crashes or freezes
- ✅ Session saves with real data
- ✅ Reconnection works after disconnect

---

## 🎉 **You're Ready!**

Choose your testing method:
1. **Quick Test:** Web Bluetooth (recommended) ⚡
2. **Development:** Fake Data 🎭
3. **Production:** Native Build 📱

**Start with Web Bluetooth - it works right now!** 🚀
