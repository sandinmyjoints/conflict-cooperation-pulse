import type { PairData } from "../types";
import { Sparkline } from "./Sparkline";
import { formatGoldstein, formatTrend } from "../utils/formatters";
import { badgeColor } from "../utils/colorScale";

interface PairRowProps {
  pair: PairData;
  rank: number;
  showTrend?: boolean;
  onClick: (pair: PairData) => void;
  isSelected: boolean;
}

export function PairRow({ pair, rank, showTrend, onClick, isSelected }: PairRowProps) {
  const badgeBg = badgeColor(pair.recent_avg_goldstein);

  return (
    <div
      className={`pair-row${isSelected ? " pair-row--selected" : ""}`}
      onClick={() => onClick(pair)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(pair); }}
      role="button"
      tabIndex={0}
      aria-label={`${pair.label}, Goldstein ${formatGoldstein(pair.recent_avg_goldstein)}`}
    >
      <span className="pair-row__rank">{rank}.</span>
      <span className="pair-row__label">{pair.label}</span>
      {showTrend && pair.trend !== null && (
        <span className={`pair-row__trend ${pair.trend < 0 ? "trend--neg" : "trend--pos"}`}>
          {formatTrend(pair.trend)}
        </span>
      )}
      <Sparkline data={pair.data} />
      <span className="pair-row__badge" style={{ backgroundColor: badgeBg }}>
        {formatGoldstein(pair.recent_avg_goldstein)}
      </span>
    </div>
  );
}
