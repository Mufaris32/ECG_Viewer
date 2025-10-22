import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView, StatusBar, Alert } from "react-native";
import { Card } from "../components";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface SettingItemProps {
  icon: string;
  title: string;
  description?: string;
  type: "switch" | "action";
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  type,
  value,
  onValueChange,
  onPress,
}) => {
  return (
    <Card
      style={styles.settingCard}
      onPress={type === "action" ? onPress : undefined}
    >
      <View style={styles.settingContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={Colors.primary.main} />
        </View>
        
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>

        {type === "switch" && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: Colors.neutral.gray300,
              true: Colors.primary.light,
            }}
            thumbColor={value ? Colors.primary.main : Colors.neutral.gray50}
          />
        )}

        {type === "action" && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.secondary}
          />
        )}
      </View>
    </Card>
  );
};

export default function Settings() {
  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [highAccuracyMode, setHighAccuracyMode] = useState(false);

  // Action handlers
  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all ECG recordings? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => Alert.alert("Data cleared (demo)"),
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      "Backup Data",
      "Your ECG data will be backed up securely to cloud storage.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Backup", onPress: () => Alert.alert("Backup started (demo)") },
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      "Restore Data",
      "Restore your ECG data from cloud backup.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Restore", onPress: () => Alert.alert("Restore started (demo)") },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About ECG Viewer",
      "Version 1.0.0\n\nA professional ECG monitoring and visualization application.\n\n© 2025 ECG Viewer Team",
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your ECG monitoring experience
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            description="Switch to dark theme for better visibility in low light"
            type="switch"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive alerts for ECG monitoring sessions"
            type="switch"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="volume-high"
            title="Sound Effects"
            description="Play sounds during ECG monitoring"
            type="switch"
            value={soundEffects}
            onValueChange={setSoundEffects}
          />
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <SettingItem
            icon="save"
            title="Auto-Save Sessions"
            description="Automatically save ECG sessions to history"
            type="switch"
            value={autoSave}
            onValueChange={setAutoSave}
          />
          <SettingItem
            icon="cloud-upload"
            title="Backup Data"
            description="Backup your ECG data to cloud storage"
            type="action"
            onPress={handleBackupData}
          />
          <SettingItem
            icon="cloud-download"
            title="Restore Data"
            description="Restore data from cloud backup"
            type="action"
            onPress={handleRestoreData}
          />
          <SettingItem
            icon="trash"
            title="Clear All Data"
            description="Permanently delete all recorded ECG sessions"
            type="action"
            onPress={handleClearData}
          />
        </View>

        {/* Monitoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoring</Text>
          <SettingItem
            icon="pulse"
            title="High Accuracy Mode"
            description="Enable for more precise ECG measurements (uses more battery)"
            type="switch"
            value={highAccuracyMode}
            onValueChange={setHighAccuracyMode}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information-circle"
            title="About ECG Viewer"
            description="Version and app information"
            type="action"
            onPress={handleAbout}
          />
        </View>

        {/* Footer Info */}
        <Card style={styles.footerCard} variant="filled">
          <View style={styles.footerContent}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary.main} />
            <Text style={styles.footerText}>
              Your ECG data is securely stored and encrypted on your device
            </Text>
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
    paddingHorizontal: Spacing.xs,
  },

  // Setting Item Styles
  settingCard: {
    marginBottom: Spacing.sm,
  },

  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },

  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.4,
  },

  // Footer Card
  footerCard: {
    marginTop: Spacing.base,
  },

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.5,
  },
});
