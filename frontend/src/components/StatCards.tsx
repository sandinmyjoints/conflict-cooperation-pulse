import type { PairData } from "../types";
import { formatNumber, formatGoldstein, formatDate } from "../utils/formatters";

interface StatCardsProps {
  pair: PairData;
}

export function StatCards({ pair }: StatCardsProps) {
  // Find peak conflict and cooperation weeks
  const withData = pair.data.filter((d) => d.total > 0);
  const peakConflict = withData.length
    ? withData.reduce((a, b) => (a.conf > b.conf ? a : b))
    : null;
  const peakCoop = withData.length
    ? withData.reduce((a, b) => (a.coop > b.coop ? a : b))
    : null;

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <div className="stat-card__value">{formatNumber(pair.total_events)}</div>
        <div className="stat-card__label">Total Events</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__value">{formatGoldstein(pair.recent_avg_goldstein)}</div>
        <div className="stat-card__label">Avg Goldstein (12wk)</div>
      </div>
      {peakConflict && (
        <div className="stat-card">
          <div className="stat-card__value">{peakConflict.conf} events</div>
          <div className="stat-card__label">Peak Conflict: {formatDate(peakConflict.week)}</div>
        </div>
      )}
      {peakCoop && (
        <div className="stat-card">
          <div className="stat-card__value">{peakCoop.coop} events</div>
          <div className="stat-card__label">Peak Cooperation: {formatDate(peakCoop.week)}</div>
        </div>
      )}
    </div>
  );
}
