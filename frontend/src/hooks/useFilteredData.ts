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

  const applyFilters = useMemo(() => {
    return (pairs: PairData[]) => {
      let result = pairs;
      if (countryQuery) {
        result = filterByCountry(result, countryQuery);
      }
      if (timeRange) {
        result = result.map((p) => sliceWeekData(p, timeRange[0], timeRange[1]));
      }
      return result;
    };
  }, [countryQuery, timeRange]);

  const rankedConflictual = useMemo(() => {
    if (!data) return [];
    return applyFilters(getRankedPairs(data, "most_conflictual"));
  }, [data, applyFilters]);

  const rankedCooperative = useMemo(() => {
    if (!data) return [];
    return applyFilters(getRankedPairs(data, "most_cooperative"));
  }, [data, applyFilters]);

  const rankedShifts = useMemo(() => {
    if (!data) return [];
    return applyFilters(getRankedPairs(data, "biggest_shifts"));
  }, [data, applyFilters]);

  const filteredPairs = useMemo(() => {
    if (!data) return [];
    return applyFilters(data.pairs);
  }, [data, applyFilters]);

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
