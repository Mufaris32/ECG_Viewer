import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StorageService - Handles all data persistence for ECG records
 * Manages CRUD operations for ECG sessions, settings, and user preferences
 */

// ===========================
// TYPES & INTERFACES
// ===========================

export interface ECGSession {
  id: string;
  date: string;
  time: string;
  heartRate: number;
  avgECG: number;
  minECG: number;
  maxECG: number;
  status: 'normal' | 'elevated' | 'low';
  duration: string;
  durationSeconds: number;
  ecgData: number[]; // Array of ECG readings
  timestamp: number;
  notes?: string;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  autoSave: boolean;
  highAccuracyMode: boolean;
}

export interface AppStatistics {
  totalSessions: number;
  avgHeartRate: number;
  avgDuration: string;
  lastSessionTimestamp: number;
  normalReadings: number;
  elevatedReadings: number;
  lowReadings: number;
}

// ===========================
// STORAGE KEYS
// ===========================

const STORAGE_KEYS = {
  ECG_SESSIONS: '@ecg_viewer:sessions',
  USER_SETTINGS: '@ecg_viewer:settings',
  APP_STATISTICS: '@ecg_viewer:statistics',
};

// ===========================
// DEFAULT VALUES
// ===========================

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  notifications: true,
  soundEffects: true,
  autoSave: true,
  highAccuracyMode: false,
};

// ===========================
// ECG SESSION OPERATIONS
// ===========================

/**
 * Save a new ECG session
 */
export const saveECGSession = async (session: Omit<ECGSession, 'id' | 'timestamp'>): Promise<ECGSession> => {
  try {
    // Generate unique ID and timestamp
    const newSession: ECGSession = {
      ...session,
      id: `ecg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Get existing sessions
    const sessions = await getAllECGSessions();
    
    // Add new session at the beginning (most recent first)
    sessions.unshift(newSession);
    
    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.ECG_SESSIONS, JSON.stringify(sessions));
    
    // Update statistics
    await updateStatistics();
    
    return newSession;
  } catch (error) {
    console.error('Error saving ECG session:', error);
    throw error;
  }
};

/**
 * Get all ECG sessions (sorted by most recent first)
 */
export const getAllECGSessions = async (): Promise<ECGSession[]> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.ECG_SESSIONS);
    if (!sessionsJson) return [];
    
    const sessions: ECGSession[] = JSON.parse(sessionsJson);
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting ECG sessions:', error);
    return [];
  }
};

/**
 * Get a single ECG session by ID
 */
export const getECGSessionById = async (id: string): Promise<ECGSession | null> => {
  try {
    const sessions = await getAllECGSessions();
    return sessions.find(session => session.id === id) || null;
  } catch (error) {
    console.error('Error getting ECG session by ID:', error);
    return null;
  }
};

/**
 * Delete an ECG session
 */
export const deleteECGSession = async (id: string): Promise<boolean> => {
  try {
    const sessions = await getAllECGSessions();
    const filteredSessions = sessions.filter(session => session.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.ECG_SESSIONS, JSON.stringify(filteredSessions));
    
    // Update statistics
    await updateStatistics();
    
    return true;
  } catch (error) {
    console.error('Error deleting ECG session:', error);
    return false;
  }
};

/**
 * Delete all ECG sessions
 */
export const deleteAllECGSessions = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ECG_SESSIONS, JSON.stringify([]));
    await resetStatistics();
    return true;
  } catch (error) {
    console.error('Error deleting all ECG sessions:', error);
    return false;
  }
};

/**
 * Search ECG sessions by query
 */
export const searchECGSessions = async (query: string): Promise<ECGSession[]> => {
  try {
    const sessions = await getAllECGSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.date.toLowerCase().includes(lowerQuery) ||
      session.time.toLowerCase().includes(lowerQuery) ||
      session.heartRate.toString().includes(lowerQuery) ||
      session.status.toLowerCase().includes(lowerQuery) ||
      (session.notes && session.notes.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching ECG sessions:', error);
    return [];
  }
};

// ===========================
// USER SETTINGS OPERATIONS
// ===========================

/**
 * Get user settings
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!settingsJson) return DEFAULT_SETTINGS;
    
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error getting user settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const currentSettings = await getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

/**
 * Reset user settings to defaults
 */
export const resetUserSettings = async (): Promise<UserSettings> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error resetting user settings:', error);
    throw error;
  }
};

// ===========================
// STATISTICS OPERATIONS
// ===========================

/**
 * Get app statistics
 */
export const getStatistics = async (): Promise<AppStatistics> => {
  try {
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATISTICS);
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    
    // If no statistics exist, calculate them
    return await calculateStatistics();
  } catch (error) {
    console.error('Error getting statistics:', error);
    return {
      totalSessions: 0,
      avgHeartRate: 0,
      avgDuration: '0 min',
      lastSessionTimestamp: 0,
      normalReadings: 0,
      elevatedReadings: 0,
      lowReadings: 0,
    };
  }
};

/**
 * Calculate statistics from all sessions
 */
const calculateStatistics = async (): Promise<AppStatistics> => {
  try {
    const sessions = await getAllECGSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgHeartRate: 0,
        avgDuration: '0 min',
        lastSessionTimestamp: 0,
        normalReadings: 0,
        elevatedReadings: 0,
        lowReadings: 0,
      };
    }
    
    // Calculate averages
    const totalHeartRate = sessions.reduce((sum, session) => sum + session.heartRate, 0);
    const avgHeartRate = Math.round(totalHeartRate / sessions.length);
    
    const totalDurationSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
    const avgDurationSeconds = totalDurationSeconds / sessions.length;
    const avgDuration = formatDuration(avgDurationSeconds);
    
    // Count status types
    const normalReadings = sessions.filter(s => s.status === 'normal').length;
    const elevatedReadings = sessions.filter(s => s.status === 'elevated').length;
    const lowReadings = sessions.filter(s => s.status === 'low').length;
    
    const statistics: AppStatistics = {
      totalSessions: sessions.length,
      avgHeartRate,
      avgDuration,
      lastSessionTimestamp: sessions[0].timestamp,
      normalReadings,
      elevatedReadings,
      lowReadings,
    };
    
    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.APP_STATISTICS, JSON.stringify(statistics));
    
    return statistics;
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
};

/**
 * Update statistics (called after adding/deleting sessions)
 */
const updateStatistics = async (): Promise<void> => {
  await calculateStatistics();
};

/**
 * Reset statistics
 */
const resetStatistics = async (): Promise<void> => {
  const emptyStats: AppStatistics = {
    totalSessions: 0,
    avgHeartRate: 0,
    avgDuration: '0 min',
    lastSessionTimestamp: 0,
    normalReadings: 0,
    elevatedReadings: 0,
    lowReadings: 0,
  };
  
  await AsyncStorage.setItem(STORAGE_KEYS.APP_STATISTICS, JSON.stringify(emptyStats));
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Format duration from seconds to human-readable string
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds} sec`;
  } else if (remainingSeconds === 0) {
    return `${minutes} min`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
};

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

/**
 * Clear all app data (sessions, settings, statistics)
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ECG_SESSIONS,
      STORAGE_KEYS.USER_SETTINGS,
      STORAGE_KEYS.APP_STATISTICS,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Export all data as JSON (for backup)
 */
export const exportAllDataAsJSON = async (): Promise<string> => {
  try {
    const sessions = await getAllECGSessions();
    const settings = await getUserSettings();
    const statistics = await getStatistics();
    
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      sessions,
      settings,
      statistics,
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Import data from JSON (for restore)
 */
export const importDataFromJSON = async (jsonString: string): Promise<boolean> => {
  try {
    const importData = JSON.parse(jsonString);
    
    if (importData.sessions) {
      await AsyncStorage.setItem(STORAGE_KEYS.ECG_SESSIONS, JSON.stringify(importData.sessions));
    }
    
    if (importData.settings) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(importData.settings));
    }
    
    if (importData.statistics) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_STATISTICS, JSON.stringify(importData.statistics));
    } else {
      await updateStatistics();
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
