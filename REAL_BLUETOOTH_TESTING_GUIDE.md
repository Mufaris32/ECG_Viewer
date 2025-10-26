# 🔵 Real Bluetooth Testing Guide for ECG Visualizer

## Why Can't I Use Expo Go?

**Expo Go doesn't support native Bluetooth modules** like `react-native-ble-plx`. You need a **Development Build** which includes native code.

---

## ✅ 3 Ways to Test with Real Bluetooth

### **Option 1: EAS Build (Cloud Build) - EASIEST** ⭐ **RECOMMENDED**

Build your app in the cloud and install the APK on your phone.

#### Steps:

1. **Login to EAS** (if not already logged in):
   ```bash
   eas login
   ```

2. **Build Android Development Build**:
   ```bash
   eas build --profile development --platform android
   ```
   
   This will:
   - Upload your code to Expo servers
   - Build the app in the cloud (~10-20 minutes)
   - Give you a download link for the APK

3. **Download & Install**:
   - Click the link in terminal or go to https://expo.dev/accounts/[your-username]/projects/ecgvisualizer/builds
   - Download the APK to your Android phone
   - Install it (you may need to enable "Install from Unknown Sources")

4. **Start Development Server**:
   ```bash
   npx expo start --dev-client
   ```

5. **Open App**:
   - Open the installed "ECGVisualizer" app
   - It will connect to your development server
   - **Now Bluetooth will work!** 🎉

#### Advantages:
- ✅ No Android Studio needed
- ✅ No local setup required
- ✅ Works on Windows, Mac, Linux
- ✅ Builds in the cloud
- ✅ Free tier available (limited builds/month)

---

### **Option 2: Local Build with EAS** 🏠

Build on your computer instead of cloud.

#### Prerequisites:
- Android Studio installed
- Android SDK configured
- Java JDK 17+

#### Steps:

1. **Build Locally**:
   ```bash
   eas build --profile development --platform android --local
   ```

2. **Install APK**:
   - Find the APK in your project folder
   - Transfer to phone and install

3. **Start Server & Test**:
   ```bash
   npx expo start --dev-client
   ```

#### Advantages:
- ✅ Unlimited builds
- ✅ Faster builds after initial setup
- ❌ Requires Android Studio setup

---

### **Option 3: Direct Native Build** 🔧

Build directly with Android Studio.

#### Prerequisites:
- Android Studio installed with SDK
- Android device or emulator

#### Steps:

1. **Generate Native Code**:
   ```bash
   npx expo prebuild
   ```

2. **Build for Android**:
   ```bash
   npx expo run:android
   ```
   
   Or open `android/` folder in Android Studio and click "Run"

3. **The app auto-installs on your connected device/emulator**

#### Advantages:
- ✅ Full control over native code
- ✅ Can debug native issues
- ❌ Most complex setup
- ❌ Need Android development environment

---

## 🧪 Testing Your ECG Device

Once you have the development build installed:

### 1. **Prepare Your ESP32 ECG Device**
   - Make sure it's powered on
   - Bluetooth should be enabled
   - Device should be advertising with name "ECG"

### 2. **Open Your App**
   - Launch the "ECGVisualizer" development build
   - You should see the main dashboard

### 3. **Start Monitoring**
   - Tap "Start Monitoring" button
   - App will scan for Bluetooth devices
   - Look for device named "ECG"
   - Connect to it

### 4. **Expected Behavior**
   - ✅ App should find your ECG device
   - ✅ Connection status should show "Connected"
   - ✅ Real-time ECG data should appear on the graph
   - ✅ Heart rate should update

### 5. **Troubleshooting**
   
   **If device not found:**
   - Ensure Bluetooth is ON on your phone
   - Grant all Bluetooth & Location permissions
   - ESP32 should be within range (< 10 meters)
   - Check ESP32 is advertising with correct name

   **If connection fails:**
   - Restart the ESP32 device
   - Restart the app
   - Check Android location services are enabled (required for BLE)
   - Try "Scan Again"

   **If no data appears:**
   - Check ESP32 is sending data to correct characteristic UUID
   - Check characteristic UUIDs match in your code:
     - Service: Check `BluetoothService.ts`
     - Characteristic: Verify UUIDs match ESP32

---

## 📱 Recommended: Option 1 (EAS Cloud Build)

For most developers, **Option 1** is the best choice:

```bash
# 1. Build (first time ~15 minutes)
eas build --profile development --platform android

# 2. Download APK from link provided

# 3. Install on phone

# 4. Start dev server
npx expo start --dev-client

# 5. Open app on phone - Bluetooth works! 🎉
```

---

## 🔄 Updating Your App

After making code changes:

1. **Keep development build installed** (don't rebuild)
2. Just run:
   ```bash
   npx expo start --dev-client
   ```
3. **Open the app** - it will load the new code automatically!

**Only rebuild when:**
- Adding new native modules/libraries
- Changing `app.json` configuration
- Updating Expo SDK version

---

## 💡 Quick Comparison

| Method | Setup Time | Build Time | Requires Android Studio | Best For |
|--------|-----------|------------|------------------------|----------|
| **EAS Cloud** | 5 min | 15-20 min | ❌ No | Beginners, Quick testing |
| **EAS Local** | 30-60 min | 5-10 min | ✅ Yes | Frequent rebuilds |
| **Native Build** | 30-60 min | 5-10 min | ✅ Yes | Full native access |

---

## 🎯 Next Steps

1. **Wait for build** to complete (check terminal or https://expo.dev)
2. **Download APK** to your phone
3. **Install and open** the app
4. **Connect to your ESP32 ECG device**
5. **Test real Bluetooth!** 🔵

---

## 📞 Need Help?

- Check build status: https://expo.dev/accounts/[your-username]/projects
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- React Native BLE: https://github.com/dotintent/react-native-ble-plx

---

**Note:** The first build takes longer (~15-20 minutes). Subsequent builds are faster (~5-10 minutes).
