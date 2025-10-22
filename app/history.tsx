import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, StatusBar } from "react-native";
import { Card, Badge } from "../components";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface HistoryRecord {
  id: number;
  date: string;
  time: string;
  heartRate: number;
  avgECG: number;
  status: "normal" | "elevated" | "low";
  duration: string;
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");

  // Generate dummy data with more details
  const dummyData: HistoryRecord[] = Array.from({ length: 15 }, (_, i) => {
    const hr = 60 + Math.floor(Math.random() * 40);
    return {
      id: i + 1,
      date: `2025-10-${String(i + 1).padStart(2, "0")}`,
      time: `${8 + i % 12}:${(i * 13) % 60} ${i % 2 === 0 ? "AM" : "PM"}`,
      heartRate: hr,
      avgECG: parseFloat((Math.random() * 2).toFixed(2)),
      status: hr > 85 ? "elevated" : hr < 65 ? "low" : "normal",
      duration: `${5 + (i % 10)} min`,
    };
  });

  // Filter data based on search query
  const filteredData = dummyData.filter(
    item =>
      item.date.includes(searchQuery) ||
      item.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.heartRate.toString().includes(searchQuery)
  );

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "elevated":
        return "warning" as const;
      case "low":
        return "error" as const;
      default:
        return "success" as const;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "elevated":
        return "arrow-up-circle";
      case "low":
        return "arrow-down-circle";
      default:
        return "checkmark-circle";
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ECG History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredData.length} {filteredData.length === 1 ? "record" : "records"} found
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date, time, or heart rate..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.text.secondary}
              style={styles.clearIcon}
              onPress={() => setSearchQuery("")}
            />
          )}
        </View>

        {/* History List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Card key={item.id} style={styles.historyCard} variant="elevated">
                <View style={styles.cardContent}>
                  {/* Left Section - Status Icon */}
                  <View style={styles.statusIconContainer}>
                    <Ionicons
                      name={getStatusIcon(item.status)}
                      size={32}
                      color={
                        item.status === "elevated"
                          ? Colors.accent.warning
                          : item.status === "low"
                          ? Colors.accent.error
                          : Colors.accent.success
                      }
                    />
                  </View>

                  {/* Middle Section - Details */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.dateTimeRow}>
                      <View style={styles.dateContainer}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={Colors.text.secondary}
                        />
                        <Text style={styles.dateText}>{item.date}</Text>
                      </View>
                      <View style={styles.timeContainer}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={Colors.text.secondary}
                        />
                        <Text style={styles.timeText}>{item.time}</Text>
                      </View>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metric}>
                        <Ionicons
                          name="heart"
                          size={16}
                          color={Colors.accent.error}
                        />
                        <Text style={styles.metricLabel}>HR:</Text>
                        <Text style={styles.metricValue}>{item.heartRate} bpm</Text>
                      </View>
                      <View style={styles.metric}>
                        <Ionicons
                          name="pulse"
                          size={16}
                          color={Colors.secondary.main}
                        />
                        <Text style={styles.metricLabel}>ECG:</Text>
                        <Text style={styles.metricValue}>{item.avgECG} mV</Text>
                      </View>
                      <View style={styles.metric}>
                        <Ionicons
                          name="timer-outline"
                          size={16}
                          color={Colors.primary.main}
                        />
                        <Text style={styles.metricValue}>{item.duration}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Right Section - Status Badge */}
                  <View style={styles.badgeContainer}>
                    <Badge
                      text={item.status}
                      variant={getStatusVariant(item.status)}
                      size="sm"
                    />
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="folder-open-outline"
                size={64}
                color={Colors.neutral.gray400}
              />
              <Text style={styles.emptyStateTitle}>No Records Found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search query or check back later
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.base,
  },

  // Header Styles
  header: {
    marginBottom: Spacing.lg,
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

  // Search Bar Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },

  clearIcon: {
    marginLeft: Spacing.sm,
  },

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  // History Card Styles
  historyCard: {
    marginBottom: Spacing.md,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },

  detailsContainer: {
    flex: 1,
  },

  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.md,
  },

  dateText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.md,
  },

  metricLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs / 2,
  },

  metricValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.primary,
  },

  badgeContainer: {
    marginLeft: Spacing.sm,
  },

  // Empty State Styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing['4xl'],
  },

  emptyStateTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },

  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing['2xl'],
  },
});
