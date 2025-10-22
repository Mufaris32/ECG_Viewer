import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { Button, InfoCard, Card } from "../components";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function Reports() {
  const [isExporting, setIsExporting] = useState(false);

  // Simulated statistics
  const statistics = {
    totalSessions: 127,
    avgHeartRate: 75,
    avgDuration: "8.5 min",
    lastSession: "2 hours ago",
    normalReadings: 89,
    elevatedReadings: 31,
    lowReadings: 7,
  };

  // Handle PDF export
  const handleExportPDF = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        "Export Successful",
        "Your ECG report has been exported as PDF successfully.",
        [{ text: "OK" }]
      );
    }, 2000);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    Alert.alert(
      "Export to CSV",
      "ECG data will be exported in CSV format for analysis in spreadsheet applications.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export", onPress: () => Alert.alert("CSV Export (demo)") },
      ]
    );
  };

  // Handle Share report
  const handleShareReport = () => {
    Alert.alert(
      "Share Report",
      "Choose how you'd like to share your ECG report",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Email", onPress: () => Alert.alert("Email Share (demo)") },
        { text: "More Options", onPress: () => Alert.alert("Share Options (demo)") },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive ECG monitoring insights
          </Text>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <InfoCard
                title="Total Sessions"
                value={statistics.totalSessions}
                variant="primary"
                icon={<Ionicons name="medical" size={24} color={Colors.primary.main} />}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <InfoCard
                title="Avg Heart Rate"
                value={statistics.avgHeartRate}
                unit="bpm"
                variant="success"
                icon={<Ionicons name="heart" size={24} color={Colors.accent.error} />}
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <InfoCard
                title="Avg Duration"
                value={statistics.avgDuration}
                variant="default"
                icon={<Ionicons name="timer" size={24} color={Colors.primary.main} />}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <InfoCard
                title="Last Session"
                value={statistics.lastSession}
                variant="default"
                icon={<Ionicons name="time" size={24} color={Colors.text.secondary} />}
              />
            </View>
          </View>
        </View>

        {/* Reading Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Distribution</Text>
          <Card style={styles.distributionCard}>
            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionDot, { backgroundColor: Colors.accent.success }]} />
                <Text style={styles.distributionLabel}>Normal</Text>
                <Text style={styles.distributionValue}>{statistics.normalReadings}</Text>
              </View>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionDot, { backgroundColor: Colors.accent.warning }]} />
                <Text style={styles.distributionLabel}>Elevated</Text>
                <Text style={styles.distributionValue}>{statistics.elevatedReadings}</Text>
              </View>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionDot, { backgroundColor: Colors.accent.error }]} />
                <Text style={styles.distributionLabel}>Low</Text>
                <Text style={styles.distributionValue}>{statistics.lowReadings}</Text>
              </View>
            </View>

            {/* Simple Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: statistics.normalReadings,
                    backgroundColor: Colors.accent.success,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: statistics.elevatedReadings,
                    backgroundColor: Colors.accent.warning,
                  },
                ]}
              />
              <View
                style={[
                  styles.progressSegment,
                  {
                    flex: statistics.lowReadings,
                    backgroundColor: Colors.accent.error,
                  },
                ]}
              />
            </View>
          </Card>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          
          <Button
            title="Export as PDF"
            onPress={handleExportPDF}
            variant="primary"
            size="lg"
            fullWidth
            loading={isExporting}
            style={styles.exportButton}
            icon={<Ionicons name="document-text" size={20} color={Colors.neutral.white} />}
          />

          <Button
            title="Export as CSV"
            onPress={handleExportCSV}
            variant="secondary"
            size="lg"
            fullWidth
            style={styles.exportButton}
            icon={<Ionicons name="grid" size={20} color={Colors.neutral.white} />}
          />

          <Button
            title="Share Report"
            onPress={handleShareReport}
            variant="outline"
            size="lg"
            fullWidth
            icon={<Ionicons name="share-social" size={20} color={Colors.primary.main} />}
          />
        </View>

        {/* Information Notice */}
        <Card style={styles.infoNotice} variant="filled">
          <View style={styles.infoNoticeContent}>
            <Ionicons name="information-circle" size={24} color={Colors.primary.main} />
            <View style={styles.infoNoticeText}>
              <Text style={styles.infoNoticeTitle}>Report Information</Text>
              <Text style={styles.infoNoticeDescription}>
                Reports include all recorded ECG sessions, statistical analysis, and trend indicators.
                Exported files can be shared with healthcare professionals.
              </Text>
            </View>
          </View>
        </Card>
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

  // Section Styles
  section: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    marginHorizontal: -Spacing.sm / 2,
    marginBottom: Spacing.md,
  },

  statCardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.sm / 2,
  },

  // Distribution Card
  distributionCard: {
    padding: Spacing.base,
  },

  distributionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.base,
  },

  distributionItem: {
    alignItems: "center",
  },

  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: Spacing.xs,
  },

  distributionLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },

  distributionValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },

  progressBarContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },

  progressSegment: {
    height: "100%",
  },

  // Export Buttons
  exportButton: {
    marginBottom: Spacing.md,
  },

  // Info Notice
  infoNotice: {
    marginTop: Spacing.base,
  },

  infoNoticeContent: {
    flexDirection: "row",
  },

  infoNoticeText: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  infoNoticeTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  infoNoticeDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
});
