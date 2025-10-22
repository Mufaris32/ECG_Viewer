/**
 * Design System & Theme Configuration
 * 
 * A comprehensive, centralized theme configuration following modern UI/UX principles.
 * This ensures consistency across the application and makes maintenance easier.
 */

// ===========================
// COLOR PALETTE
// ===========================

export const Colors = {
  // Primary Colors - Medical/Healthcare theme
  primary: {
    main: '#00A8E8',      // Vibrant blue - trust and professionalism
    light: '#33B9ED',     // Lighter shade for hover states
    dark: '#0087BE',      // Darker shade for active states
    gradient: ['#00A8E8', '#0087BE'], // For gradient backgrounds
  },
  
  // Secondary Colors
  secondary: {
    main: '#00E676',      // Medical green - ECG waveform color
    light: '#33EB8F',
    dark: '#00B85C',
  },
  
  // Accent Colors
  accent: {
    success: '#00E676',   // Green for positive indicators
    warning: '#FFB74D',   // Orange for warnings
    error: '#FF5252',     // Red for critical alerts
    info: '#64B5F6',      // Light blue for information
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },
  
  // Background Colors
  background: {
    primary: '#F8F9FA',   // Light background
    secondary: '#FFFFFF', // Card background
    dark: '#1A1A2E',      // Dark mode background
    darker: '#0F0F1E',    // Darker variant
  },
  
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    disabled: '#BDBDBD',
  },
  
  // Chart Colors
  chart: {
    ecgGreen: '#00E676',
    gridLine: 'rgba(255, 255, 255, 0.1)',
    background: '#000000',
    labelColor: 'rgba(0, 230, 118, 0.7)',
  },
};

// ===========================
// TYPOGRAPHY
// ===========================

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semiBold: 'System',
  },
  
  // Font Sizes - Following 8pt grid system
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ===========================
// SPACING
// ===========================

// Following 8pt grid system for consistent spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ===========================
// BORDER RADIUS
// ===========================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // For circular elements
};

// ===========================
// SHADOWS & ELEVATION
// ===========================

// Material Design elevation system
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Level 1 - Subtle elevation (buttons, cards)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Level 2 - Medium elevation (floating elements)
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Level 3 - High elevation (modals, dialogs)
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Level 4 - Maximum elevation (tooltips, popovers)
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Colored shadow for primary actions
  primary: {
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// ===========================
// LAYOUT
// ===========================

export const Layout = {
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Header heights
  header: {
    default: 60,
    compact: 48,
  },
  
  // Icon sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },
  
  // Button heights
  button: {
    sm: 32,
    md: 40,
    lg: 48,
  },
};

// ===========================
// ANIMATION & TRANSITIONS
// ===========================

export const Animation = {
  // Duration in milliseconds
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  // Easing functions (for CSS/web)
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// ===========================
// OPACITY LEVELS
// ===========================

export const Opacity = {
  disabled: 0.4,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
};

// ===========================
// BREAKPOINTS (for responsive design)
// ===========================

export const Breakpoints = {
  sm: 375,  // Small phones
  md: 768,  // Tablets
  lg: 1024, // Desktop
  xl: 1440, // Large desktop
};

// ===========================
// COMMON STYLES
// ===========================

export const CommonStyles = {
  // Flex utilities
  flexCenter: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  flexRow: {
    flexDirection: 'row' as const,
  },
  
  flexColumn: {
    flexDirection: 'column' as const,
  },
  
  flexBetween: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  
  // Card base styles
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.md,
  },
  
  // Container padding
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.base,
  },
};

// ===========================
// EXPORT ALL
// ===========================

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Animation,
  Opacity,
  Breakpoints,
  CommonStyles,
};
