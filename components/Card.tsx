/**
 * Card Component
 * 
 * A reusable, accessible card component with consistent styling and variants.
 * Follows Material Design elevation principles and BEM-like structure.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/theme';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

// ===========================
// COMPONENT
// ===========================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  size = 'md',
  style,
  onPress,
  disabled = false,
  testID,
}) => {
  // Determine if card is pressable
  const isPressable = onPress && !disabled;

  // Get variant-specific styles
  const variantStyle = styles[`card--${variant}` as keyof typeof styles];
  const sizeStyle = styles[`card--${size}` as keyof typeof styles];

  // Combine all styles
  const baseCardStyles: ViewStyle[] = [
    styles.card,
    variantStyle,
    sizeStyle,
  ];
  
  if (disabled) {
    baseCardStyles.push(styles['card--disabled']);
  }
  
  if (style) {
    baseCardStyles.push(style);
  }

  // Render pressable or static card
  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => {
          const pressableStyles = [...baseCardStyles];
          if (pressed) {
            pressableStyles.push(styles['card--pressed']);
          }
          return pressableStyles;
        }}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={baseCardStyles} testID={testID}>
      {children}
    </View>
  );
};

// ===========================
// STYLES
// ===========================

const styles = StyleSheet.create({
  // Base card style
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  'card--elevated': {
    ...Shadows.md,
  },

  'card--outlined': {
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    ...Shadows.none,
  },

  'card--filled': {
    backgroundColor: Colors.neutral.gray100,
    ...Shadows.none,
  },

  // Sizes
  'card--sm': {
    padding: Spacing.sm,
  },

  'card--md': {
    padding: Spacing.base,
  },

  'card--lg': {
    padding: Spacing.xl,
  },

  // States
  'card--pressed': {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  'card--disabled': {
    opacity: 0.5,
  },
});

// ===========================
// EXPORT
// ===========================

export default Card;
