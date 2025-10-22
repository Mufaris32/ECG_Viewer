import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Dimensions, StyleSheet, StatusBar } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { startECGSimulation, stopECGSimulation } from "../services/FakeData";
import { useRouter } from "expo-router";
import { Button, InfoCard } from "../components";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [avgECG, setAvgECG] = useState(1.2);
  const router = useRouter();

  useEffect(() => {
    if (isScanning) {
      startECGSimulation(value => {
        setEcgData(prev => [...prev.slice(-49), value]);
        setHeartRate(60 + Math.floor(Math.random() * 40));
        setAvgECG(parseFloat((Math.random() * 2).toFixed(2)));
      });
    } else stopECGSimulation();

    return () => stopECGSimulation();
  }, [isScanning]);

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
            <View style={[styles.statusDot, isScanning && styles.statusDotActive]} />
            <Text style={styles.statusText}>{isScanning ? "Live" : "Idle"}</Text>
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
              trend={heartRate > 80 ? "up" : heartRate < 70 ? "down" : "neutral"}
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
              {isScanning ? "Monitoring active" : "Start scan to view waveform"}
            </Text>
          </View>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: ecgData.map((_, i) => (i % 5 === 0 ? i.toString() : "")),
                datasets: [{ data: ecgData.length > 0 ? ecgData : [0] as number[] }],
              }}
              width={Dimensions.get("window").width - 32}
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
            onPress={() => setIsScanning(!isScanning)}
            variant={isScanning ? "danger" : "primary"}
            size="lg"
            fullWidth
            icon={
              <Ionicons 
                name={isScanning ? "stop-circle" : "play-circle"} 
                size={20} 
                color={Colors.neutral.white} 
              />
            }
          />
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
