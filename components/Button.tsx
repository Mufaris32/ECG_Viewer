/**
 * Button Component
 * 
 * A modern, accessible button component with multiple variants and sizes.
 * Includes loading states, icons, and smooth press animations.
 */

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Spacing, Layout } from '../constants/theme';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// ===========================
// COMPONENT
// ===========================

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  // Build button styles array
  const buttonStyles: ViewStyle[] = [styles.button];
  
  // Add variant style
  if (variant === 'primary') buttonStyles.push(styles['button--primary']);
  else if (variant === 'secondary') buttonStyles.push(styles['button--secondary']);
  else if (variant === 'outline') buttonStyles.push(styles['button--outline']);
  else if (variant === 'ghost') buttonStyles.push(styles['button--ghost']);
  else if (variant === 'danger') buttonStyles.push(styles['button--danger']);
  
  // Add size style
  if (size === 'sm') buttonStyles.push(styles['button--sm']);
  else if (size === 'md') buttonStyles.push(styles['button--md']);
  else if (size === 'lg') buttonStyles.push(styles['button--lg']);
  
  if (fullWidth) {
    buttonStyles.push(styles['button--fullWidth']);
  }
  
  if (isDisabled) {
    buttonStyles.push(styles['button--disabled']);
  }
  
  if (style) {
    buttonStyles.push(style);
  }

  // Build text styles array
  const textStyles: any[] = [styles.buttonText];
  
  // Add variant text style
  if (variant === 'primary') textStyles.push(styles['buttonText--primary']);
  else if (variant === 'secondary') textStyles.push(styles['buttonText--secondary']);
  else if (variant === 'outline') textStyles.push(styles['buttonText--outline']);
  else if (variant === 'ghost') textStyles.push(styles['buttonText--ghost']);
  else if (variant === 'danger') textStyles.push(styles['buttonText--danger']);
  
  // Add size text style
  if (size === 'sm') textStyles.push(styles['buttonText--sm']);
  else if (size === 'md') textStyles.push(styles['buttonText--md']);
  else if (size === 'lg') textStyles.push(styles['buttonText--lg']);
  
  if (icon) {
    textStyles.push({ marginLeft: Spacing.sm });
  }
  
  if (textStyle) {
    textStyles.push(textStyle);
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => {
        const pressStyles = [...buttonStyles];
        if (pressed && !isDisabled) {
          pressStyles.push(styles['button--pressed']);
        }
        return pressStyles;
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.neutral.white : Colors.primary.main}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

// ===========================
// STYLES
// ===========================

const styles = StyleSheet.create({
  // Base button style
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    minWidth: 80,
    ...Shadows.sm,
  },

  // Variants
  'button--primary': {
    backgroundColor: Colors.primary.main,
    ...Shadows.primary,
  },

  'button--secondary': {
    backgroundColor: Colors.secondary.main,
  },

  'button--outline': {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    ...Shadows.none,
  },

  'button--ghost': {
    backgroundColor: 'transparent',
    ...Shadows.none,
  },

  'button--danger': {
    backgroundColor: Colors.accent.error,
  },

  // Sizes
  'button--sm': {
    height: Layout.button.sm,
    paddingHorizontal: Spacing.md,
  },

  'button--md': {
    height: Layout.button.md,
    paddingHorizontal: Spacing.base,
  },

  'button--lg': {
    height: Layout.button.lg,
    paddingHorizontal: Spacing.lg,
  },

  // Width
  'button--fullWidth': {
    width: '100%',
  },

  // States
  'button--pressed': {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  'button--disabled': {
    opacity: 0.5,
  },

  // Text styles
  buttonText: {
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  'buttonText--primary': {
    color: Colors.neutral.white,
  },

  'buttonText--secondary': {
    color: Colors.neutral.white,
  },

  'buttonText--outline': {
    color: Colors.primary.main,
  },

  'buttonText--ghost': {
    color: Colors.primary.main,
  },

  'buttonText--danger': {
    color: Colors.neutral.white,
  },

  'buttonText--sm': {
    fontSize: Typography.fontSize.sm,
  },

  'buttonText--md': {
    fontSize: Typography.fontSize.base,
  },

  'buttonText--lg': {
    fontSize: Typography.fontSize.lg,
  },
});

// ===========================
// EXPORT
// ===========================

export default Button;
