import { CountrySearch } from "./CountrySearch";
import { TimeRangeSlider } from "./TimeRangeSlider";

interface FilterBarProps {
  countryQuery: string;
  onCountryChange: (q: string) => void;
  weeks: string[];
  timeRange: [string, string] | null;
  onTimeRangeChange: (range: [string, string] | null) => void;
}

export function FilterBar({
  countryQuery,
  onCountryChange,
  weeks,
  timeRange,
  onTimeRangeChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <CountrySearch value={countryQuery} onChange={onCountryChange} />
      <TimeRangeSlider weeks={weeks} value={timeRange} onChange={onTimeRangeChange} />
    </div>
  );
}
