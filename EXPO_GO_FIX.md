# 🔧 Bluetooth Fix for Expo Go

## Problem
The error `Cannot read properties of undefined (reading 'createClient')` occurs because **Expo Go doesn't support native Bluetooth modules** like `react-native-ble-plx`.

## ✅ Solution Implemented

### 1. **Graceful Degradation**
The BluetoothService now:
- Tries to load `react-native-ble-plx` module
- Falls back gracefully if not available (Expo Go)
- Shows helpful error message

### 2. **Fake Data Fallback**
When Bluetooth is unavailable, the app:
- Detects the limitation
- Offers to use simulated ECG data
- Works perfectly in Expo Go for testing UI/UX

### 3. **Production Ready**
For real Bluetooth support, you need to:
- Build a development build (EAS Build)
- Or create a production APK/IPA

---

## 🧪 Testing in Expo Go

### What Works ✅
- ✅ App loads without crashing
- ✅ UI is fully functional
- ✅ Can use fake data for testing
- ✅ All features work (History, Reports, Settings)
- ✅ Data storage and export
- ✅ Chart visualization

### What Doesn't Work ❌
- ❌ Real Bluetooth connection to ESP32
- ❌ Live ECG data from hardware

### How to Test
1. Open app in Expo Go
2. Tap "Start Monitoring"
3. See alert: "Bluetooth Not Available"
4. Choose "Use Fake Data"
5. App simulates ECG data for testing

---

## 🚀 For Real Bluetooth Support

### Option 1: EAS Development Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build for Android
eas build --profile development --platform android

# Or for iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

Once built, install the APK/IPA on your device and you'll have full Bluetooth support!

### Option 2: Expo Prebuild (Local Development)

```bash
# Generate native code
npx expo prebuild

# Run on Android
npx expo run:android

# Or iOS
npx expo run:ios
```

---

## 📱 Current App Behavior

### In Expo Go
```
User taps "Start Monitoring"
         ↓
App tries Bluetooth connection
         ↓
Detects Expo Go environment
         ↓
Shows alert with 2 options:
  • Cancel (go back)
  • Use Fake Data (for testing)
         ↓
If "Use Fake Data" selected:
  → Simulates ECG waveform
  → All features work normally
  → Data can be saved/exported
```

### In Development/Production Build
```
User taps "Start Monitoring"
         ↓
App requests Bluetooth permissions
         ↓
Scans for ESP32 device
         ↓
Connects to real hardware
         ↓
Receives live ECG data
         ↓
Displays real-time waveform
```

---

## 🔄 Quick Start Guide

### For Testing (Expo Go)
1. ✅ Install dependencies: `npm install`
2. ✅ Start Expo: `npx expo start`
3. ✅ Scan QR code in Expo Go app
4. ✅ Use "Fake Data" option for testing

### For Production (Real Bluetooth)
1. ✅ Build with EAS: `eas build --profile development --platform android`
2. ✅ Download and install APK
3. ✅ Upload ESP32 code (from BLUETOOTH_INTEGRATION.md)
4. ✅ Connect to real ESP32 device

---

## 📋 Modified Files

1. ✅ `services/BluetoothService.ts`
   - Added try-catch for module loading
   - Graceful fallback if BLE not available
   - All references use `bleManagerInstance`

2. ✅ `app/index.tsx`
   - Added `useFakeData` state
   - Fallback to FakeData service
   - Helpful alerts for users
   - Works in both Expo Go and native builds

3. ✅ `app.json`
   - Added iOS Bluetooth permissions
   - Already had Android permissions
   - Plugin configured

4. ✅ `package.json`
   - Added `buffer` package
   - Already has `react-native-ble-plx`

---

## ✅ Current Status

### ✅ Working Now
- App runs in Expo Go without errors
- UI fully functional
- Can test with simulated data
- All features accessible
- Production-ready code for native builds

### 🎯 Next Steps for Real Hardware
1. Create EAS development build
2. Install on physical device
3. Upload ESP32 code
4. Connect to real ECG device

---

## 💡 Tips

### For Development
- Use Expo Go for UI/UX development
- Use fake data to test features
- Build native when ready for hardware testing

### For Production
- Always test on physical devices
- Request Bluetooth permissions properly
- Handle connection errors gracefully
- Provide clear user feedback

---

## 🐛 Troubleshooting

### "Bluetooth Not Available" in native build
- Check `app.json` has correct permissions
- Verify `react-native-ble-plx` plugin is configured
- Rebuild the app after changes

### Fake data doesn't stop
- Make sure `stopECGSimulation()` is called
- Check cleanup in useEffect dependencies

### Can't build native app
- Install EAS CLI: `npm install -g eas-cli`
- Login to Expo account
- Follow EAS build docs

---

## ✅ Success!

Your app now:
- ✅ Works in Expo Go (with fake data)
- ✅ Ready for native builds (with real Bluetooth)
- ✅ Handles both scenarios gracefully
- ✅ Provides clear user feedback

Test it now in Expo Go, and when ready, build for production to connect to your ESP32!
