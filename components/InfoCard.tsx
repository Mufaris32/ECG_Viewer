/**
 * InfoCard Component
 * 
 * A specialized card component for displaying key metrics and statistics.
 * Features an icon, title, value, and optional trend indicator.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface InfoCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  onPress?: () => void;
}

// ===========================
// COMPONENT
// ===========================

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  variant = 'default',
  style,
  onPress,
}) => {
  // Get variant color
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.primary.main;
      case 'success':
        return Colors.accent.success;
      case 'warning':
        return Colors.accent.warning;
      case 'error':
        return Colors.accent.error;
      default:
        return Colors.text.primary;
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  };

  // Get trend color
  const getTrendColor = () => {
    if (trend === 'up') return Colors.accent.success;
    if (trend === 'down') return Colors.accent.error;
    return Colors.text.secondary;
  };

  const combinedStyle = style ? { ...styles.card, ...(style as any) } : styles.card;

  return (
    <Card size="md" style={combinedStyle} onPress={onPress}>
      <View style={styles.container}>
        {/* Icon Section */}
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: getVariantColor() }]}>
              {value}
            </Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>

          {/* Trend Indicator */}
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Text style={[styles.trendIcon, { color: getTrendColor() }]}>
                {getTrendIcon()}
              </Text>
              <Text style={[styles.trendValue, { color: getTrendColor() }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

// ===========================
// STYLES
// ===========================

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },

  value: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize['3xl'] * 1.2,
  },

  unit: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendIcon: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginRight: Spacing.xs / 2,
  },

  trendValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});

// ===========================
// EXPORT
// ===========================

export default InfoCard;
