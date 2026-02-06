/**
 * Format a number with commas: 158420 → "158,420"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Format a Goldstein value with sign: -2.3 → "−2.3", 3.1 → "+3.1"
 */
export function formatGoldstein(value: number | null): string {
  if (value === null) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

/**
 * Format trend as arrow + value: -0.8 → "↓ 0.8", 1.2 → "↑ 1.2"
 */
export function formatTrend(trend: number | null): string {
  if (trend === null) return "—";
  const arrow = trend < 0 ? "↓" : trend > 0 ? "↑" : "→";
  return `${arrow} ${Math.abs(trend).toFixed(1)}`;
}

/**
 * Format ISO date string for display: "2024-01-15" → "Jan 15, 2024"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Relative time: "2 hours ago", "3 days ago"
 */
export function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
