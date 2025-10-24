import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Button, Card, InfoCard } from "../components";
import { BorderRadius, Colors, Spacing, Typography } from "../constants/theme";
import { getExportPreview, quickExportCSV, quickExportJSON, quickExportPDF } from "../services/ExportService";
import { getAllECGSessions, getStatistics, getTimeAgo } from "../services/StorageService";

export default function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    avgHeartRate: 0,
    avgDuration: "0 min",
    lastSessionTimestamp: 0,
    normalReadings: 0,
    elevatedReadings: 0,
    lowReadings: 0,
  });

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
  }, []);

  // Load statistics from storage
  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const sessions = await getAllECGSessions();
      
      if (sessions.length === 0) {
        Alert.alert('No Data', 'There are no ECG sessions to export.');
        setIsExporting(false);
        return;
      }

      const stats = await getStatistics();
      const success = quickExportPDF(sessions, stats);
      
      if (success) {
        // Simulate export delay for user feedback
        setTimeout(() => {
          setIsExporting(false);
        }, 1500);
      } else {
        setIsExporting(false);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting the report.');
      setIsExporting(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const sessions = await getAllECGSessions();
      
      if (sessions.length === 0) {
        Alert.alert('No Data', 'There are no ECG sessions to export.');
        return;
      }

      const preview = getExportPreview(sessions);
      
      Alert.alert(
        "Export to CSV",
        `${preview}\n\nExport ECG data in CSV format for analysis in spreadsheet applications?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Export", 
            onPress: () => quickExportCSV(sessions)
          },
        ]
      );
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting the data.');
    }
  };

  // Handle JSON export (for backup/restore)
  const handleExportJSON = async () => {
    try {
      const sessions = await getAllECGSessions();
      
      if (sessions.length === 0) {
        Alert.alert('No Data', 'There are no ECG sessions to export.');
        return;
      }

      const stats = await getStatistics();
      quickExportJSON(sessions, stats);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting the data.');
    }
  };

  // Handle Share report
  const handleShareReport = async () => {
    try {
      const sessions = await getAllECGSessions();
      
      if (sessions.length === 0) {
        Alert.alert('No Data', 'There are no ECG sessions to share.');
        return;
      }

      Alert.alert(
        "Share Report",
        "Choose how you'd like to share your ECG report",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Export as PDF", 
            onPress: () => handleExportPDF()
          },
          { 
            text: "Export as CSV", 
            onPress: () => quickExportCSV(sessions)
          },
        ]
      );
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Share Failed', 'An error occurred while sharing the report.');
    }
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
                value={statistics.lastSessionTimestamp > 0 ? getTimeAgo(statistics.lastSessionTimestamp) : 'N/A'}
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
