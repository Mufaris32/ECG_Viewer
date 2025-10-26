import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { BorderRadius, Colors, Spacing, Typography } from "../../constants/theme";
import { generateECGBatch } from "../../services/FakeData";

export default function ECGScreen() {
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [heartRate] = useState(72);
  const [chartWidth, setChartWidth] = useState(Math.max(Dimensions.get("window").width - 64, 300));

  useEffect(() => {
    // Initialize with a realistic ECG pattern
    setEcgData(generateECGBatch(50));

    // Simulate live ECG updates
    const interval = setInterval(() => {
      if (isLive) {
        setEcgData((prev: number[]) => {
          const nextPoint = prev.length;
          const newValue = generateECGBatch(1)[0];
          return [...prev.slice(-49), newValue]; // Keep last 50 points
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isLive]);

  // Handle window resize for responsive chart
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setChartWidth(Math.max(window.width - 64, 300));
    });

    return () => subscription?.remove();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.dark} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Live ECG Waveform</Text>
            <Text style={styles.headerSubtitle}>Real-time cardiac monitoring</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Vital Signs Panel */}
        <View style={styles.vitalsPanel}>
          <View style={styles.vitalCard}>
            <Ionicons name="heart" size={20} color={Colors.accent.error} />
            <View style={styles.vitalInfo}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>{heartRate} bpm</Text>
            </View>
          </View>
          
          <View style={styles.vitalCard}>
            <Ionicons name="pulse" size={20} color={Colors.secondary.main} />
            <View style={styles.vitalInfo}>
              <Text style={styles.vitalLabel}>Rhythm</Text>
              <Text style={styles.vitalValue}>Normal</Text>
            </View>
          </View>
        </View>

        {/* ECG Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Lead II</Text>
            <View style={styles.chartControls}>
              <Text style={styles.chartSpeed}>25 mm/s</Text>
              <Text style={styles.chartAmplitude}>10 mm/mV</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {/* Grid overlay for medical-grade appearance */}
            <View style={styles.gridOverlay}>
              {/* Vertical grid lines */}
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.gridLine,
                    styles.verticalLine,
                    { left: `${(i / 19) * 100}%` },
                    i % 5 === 0 && styles.majorGridLine,
                  ]}
                />
              ))}
              {/* Horizontal grid lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.gridLine,
                    styles.horizontalLine,
                    { top: `${(i / 9) * 100}%` },
                    i % 5 === 0 && styles.majorGridLine,
                  ]}
                />
              ))}
            </View>

            <LineChart
              data={{
                labels: ecgData.map((_, i) => (i % 10 === 0 ? "" : "")),
                datasets: [{ data: ecgData.length > 0 ? ecgData : [0] as number[] }],
              }}
              width={chartWidth}
              height={280}
              chartConfig={{
                backgroundGradientFrom: Colors.chart.background,
                backgroundGradientTo: Colors.chart.background,
                decimalPlaces: 2,
                color: (opacity = 1) => Colors.chart.ecgGreen,
                labelColor: (opacity = 1) => "transparent",
                propsForDots: { r: "0" },
                strokeWidth: 2,
                propsForBackgroundLines: {
                  strokeWidth: 0, // Hide default grid
                },
              }}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              style={styles.chart}
            />
          </View>

          {/* Chart Info */}
          <View style={styles.chartInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer-outline" size={16} color={Colors.text.inverse} />
              <Text style={styles.infoText}>Sampling: 100 Hz</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="analytics-outline" size={16} color={Colors.text.inverse} />
              <Text style={styles.infoText}>Resolution: 12-bit</Text>
            </View>
          </View>
        </View>

        {/* Wave Analysis Panel */}
        <View style={styles.analysisPanel}>
          <Text style={styles.analysisTitle}>Wave Analysis</Text>
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>P Wave</Text>
              <Text style={styles.analysisValue}>0.10 s</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>QRS Complex</Text>
              <Text style={styles.analysisValue}>0.08 s</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>T Wave</Text>
              <Text style={styles.analysisValue}>0.16 s</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>PR Interval</Text>
              <Text style={styles.analysisValue}>0.16 s</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>QT Interval</Text>
              <Text style={styles.analysisValue}>0.40 s</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>RR Interval</Text>
              <Text style={styles.analysisValue}>0.83 s</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
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
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs / 2,
  },

  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.gray400,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 230, 118, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.success,
    marginRight: Spacing.sm,
  },

  liveText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.success,
  },

  // Vitals Panel
  vitalsPanel: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },

  vitalCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.darker,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  vitalInfo: {
    marginLeft: Spacing.md,
  },

  vitalLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginBottom: Spacing.xs / 2,
  },

  vitalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },

  // Chart Section
  chartSection: {
    marginBottom: Spacing.xl,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  chartTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },

  chartControls: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  chartSpeed: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
  },

  chartAmplitude: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
  },

  chartContainer: {
    position: "relative",
    backgroundColor: Colors.chart.background,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.2)",
  },

  // Medical-grade grid overlay
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(0, 230, 118, 0.1)",
  },

  majorGridLine: {
    backgroundColor: "rgba(0, 230, 118, 0.2)",
  },

  verticalLine: {
    width: 1,
    height: "100%",
  },

  horizontalLine: {
    width: "100%",
    height: 1,
  },

  chart: {
    borderRadius: BorderRadius.md,
    zIndex: 2,
  },

  chartInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginLeft: Spacing.xs,
  },

  // Analysis Panel
  analysisPanel: {
    backgroundColor: Colors.background.darker,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  analysisTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.md,
  },

  analysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm / 2,
  },

  analysisItem: {
    width: "33.33%",
    paddingHorizontal: Spacing.sm / 2,
    marginBottom: Spacing.md,
  },

  analysisLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginBottom: Spacing.xs,
  },

  analysisValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.inverse,
  },
});
