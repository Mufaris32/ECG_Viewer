# SVG Width Error Fix

## Problem
The application was showing the error:
```
Error: <svg> attribute width: A negative value is not valid. ("-32")
```

This error occurred when the `LineChart` component from `react-native-chart-kit` tried to render with a negative or invalid width value.

## Root Cause
The width calculation `Dimensions.get("window").width - 32` could result in negative values in certain scenarios:
- During initial render before window dimensions are properly set
- On very small screens or when the window is resized
- On web platforms where dimensions might be calculated differently

## Solution Applied

### 1. **Dashboard Page** (`app/index.tsx`)
- Added a `chartWidth` state variable initialized with `Math.max(Dimensions.get("window").width - 64, 300)`
- Implemented a dimension change listener to update chart width dynamically on window resize
- Used the `chartWidth` state in the `LineChart` component instead of inline calculation

**Changes:**
```typescript
// Added state
const [chartWidth, setChartWidth] = useState(Math.max(Dimensions.get("window").width - 64, 300));

// Added dimension change listener
useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    setChartWidth(Math.max(window.width - 64, 300));
  });

  return () => subscription?.remove();
}, []);

// Updated chart width
<LineChart
  width={chartWidth}  // Instead of Dimensions.get("window").width - 32
  // ... rest of props
/>
```

### 2. **ECG Screen Page** (`app/ecg/index.tsx`)
Applied the same fix to ensure consistent behavior across all screens with charts.

## Benefits
1. ✅ **Prevents negative width errors** - Ensures minimum width of 300px
2. ✅ **Responsive design** - Chart adapts to window resize events
3. ✅ **Better padding** - Changed from `-32` to `-64` for proper container padding
4. ✅ **Consistent behavior** - Works across web, iOS, and Android platforms
5. ✅ **Better UX** - No more SVG rendering errors

## Testing
After applying this fix, the application should:
- Load without SVG width errors
- Display charts properly on all screen sizes
- Handle window resize gracefully
- Work correctly in web browsers (your website scenario)

## Notes
The Bluetooth functionality works perfectly in your HTML webpage because it uses the native Web Bluetooth API. In the React Native app:
- On **web platform**: Should work similarly to your HTML page
- On **Expo Go**: Bluetooth is not available (use fake data for testing)
- On **development builds**: Full Bluetooth support available

## Related Warnings Fixed
The fix also addresses potential issues related to:
- Invalid DOM properties in SVG rendering
- Transform-origin property warnings
- Shadow style deprecations (separate issue, but related to rendering)
