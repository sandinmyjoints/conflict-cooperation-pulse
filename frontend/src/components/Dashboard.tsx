import type { PairData } from "../types";
import { RankedList } from "./RankedList";

interface DashboardProps {
  conflictual: PairData[];
  shifts: PairData[];
  cooperative: PairData[];
  onSelect: (pair: PairData) => void;
  selectedKey: string | null;
}

export function Dashboard({ conflictual, shifts, cooperative, onSelect, selectedKey }: DashboardProps) {
  return (
    <div className="dashboard">
      <RankedList
        title="Most Conflictual"
        pairs={conflictual}
        onSelect={onSelect}
        selectedKey={selectedKey}
      />
      <RankedList
        title="Biggest Shifts"
        pairs={shifts}
        showTrend
        onSelect={onSelect}
        selectedKey={selectedKey}
      />
      <RankedList
        title="Most Cooperative"
        pairs={cooperative}
        onSelect={onSelect}
        selectedKey={selectedKey}
      />
    </div>
  );
}
