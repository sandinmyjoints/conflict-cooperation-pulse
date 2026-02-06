// Data URL: fallback to local, can be overridden for R2
export const DATA_URL =
  import.meta.env.VITE_DATA_URL ?? "/pulse_data.json";

// Stale data threshold (48 hours)
export const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

// Sparkline dimensions
export const SPARKLINE_WIDTH = 150;
export const SPARKLINE_HEIGHT = 30;
export const SPARKLINE_WEEKS = 52;

// Goldstein scale range
export const GOLDSTEIN_MIN = -10;
export const GOLDSTEIN_MAX = 10;
