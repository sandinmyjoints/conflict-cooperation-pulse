import type { PairData } from "../types";
import { PairRow } from "./PairRow";

interface RankedListProps {
  title: string;
  pairs: PairData[];
  showTrend?: boolean;
  onSelect: (pair: PairData) => void;
  selectedKey: string | null;
}

export function RankedList({ title, pairs, showTrend, onSelect, selectedKey }: RankedListProps) {
  return (
    <section className="ranked-list">
      <h2 className="ranked-list__title">{title}</h2>
      <div className="ranked-list__items" role="list">
        {pairs.map((pair, i) => (
          <PairRow
            key={`${pair.actor1}-${pair.actor2}`}
            pair={pair}
            rank={i + 1}
            showTrend={showTrend}
            onClick={onSelect}
            isSelected={selectedKey === `${pair.actor1}-${pair.actor2}`}
          />
        ))}
      </div>
    </section>
  );
}
