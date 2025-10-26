import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Button, InfoCard } from "../components";
import { BorderRadius, Colors, Shadows, Spacing, Typography } from "../constants/theme";
import {
    ConnectionStatus,
    connectToECGDevice,
    disconnectFromECGDevice,
    isConnected
} from "../services/BluetoothService";
import { startECGSimulation, stopECGSimulation } from "../services/FakeData";
import { getUserSettings, saveECGSession } from "../services/StorageService";

export default function Dashboard() {
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [avgECG, setAvgECG] = useState(1.2);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isConnecting, setIsConnecting] = useState(false);
  const [useFakeData, setUseFakeData] = useState(false); // Fallback for Expo Go
  const [chartWidth, setChartWidth] = useState(Math.max(Dimensions.get("window").width - 64, 300));
  const router = useRouter();
  
  // Track session data
  const sessionStartTime = useRef<number | null>(null);
  const sessionHeartRates = useRef<number[]>([]);
  const sessionECGValues = useRef<number[]>([]);
  const heartRateCalculationBuffer = useRef<number[]>([]);

  // Calculate heart rate from ECG peaks
  const calculateHeartRate = (ecgValue: number) => {
    heartRateCalculationBuffer.current.push(ecgValue);
    
    // Keep last 50 values for HR calculation
    if (heartRateCalculationBuffer.current.length > 50) {
      heartRateCalculationBuffer.current.shift();
    }
    
    // Simple peak detection: count values above threshold
    const threshold = 1.5; // Adjust based on your ECG signal
    const peaks = heartRateCalculationBuffer.current.filter(v => v > threshold).length;
    
    // Estimate BPM (rough calculation)
    const estimatedBPM = Math.min(Math.max(peaks * 6, 50), 180); // Clamp between 50-180
    return estimatedBPM;
  };

  // Handle incoming ECG data from Bluetooth
  const handleECGData = (value: number) => {
    // Update ECG waveform (keep last 50 points)
    setEcgData(prev => [...prev.slice(-49), value]);
    
    // Calculate heart rate from ECG
    const newHeartRate = calculateHeartRate(value);
    setHeartRate(newHeartRate);
    
    // Update average ECG
    setAvgECG(parseFloat(value.toFixed(2)));
    
    // Track session data
    if (sessionStartTime.current) {
      sessionHeartRates.current.push(newHeartRate);
      sessionECGValues.current.push(value);
    }
  };

  // Start Bluetooth monitoring
  const startMonitoring = async () => {
    try {
      setIsConnecting(true);
      
      // Reset session tracking
      sessionStartTime.current = Date.now();
      sessionHeartRates.current = [];
      sessionECGValues.current = [];
      heartRateCalculationBuffer.current = [];
      
      // Try Bluetooth connection first
      const connected = await connectToECGDevice(
        handleECGData,
        (status) => {
          setConnectionStatus(status);
          console.log("Connection status changed:", status);
        }
      );
      
      if (connected) {
        setIsScanning(true);
        setUseFakeData(false);
        Alert.alert(
          "✅ Connected",
          "Successfully connected to ECG device. Monitoring started.",
          [{ text: "OK" }]
        );
      } else {
        // Fallback to fake data for testing in Expo Go
        Alert.alert(
          "⚠️ Bluetooth Not Available",
          "Bluetooth is not available in Expo Go.\n\nUsing simulated data for testing.\n\nTo use real Bluetooth:\n• Build a development build with EAS\n• Or use a real device with a production build",
          [
            { text: "Cancel", style: "cancel", onPress: () => setIsConnecting(false) },
            { 
              text: "Use Fake Data", 
              onPress: () => startFakeDataSimulation()
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error starting monitoring:", error);
      Alert.alert("Error", "Failed to start monitoring. Please try again.");
      setIsConnecting(false);
    }
  };

  // Start fake data simulation (fallback for Expo Go)
  const startFakeDataSimulation = () => {
    setUseFakeData(true);
    setIsScanning(true);
    setConnectionStatus(ConnectionStatus.CONNECTED);
    setIsConnecting(false);
    
    startECGSimulation((value) => {
      handleECGData(value);
    });
  };

  // Stop Bluetooth monitoring
  const stopMonitoring = async () => {
    try {
      setIsScanning(false);
      
      // Stop fake data or real Bluetooth
      if (useFakeData) {
        stopECGSimulation();
        setUseFakeData(false);
      } else {
        await disconnectFromECGDevice();
      }
      
      // Save session if there's data
      if (sessionStartTime.current && sessionHeartRates.current.length > 0) {
        await saveSession();
      }
      
      // Reset data
      heartRateCalculationBuffer.current = [];
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      
    } catch (error) {
      console.error("Error stopping monitoring:", error);
      Alert.alert("Error", "Failed to stop monitoring properly.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (useFakeData) {
        stopECGSimulation();
      } else if (isConnected()) {
        disconnectFromECGDevice();
      }
    };
  }, [useFakeData]);

  // Handle window resize for responsive chart
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setChartWidth(Math.max(window.width - 64, 300));
    });

    return () => subscription?.remove();
  }, []);

  // Handle start/stop button press
  const handleMonitoringToggle = () => {
    if (isScanning) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  // Save ECG session to storage
  const saveSession = async () => {
    try {
      setIsSaving(true);
      
      // Check if auto-save is enabled
      const settings = await getUserSettings();
      
      // Calculate session metrics
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - sessionStartTime.current!) / 1000);
      
      // Ensure we have data
      if (sessionHeartRates.current.length === 0 || sessionECGValues.current.length === 0) {
        console.log("No data to save");
        return;
      }
      
      const avgHeartRate = Math.round(
        sessionHeartRates.current.reduce((a, b) => a + b, 0) / sessionHeartRates.current.length
      );
      const avgECGValue = parseFloat(
        (sessionECGValues.current.reduce((a, b) => a + b, 0) / sessionECGValues.current.length).toFixed(2)
      );
      const minECGValue = Math.min(...sessionECGValues.current);
      const maxECGValue = Math.max(...sessionECGValues.current);
      
      // Determine status based on heart rate
      let status: 'normal' | 'elevated' | 'low' = 'normal';
      if (avgHeartRate > 85) status = 'elevated';
      else if (avgHeartRate < 65) status = 'low';
      
      // Format date and time
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      // Format duration
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const duration = minutes > 0 
        ? `${minutes}m ${seconds}s` 
        : `${seconds}s`;
      
      // Create session object
      const session = {
        date,
        time,
        heartRate: avgHeartRate,
        avgECG: avgECGValue,
        minECG: minECGValue,
        maxECG: maxECGValue,
        status,
        duration,
        durationSeconds,
        ecgData: sessionECGValues.current,
        notes: `Bluetooth ECG recording on ${date} at ${time}`,
      };
      
      // Save to storage if auto-save is enabled
      if (settings.autoSave) {
        await saveECGSession(session);
        
        Alert.alert(
          '✅ Session Saved',
          `ECG monitoring session saved successfully!\n\n` +
          `Duration: ${duration}\n` +
          `Heart Rate: ${avgHeartRate} bpm (${status})\n` +
          `Avg ECG: ${avgECGValue} mV\n\n` +
          `View in History tab or export from Reports.`,
          [
            { text: 'View History', onPress: () => router.push('/history') },
            { text: 'OK' },
          ]
        );
      } else {
        // Ask user if they want to save
        Alert.alert(
          'Save Session?',
          `Duration: ${duration}\n` +
          `Heart Rate: ${avgHeartRate} bpm (${status})\n` +
          `Avg ECG: ${avgECGValue} mV\n\n` +
          `Would you like to save this session?`,
          [
            { text: 'Discard', style: 'cancel' },
            { 
              text: 'Save', 
              onPress: async () => {
                await saveECGSession(session);
                Alert.alert('Success', 'Session saved to history!');
              }
            },
          ]
        );
      }
      
      // Reset session tracking
      sessionStartTime.current = null;
      sessionHeartRates.current = [];
      sessionECGValues.current = [];
      
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save ECG session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get connection status display
  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return { text: "Connected", color: Colors.accent.success };
      case ConnectionStatus.CONNECTING:
        return { text: "Connecting...", color: Colors.accent.warning };
      case ConnectionStatus.SCANNING:
        return { text: "Scanning...", color: Colors.accent.info };
      case ConnectionStatus.ERROR:
        return { text: "Error", color: Colors.accent.error };
      case ConnectionStatus.DISCONNECTED:
      default:
        return { text: "Disconnected", color: Colors.neutral.gray400 };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>ECG Monitor</Text>
            <Text style={styles.headerSubtitle}>Real-time cardiac monitoring</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              connectionStatus === ConnectionStatus.CONNECTED && styles.statusDotActive,
              connectionStatus === ConnectionStatus.SCANNING && styles.statusDotScanning,
              connectionStatus === ConnectionStatus.CONNECTING && styles.statusDotConnecting,
              connectionStatus === ConnectionStatus.ERROR && styles.statusDotError
            ]} />
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>
        </View>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCardWrapper}>
            <InfoCard
              title="Heart Rate"
              value={heartRate}
              unit="bpm"
              variant="primary"
              trend={heartRate > 80 ? "up" : heartRate < 120 ? "down" : "neutral"}
              trendValue={`${Math.abs(heartRate - 75)} from avg`}
              icon={
                <Ionicons 
                  name="heart" 
                  size={24} 
                  color={Colors.accent.error} 
                />
              }
            />
          </View>
          <View style={styles.infoCardWrapper}>
            <InfoCard
              title="Avg ECG"
              value={avgECG}
              unit="mV"
              variant="success"
              icon={
                <Ionicons 
                  name="pulse" 
                  size={24} 
                  color={Colors.secondary.main} 
                />
              }
            />
          </View>
        </View>

        {/* ECG Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>ECG Waveform</Text>
            <Text style={styles.chartSubtitle}>
              {connectionStatus === ConnectionStatus.CONNECTED 
                ? "Live ECG data from Bluetooth device" 
                : "Connect to device to view waveform"}
            </Text>
          </View>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: ecgData.map((_, i) => (i % 5 === 0 ? i.toString() : "")),
                datasets: [{ data: ecgData.length > 0 ? ecgData : [0] as number[] }],
              }}
              width={chartWidth}
              height={220}
              yAxisSuffix="mV"
              chartConfig={{
                backgroundGradientFrom: Colors.chart.background,
                backgroundGradientTo: Colors.chart.background,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
                labelColor: (opacity = 1) => Colors.chart.labelColor,
                propsForDots: { r: "0" },
                strokeWidth: 2,
              }}
              bezier
              withDots={false}
              withInnerLines={true}
              withOuterLines={false}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title={isScanning ? "Stop Monitoring" : "Start Monitoring"}
            onPress={handleMonitoringToggle}
            variant={isScanning ? "danger" : "primary"}
            size="lg"
            fullWidth
            loading={isSaving || isConnecting}
            disabled={isSaving || isConnecting}
            icon={
              <Ionicons 
                name={isScanning ? "stop-circle" : "play-circle"} 
                size={20} 
                color={Colors.neutral.white} 
              />
            }
          />
          
          {isScanning && (
            <Text style={styles.recordingText}>
              🔴 Recording {useFakeData ? "simulated" : "Bluetooth"} ECG data... All data will be saved when you stop.
            </Text>
          )}
          
          {isConnecting && !useFakeData && (
            <Text style={styles.connectingText}>
              🔍 Scanning for ESP32 device named "ECG"...
            </Text>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <Button
              title="History"
              onPress={() => router.push("/history")}
              variant="outline"
              size="md"
              style={styles.quickActionButton}
              icon={<Ionicons name="time-outline" size={18} color={Colors.primary.main} />}
            />
            <Button
              title="Reports"
              onPress={() => router.push("/reports")}
              variant="outline"
              size="md"
              style={styles.quickActionButton}
              icon={<Ionicons name="document-text-outline" size={18} color={Colors.primary.main} />}
            />
            <Button
              title="Settings"
              onPress={() => router.push("/settings")}
              variant="outline"
              size="md"
              style={styles.quickActionButton}
              icon={<Ionicons name="settings-outline" size={18} color={Colors.primary.main} />}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },

  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },

  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },

  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.gray400,
    marginRight: Spacing.sm,
  },

  statusDotActive: {
    backgroundColor: Colors.accent.success,
  },

  statusDotScanning: {
    backgroundColor: Colors.accent.info,
  },

  statusDotConnecting: {
    backgroundColor: Colors.accent.warning,
  },

  statusDotError: {
    backgroundColor: Colors.accent.error,
  },

  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.secondary,
  },

  // Info Grid Styles
  infoGrid: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.sm / 2,
  },

  infoCardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.sm / 2,
  },

  // Chart Section Styles
  chartSection: {
    marginBottom: Spacing.xl,
  },

  chartHeader: {
    marginBottom: Spacing.md,
  },

  chartTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },

  chartSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  chartContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.md,
    overflow: "hidden",
  },

  chart: {
    borderRadius: BorderRadius.md,
  },

  // Action Section Styles
  actionSection: {
    marginBottom: Spacing.xl,
  },

  recordingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.error,
    textAlign: "center",
    marginTop: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },

  connectingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.info,
    textAlign: "center",
    marginTop: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },

  // Quick Actions Styles
  quickActionsSection: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm / 2,
  },

  quickActionButton: {
    flex: 1,
    minWidth: "30%",
    marginHorizontal: Spacing.sm / 2,
    marginBottom: Spacing.sm,
  },
});
