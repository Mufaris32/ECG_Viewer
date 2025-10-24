# ECG Viewer - Quick Start Guide

## 🚀 Getting Started

### Run the App
```bash
npm start
# or
npx expo start
```

Then press:
- `a` - Android emulator
- `i` - iOS simulator  
- `w` - Web browser

---

## 📱 App Features

### 1. **Dashboard (Home)**
- Real-time ECG waveform visualization
- Live heart rate monitoring
- Start/Stop scanning
- Quick stats display

### 2. **History Tab**
- View all recorded sessions
- Search by date, time, or heart rate
- Pull-to-refresh to update
- Color-coded status badges

### 3. **Reports Tab**
- Live statistics dashboard
- Reading distribution chart
- Export as PDF/CSV/JSON
- Share reports

### 4. **Settings Tab**
- Dark mode toggle
- Notifications settings
- Auto-save configuration
- Data backup/restore
- Clear all data

---

## 🔧 Key Services

### StorageService
```typescript
import { 
  saveECGSession,
  getAllECGSessions,
  searchECGSessions,
  deleteECGSession,
  getStatistics,
  getUserSettings,
  updateUserSettings
} from './services/StorageService';
```

### ExportService
```typescript
import {
  quickExportPDF,
  quickExportCSV,
  quickExportJSON,
  getExportPreview
} from './services/ExportService';
```

---

## 📊 Data Models

### ECG Session
```typescript
{
  id: string,              // Auto-generated
  date: "2025-10-22",
  time: "14:30",
  heartRate: 75,           // bpm
  avgECG: 1.2,            // mV
  minECG: 0.8,            // mV
  maxECG: 1.6,            // mV
  status: "normal",       // normal | elevated | low
  duration: "5 min",
  durationSeconds: 300,
  ecgData: [],            // Array of readings
  timestamp: 1234567890,
  notes: "Optional"
}
```

---

## 💾 Storage Keys

All data stored in AsyncStorage:
- `@ecg_viewer:sessions` - ECG recordings
- `@ecg_viewer:settings` - User preferences
- `@ecg_viewer:statistics` - Analytics data

---

## 🎨 Theme Colors

```typescript
Primary: #00A8E8      // Blue
Secondary: #00E676     // Green (ECG waveform)
Success: #00E676       // Green
Warning: #FFB74D       // Orange
Error: #FF5252         // Red
```

---

## 📋 Common Tasks

### Save a New Session
```typescript
const session = await saveECGSession({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString(),
  heartRate: 75,
  avgECG: 1.2,
  minECG: 0.8,
  maxECG: 1.6,
  status: 'normal',
  duration: '5 min',
  durationSeconds: 300,
  ecgData: [/* readings */],
});
```

### Load All Sessions
```typescript
const sessions = await getAllECGSessions();
```

### Search Sessions
```typescript
const results = await searchECGSessions('2025-10');
```

### Get Statistics
```typescript
const stats = await getStatistics();
console.log(stats.totalSessions, stats.avgHeartRate);
```

### Export Report
```typescript
const sessions = await getAllECGSessions();
const stats = await getStatistics();
quickExportPDF(sessions, stats);
```

### Update Settings
```typescript
await updateUserSettings({
  darkMode: true,
  notifications: true,
  autoSave: true
});
```

---

## 🐛 Troubleshooting

### No sessions showing?
1. Check if auto-save is enabled in Settings
2. Manually save a session from the dashboard
3. Pull-to-refresh on History tab

### Export not working?
1. Ensure there are sessions to export
2. Check console for error messages
3. Verify permissions if using file system

### Settings not persisting?
1. Check AsyncStorage permissions
2. Look for error alerts
3. Try clearing app data and reconfiguring

---

## 📦 Dependencies

```bash
# Already installed:
- @react-native-async-storage/async-storage
- expo-file-system
- expo-sharing
- react-native-chart-kit
- @expo/vector-icons
```

---

## 🔐 Data Privacy

- All data stored **locally** on device
- No cloud uploads without user action
- Export files are temporary
- Clear data option available in Settings

---

## 📈 Statistics Calculated

- **Total Sessions** - Count of all recordings
- **Average Heart Rate** - Mean BPM across sessions
- **Average Duration** - Mean time per session
- **Last Session** - Relative time (e.g., "2 hours ago")
- **Reading Distribution** - Count by status (normal/elevated/low)

---

## 🎯 Next Steps

1. **Connect Real Device** - Integrate Bluetooth ECG hardware
2. **Test Export** - Try exporting reports
3. **Customize Settings** - Configure preferences
4. **Review Data** - Check History and Reports
5. **Share Reports** - Send to healthcare providers

---

## 📝 Notes

- Sessions auto-save if enabled in Settings
- Search is case-insensitive and real-time
- Export formats: CSV (spreadsheet), JSON (backup), HTML (report)
- Statistics update automatically on data changes
- All times are in local timezone

---

## 🆘 Support

Check these files for detailed documentation:
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `services/StorageService.ts` - Data layer docs
- `services/ExportService.ts` - Export functionality
- Inline comments in all source files

---

**Happy ECG Monitoring! 📊❤️**
