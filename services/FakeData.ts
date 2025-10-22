/**
 * Enhanced ECG Data Simulation Service
 * 
 * Generates realistic ECG waveform data that mimics actual cardiac electrical activity.
 * The waveform includes characteristic P, QRS, and T waves.
 */

let interval: ReturnType<typeof setInterval> | null = null;
let dataPoint = 0;

/**
 * Generates a realistic ECG waveform value based on the current data point.
 * Creates a periodic pattern that resembles actual ECG readings.
 * 
 * @param point - Current position in the waveform cycle
 * @returns ECG voltage value in millivolts
 */
function generateRealisticECGValue(point: number): number {
  // Complete cardiac cycle is ~100 data points (1 second at 100Hz sampling)
  const cycle = point % 100;
  
  let value = 0;
  
  // Baseline (isoelectric line with small noise)
  value = 0 + (Math.random() * 0.05 - 0.025);
  
  // P wave (atrial depolarization) - occurs around 10-20% of cycle
  if (cycle >= 10 && cycle <= 20) {
    const pPosition = (cycle - 10) / 10;
    value += 0.15 * Math.sin(pPosition * Math.PI);
  }
  
  // QRS complex (ventricular depolarization) - occurs around 30-45% of cycle
  // This is the most prominent feature of ECG
  if (cycle >= 30 && cycle <= 45) {
    const qrsPosition = (cycle - 30) / 15;
    
    // Q wave (small negative deflection)
    if (qrsPosition < 0.2) {
      value -= 0.1 * Math.sin(qrsPosition * 5 * Math.PI);
    }
    // R wave (large positive spike)
    else if (qrsPosition >= 0.2 && qrsPosition < 0.6) {
      const rPosition = (qrsPosition - 0.2) / 0.4;
      value += 1.2 * Math.sin(rPosition * Math.PI);
    }
    // S wave (negative deflection after R)
    else {
      const sPosition = (qrsPosition - 0.6) / 0.4;
      value -= 0.2 * Math.sin(sPosition * Math.PI);
    }
  }
  
  // T wave (ventricular repolarization) - occurs around 60-80% of cycle
  if (cycle >= 60 && cycle <= 80) {
    const tPosition = (cycle - 60) / 20;
    value += 0.25 * Math.sin(tPosition * Math.PI);
  }
  
  // Add subtle baseline wander (respiration artifact)
  const baselineWander = 0.03 * Math.sin(point * 0.01);
  value += baselineWander;
  
  return parseFloat(value.toFixed(3));
}

/**
 * Starts continuous ECG data simulation.
 * Generates data points at approximately 100Hz (10ms intervals).
 * 
 * @param callback - Function to call with each new ECG value
 */
export function startECGSimulation(callback: (value: number) => void) {
  // Clear any existing interval
  stopECGSimulation();
  
  // Reset data point counter
  dataPoint = 0;
  
  // Generate ECG data at 100Hz (10ms intervals)
  interval = setInterval(() => {
    const value = generateRealisticECGValue(dataPoint);
    callback(value);
    dataPoint++;
  }, 100);
}

/**
 * Stops the ECG data simulation.
 */
export function stopECGSimulation() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

/**
 * Generates a batch of ECG data points for static display or analysis.
 * 
 * @param count - Number of data points to generate
 * @returns Array of ECG values
 */
export function generateECGBatch(count: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    data.push(generateRealisticECGValue(i));
  }
  return data;
}
