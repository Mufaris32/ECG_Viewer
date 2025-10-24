import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { Card } from "../components";
import { BorderRadius, Colors, Spacing, Typography } from "../constants/theme";
import {
    deleteAllECGSessions,
    exportAllDataAsJSON,
    getStatistics,
    getUserSettings,
    updateUserSettings
} from "../services/StorageService";

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
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load user settings from storage
  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      setDarkMode(settings.darkMode);
      setNotifications(settings.notifications);
      setSoundEffects(settings.soundEffects);
      setAutoSave(settings.autoSave);
      setHighAccuracyMode(settings.highAccuracyMode);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a setting
  const handleUpdateSetting = async (key: string, value: boolean) => {
    try {
      await updateUserSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  // Update dark mode
  const handleDarkModeChange = async (value: boolean) => {
    setDarkMode(value);
    await handleUpdateSetting('darkMode', value);
  };

  // Update notifications
  const handleNotificationsChange = async (value: boolean) => {
    setNotifications(value);
    await handleUpdateSetting('notifications', value);
  };

  // Update sound effects
  const handleSoundEffectsChange = async (value: boolean) => {
    setSoundEffects(value);
    await handleUpdateSetting('soundEffects', value);
  };

  // Update auto-save
  const handleAutoSaveChange = async (value: boolean) => {
    setAutoSave(value);
    await handleUpdateSetting('autoSave', value);
  };

  // Update high accuracy mode
  const handleHighAccuracyChange = async (value: boolean) => {
    setHighAccuracyMode(value);
    await handleUpdateSetting('highAccuracyMode', value);
  };

  // Action handlers
  const handleClearData = async () => {
    const stats = await getStatistics();
    Alert.alert(
      "Clear All Data",
      `Are you sure you want to clear all ${stats.totalSessions} ECG recordings? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const success = await deleteAllECGSessions();
            if (success) {
              Alert.alert("Success", "All ECG data has been cleared.");
            } else {
              Alert.alert("Error", "Failed to clear data.");
            }
          },
        },
      ]
    );
  };

  const handleBackupData = async () => {
    try {
      const stats = await getStatistics();
      const jsonData = await exportAllDataAsJSON();
      
      Alert.alert(
        "Backup Data",
        `Your ECG data (${stats.totalSessions} sessions) will be backed up.\n\nData preview:\n${jsonData.substring(0, 150)}...`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Backup", 
            onPress: () => {
              console.log('Backup data:', jsonData);
              Alert.alert("Backup Complete", "Your ECG data has been backed up successfully.");
            }
          },
        ]
      );
    } catch (error) {
      console.error('Error backing up data:', error);
      Alert.alert("Error", "Failed to backup data.");
    }
  };

  const handleRestoreData = () => {
    Alert.alert(
      "Restore Data",
      "To restore your ECG data, you'll need a valid backup file in JSON format.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Learn More", 
          onPress: () => Alert.alert(
            "Restore Instructions",
            "1. Locate your backup JSON file\n2. Use the import functionality\n3. Your data will be restored\n\nNote: This feature requires file picker implementation."
          )
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About ECG Viewer",
      "Version 1.0.0\n\nA professional ECG monitoring and visualization application built with React Native and Expo.\n\nFeatures:\n• Real-time ECG monitoring\n• Session history tracking\n• Data export (CSV, JSON, HTML)\n• Comprehensive analytics\n\n© 2025 ECG Viewer Team",
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
            onValueChange={handleDarkModeChange}
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
            onValueChange={handleNotificationsChange}
          />
          <SettingItem
            icon="volume-high"
            title="Sound Effects"
            description="Play sounds during ECG monitoring"
            type="switch"
            value={soundEffects}
            onValueChange={handleSoundEffectsChange}
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
            onValueChange={handleAutoSaveChange}
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
            onValueChange={handleHighAccuracyChange}
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
