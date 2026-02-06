import type { PairData } from "../types";
import { formatGoldstein, formatTrend } from "../utils/formatters";
import { badgeColor } from "../utils/colorScale";

interface DetailHeaderProps {
  pair: PairData;
}

export function DetailHeader({ pair }: DetailHeaderProps) {
  const trendDir =
    pair.trend === null ? "" : pair.trend < 0 ? "worsening" : pair.trend > 0 ? "improving" : "stable";

  return (
    <div className="detail-header">
      <h3 className="detail-header__title">{pair.label}</h3>
      <span
        className="detail-header__badge"
        style={{ backgroundColor: badgeColor(pair.recent_avg_goldstein) }}
      >
        avg: {formatGoldstein(pair.recent_avg_goldstein)}
      </span>
      <span className={`detail-header__trend ${pair.trend !== null && pair.trend < 0 ? "trend--neg" : "trend--pos"}`}>
        trend: {formatTrend(pair.trend)} {trendDir}
      </span>
    </div>
  );
}
