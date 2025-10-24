import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card } from "../components";
import { BorderRadius, Colors, Shadows, Spacing, Typography } from "../constants/theme";
import { deleteECGSession, ECGSession, getAllECGSessions, searchECGSessions } from "../services/StorageService";

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<ECGSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ECGSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load ECG sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Filter sessions when search query changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery, sessions]);

  // Load all sessions from storage
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const allSessions = await getAllECGSessions();
      setSessions(allSessions);
      setFilteredSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load ECG history');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSessions();
    setIsRefreshing(false);
  };

  // Search sessions
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredSessions(sessions);
    } else {
      const results = await searchECGSessions(searchQuery);
      setFilteredSessions(results);
    }
  };

  // Delete a session
  const handleDeleteSession = (id: string, date: string, time: string) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete the session from ${date} at ${time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteECGSession(id);
            if (success) {
              Alert.alert('Success', 'Session deleted successfully');
              await loadSessions();
            } else {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

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
            {filteredSessions.length} {filteredSessions.length === 1 ? "record" : "records"} found
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
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Colors.primary.main]} />
          }
        >
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Loading...</Text>
            </View>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((item) => (
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
