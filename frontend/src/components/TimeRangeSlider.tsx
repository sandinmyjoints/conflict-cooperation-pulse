import { useMemo } from "react";
import { formatDate } from "../utils/formatters";

interface TimeRangeSliderProps {
  weeks: string[];
  value: [string, string] | null;
  onChange: (range: [string, string] | null) => void;
}

export function TimeRangeSlider({ weeks, value, onChange }: TimeRangeSliderProps) {
  const min = 0;
  const max = weeks.length - 1;

  const currentRange = useMemo(() => {
    if (!value) return [min, max] as [number, number];
    const startIdx = weeks.indexOf(value[0]);
    const endIdx = weeks.indexOf(value[1]);
    return [
      startIdx >= 0 ? startIdx : min,
      endIdx >= 0 ? endIdx : max,
    ] as [number, number];
  }, [value, weeks, min, max]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = Number(e.target.value);
    const end = currentRange[1];
    if (start >= end) return;
    if (start === min && end === max) {
      onChange(null);
    } else {
      onChange([weeks[start], weeks[end]]);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = currentRange[0];
    const end = Number(e.target.value);
    if (end <= start) return;
    if (start === min && end === max) {
      onChange(null);
    } else {
      onChange([weeks[start], weeks[end]]);
    }
  };

  if (weeks.length === 0) return null;

  return (
    <div className="time-range">
      <span className="time-range__label">Time range</span>
      <div className="time-range__controls">
        <input
          type="range"
          min={min}
          max={max}
          value={currentRange[0]}
          onChange={handleStartChange}
          aria-label="Start week"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={currentRange[1]}
          onChange={handleEndChange}
          aria-label="End week"
        />
      </div>
      <span className="time-range__display">
        {formatDate(weeks[currentRange[0]])} — {formatDate(weeks[currentRange[1]])}
      </span>
    </div>
  );
}
