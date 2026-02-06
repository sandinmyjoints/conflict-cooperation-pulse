import type { PairData, PulseData } from "../types";

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
 * Slice weekly data to a time range [startWeek, endWeek] (inclusive).
 */
export function sliceWeekData(
  pair: PairData,
  startWeek: string,
  endWeek: string
): PairData {
  const filtered = pair.data.filter(
    (d) => d.week >= startWeek && d.week <= endWeek
  );
  return { ...pair, data: filtered };
}
