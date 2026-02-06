import type { PairData } from "../types";
import { DetailHeader } from "./DetailHeader";
import { AreaChart } from "./AreaChart";
import { StatCards } from "./StatCards";

interface DetailViewProps {
  pair: PairData;
  onClose: () => void;
}

export function DetailView({ pair, onClose }: DetailViewProps) {
  return (
    <section className="detail-view" aria-label={`Detail view for ${pair.label}`}>
      <button className="detail-view__close" onClick={onClose} aria-label="Close detail view">
        &times;
      </button>
      <DetailHeader pair={pair} />
      <AreaChart data={pair.data} />
      <div className="detail-view__legend">
        <span className="legend-item legend-item--coop">Cooperative events</span>
        <span className="legend-item legend-item--conf">Conflictual events</span>
        <span className="legend-item legend-item--goldstein">Goldstein trend (4wk avg)</span>
      </div>
      <StatCards pair={pair} />
    </section>
  );
}
