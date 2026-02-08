import { useMemo, useState } from "react";
import type { PairData } from "./types";
import { useEventData } from "./hooks/useEventData";
import { useFilteredData } from "./hooks/useFilteredData";
import { pairKey } from "./utils/dataTransforms";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { FilterBar } from "./components/FilterBar";
import { DetailView } from "./components/DetailView";
import { ColorLegend } from "./components/ColorLegend";
import { LoadingState } from "./components/LoadingState";

export default function App() {
  const { data, loading, error, isStale } = useEventData();
  const {
    countryQuery,
    setCountryQuery,
    timeRange,
    setTimeRange,
    rankedConflictual,
    rankedCooperative,
    rankedShifts,
    filteredPairs,
  } = useFilteredData(data);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Derive the selected pair from filteredPairs so it reacts to filter changes
  const selectedPair = useMemo(() => {
    if (!selectedKey) return null;
    return filteredPairs.find((p) => pairKey(p) === selectedKey) ?? null;
  }, [selectedKey, filteredPairs]);

  if (loading || error) {
    return <LoadingState error={error} />;
  }

  if (!data) return null;

  const handleSelect = (pair: PairData) => {
    const key = pairKey(pair);
    setSelectedKey(selectedKey === key ? null : key);
  };

  return (
    <div className="app">
      <Header generatedAt={data.generated_at} isStale={isStale} />
      <ColorLegend />
      <Dashboard
        conflictual={rankedConflictual}
        shifts={rankedShifts}
        cooperative={rankedCooperative}
        onSelect={handleSelect}
        selectedKey={selectedKey}
      />
      <FilterBar
        countryQuery={countryQuery}
        onCountryChange={setCountryQuery}
        weeks={data.weeks}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      {selectedPair && (
        <DetailView pair={selectedPair} onClose={() => setSelectedKey(null)} />
      )}
    </div>
  );
}
