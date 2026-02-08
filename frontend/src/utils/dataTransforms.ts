import type { PairData, PulseData, WeekData } from "../types";
import { SPARKLINE_WEEKS } from "../config";

/**
 * Get a pair key like "USA-CHN" from a PairData object.
 */
export function pairKey(pair: PairData): string {
  return `${pair.actor1}-${pair.actor2}`;
}

/**
 * Look up a pair by its key ("USA-CHN") from the dataset.
 */
export function findPairByKey(
  data: PulseData,
  key: string
): PairData | undefined {
  return data.pairs.find((p) => pairKey(p) === key);
}

/**
 * Get the ordered list of PairData for a ranking category.
 */
export function getRankedPairs(
  data: PulseData,
  category: keyof PulseData["rankings"]
): PairData[] {
  const keys = data.rankings[category];
  return keys
    .map((k) => findPairByKey(data, k))
    .filter((p): p is PairData => p !== undefined);
}

/**
 * Filter pairs by country code (either actor matches).
 */
export function filterByCountry(
  pairs: PairData[],
  query: string
): PairData[] {
  if (!query) return pairs;
  const q = query.toLowerCase();
  return pairs.filter(
    (p) =>
      p.actor1.toLowerCase().includes(q) ||
      p.actor2.toLowerCase().includes(q) ||
      p.label.toLowerCase().includes(q)
  );
}

/**
 * Compute avg Goldstein from the last N weeks of data.
 */
function avgGoldstein(data: WeekData[], n: number): number | null {
  const recent = data.slice(-n);
  const vals = recent
    .map((d) => d.avg_goldstein)
    .filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

/**
 * Slice weekly data to a time range and recompute summary stats.
 */
export function sliceWeekData(
  pair: PairData,
  startWeek: string,
  endWeek: string
): PairData {
  const filtered = pair.data.filter(
    (d) => d.week >= startWeek && d.week <= endWeek
  );

  // Use last 12 weeks of the sliced range (or fewer if range is shorter)
  const recentN = Math.min(SPARKLINE_WEEKS / 4, Math.floor(filtered.length / 2)) || 1;
  const recentAvg = avgGoldstein(filtered, recentN);
  const priorAvg = avgGoldstein(filtered.slice(0, -recentN), recentN);

  const trend =
    recentAvg !== null && priorAvg !== null
      ? Math.round((recentAvg - priorAvg) * 100) / 100
      : null;

  const totalEvents = filtered.reduce((sum, d) => sum + d.total, 0);

  return {
    ...pair,
    data: filtered,
    recent_avg_goldstein: recentAvg !== null ? Math.round(recentAvg * 100) / 100 : null,
    trend,
    total_events: totalEvents,
  };
}
