/**
 * Badge Component
 * 
 * A small, reusable component for displaying status indicators, labels, or counts.
 * Supports multiple variants and sizes.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ===========================
// COMPONENT
// ===========================

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
}) => {
  // Build badge styles
  const badgeStyles: ViewStyle[] = [styles.badge];
  
  // Add variant style
  if (variant === 'primary') badgeStyles.push(styles['badge--primary']);
  else if (variant === 'secondary') badgeStyles.push(styles['badge--secondary']);
  else if (variant === 'success') badgeStyles.push(styles['badge--success']);
  else if (variant === 'warning') badgeStyles.push(styles['badge--warning']);
  else if (variant === 'error') badgeStyles.push(styles['badge--error']);
  else if (variant === 'neutral') badgeStyles.push(styles['badge--neutral']);
  
  // Add size style
  if (size === 'sm') badgeStyles.push(styles['badge--sm']);
  else if (size === 'md') badgeStyles.push(styles['badge--md']);
  else if (size === 'lg') badgeStyles.push(styles['badge--lg']);
  
  if (style) {
    badgeStyles.push(style);
  }

  // Build text styles
  const textStyles: TextStyle[] = [styles.badgeText];
  
  // Add variant text style
  if (variant === 'primary') textStyles.push(styles['badgeText--primary']);
  else if (variant === 'secondary') textStyles.push(styles['badgeText--secondary']);
  else if (variant === 'success') textStyles.push(styles['badgeText--success']);
  else if (variant === 'warning') textStyles.push(styles['badgeText--warning']);
  else if (variant === 'error') textStyles.push(styles['badgeText--error']);
  else if (variant === 'neutral') textStyles.push(styles['badgeText--neutral']);
  
  // Add size text style
  if (size === 'sm') textStyles.push(styles['badgeText--sm']);
  else if (size === 'md') textStyles.push(styles['badgeText--md']);
  else if (size === 'lg') textStyles.push(styles['badgeText--lg']);
  
  if (textStyle) {
    textStyles.push(textStyle);
  }

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{text}</Text>
    </View>
  );
};

// ===========================
// STYLES
// ===========================

const styles = StyleSheet.create({
  // Base badge style
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  // Variants
  'badge--primary': {
    backgroundColor: Colors.primary.main,
  },

  'badge--secondary': {
    backgroundColor: Colors.secondary.main,
  },

  'badge--success': {
    backgroundColor: Colors.accent.success,
  },

  'badge--warning': {
    backgroundColor: Colors.accent.warning,
  },

  'badge--error': {
    backgroundColor: Colors.accent.error,
  },

  'badge--neutral': {
    backgroundColor: Colors.neutral.gray300,
  },

  // Sizes
  'badge--sm': {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },

  'badge--md': {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  'badge--lg': {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },

  // Text styles
  badgeText: {
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  'badgeText--primary': {
    color: Colors.neutral.white,
  },

  'badgeText--secondary': {
    color: Colors.neutral.white,
  },

  'badgeText--success': {
    color: Colors.neutral.white,
  },

  'badgeText--warning': {
    color: Colors.neutral.white,
  },

  'badgeText--error': {
    color: Colors.neutral.white,
  },

  'badgeText--neutral': {
    color: Colors.text.primary,
  },

  'badgeText--sm': {
    fontSize: Typography.fontSize.xs,
  },

  'badgeText--md': {
    fontSize: Typography.fontSize.sm,
  },

  'badgeText--lg': {
    fontSize: Typography.fontSize.base,
  },
});

// ===========================
// EXPORT
// ===========================

export default Badge;
