import { Stack } from "expo-router";
import React, { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    // Suppress specific development warnings from third-party libraries
    // These are harmless warnings that won't appear in production
    if (__DEV__) {
      const originalWarn = console.warn;
      const originalError = console.error;

      // List of warning patterns to suppress (from third-party libraries)
      const suppressedWarnings = [
        'transform-origin',
        'transformOrigin', 
        'shadow*',
        'boxShadow',
        'pointerEvents',
      ];

      // List of error patterns to suppress (harmless DOM property warnings)
      const suppressedErrors = [
        'Invalid DOM property `transform-origin`',
        'Invalid DOM property `pointerEvents`',
      ];

      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (!suppressedWarnings.some(pattern => message.includes(pattern))) {
          originalWarn.apply(console, args);
        }
      };

      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (!suppressedErrors.some(pattern => message.includes(pattern))) {
          originalError.apply(console, args);
        }
      };

      // Cleanup: restore original console methods
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

  return <Stack initialRouteName="index" screenOptions={{ headerShown: true }} />;
}
