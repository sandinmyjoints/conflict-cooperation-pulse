import { useMemo, useState } from "react";
import type { PairData, PulseData } from "../types";
import { filterByCountry, getRankedPairs, sliceWeekData } from "../utils/dataTransforms";

interface UseFilteredDataResult {
  countryQuery: string;
  setCountryQuery: (q: string) => void;
  timeRange: [string, string] | null;
  setTimeRange: (range: [string, string] | null) => void;
  rankedConflictual: PairData[];
  rankedCooperative: PairData[];
  rankedShifts: PairData[];
  filteredPairs: PairData[];
}

export function useFilteredData(data: PulseData | null): UseFilteredDataResult {
  const [countryQuery, setCountryQuery] = useState("");
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);

  const rankedConflictual = useMemo(
    () => (data ? getRankedPairs(data, "most_conflictual") : []),
    [data]
  );
  const rankedCooperative = useMemo(
    () => (data ? getRankedPairs(data, "most_cooperative") : []),
    [data]
  );
  const rankedShifts = useMemo(
    () => (data ? getRankedPairs(data, "biggest_shifts") : []),
    [data]
  );

  const filteredPairs = useMemo(() => {
    if (!data) return [];
    let pairs = data.pairs;
    if (countryQuery) {
      pairs = filterByCountry(pairs, countryQuery);
    }
    if (timeRange) {
      pairs = pairs.map((p) => sliceWeekData(p, timeRange[0], timeRange[1]));
    }
    return pairs;
  }, [data, countryQuery, timeRange]);

  return {
    countryQuery,
    setCountryQuery,
    timeRange,
    setTimeRange,
    rankedConflictual,
    rankedCooperative,
    rankedShifts,
    filteredPairs,
  };
}
