import { interpolateRdBu } from "d3";
import { GOLDSTEIN_MIN, GOLDSTEIN_MAX } from "../config";

/**
 * Map a Goldstein value [-10, +10] to a color.
 * Red = conflict (negative), Blue = cooperation (positive).
 * d3.interpolateRdBu goes red→white→blue over [0, 1].
 */
export function goldsteinColor(value: number): string {
  const t = (value - GOLDSTEIN_MIN) / (GOLDSTEIN_MAX - GOLDSTEIN_MIN);
  return interpolateRdBu(t);
}

/**
 * Color for a badge based on Goldstein average.
 */
export function badgeColor(value: number | null): string {
  if (value === null) return "#999";
  return goldsteinColor(value);
}
