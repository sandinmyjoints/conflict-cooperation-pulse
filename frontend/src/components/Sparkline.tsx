import { useMemo } from "react";
import { scaleLinear, line as d3Line } from "d3";
import type { WeekData } from "../types";
import { SPARKLINE_WIDTH, SPARKLINE_HEIGHT, SPARKLINE_WEEKS } from "../config";
import { goldsteinColor } from "../utils/colorScale";

interface SparklineProps {
  data: WeekData[];
}

export function Sparkline({ data }: SparklineProps) {
  const recent = data.slice(-SPARKLINE_WEEKS);

  const pathData = useMemo(() => {
    const points = recent
      .map((d, i) => (d.avg_goldstein !== null ? { i, v: d.avg_goldstein } : null))
      .filter((p): p is { i: number; v: number } => p !== null);

    if (points.length < 2) return null;

    const x = scaleLinear()
      .domain([0, recent.length - 1])
      .range([2, SPARKLINE_WIDTH - 2]);

    const y = scaleLinear()
      .domain([-10, 10])
      .range([SPARKLINE_HEIGHT - 2, 2]);

    const lineGen = d3Line<{ i: number; v: number }>()
      .x((d) => x(d.i))
      .y((d) => y(d.v));

    return { path: lineGen(points), points };
  }, [recent]);

  if (!pathData?.path) {
    return (
      <svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT} aria-hidden="true">
        <line x1={0} y1={SPARKLINE_HEIGHT / 2} x2={SPARKLINE_WIDTH} y2={SPARKLINE_HEIGHT / 2} stroke="#ddd" />
      </svg>
    );
  }

  // Color based on the last data point
  const lastValue = pathData.points[pathData.points.length - 1].v;
  const strokeColor = goldsteinColor(lastValue);

  return (
    <svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT} aria-hidden="true">
      {/* Zero line */}
      <line
        x1={0}
        y1={SPARKLINE_HEIGHT / 2}
        x2={SPARKLINE_WIDTH}
        y2={SPARKLINE_HEIGHT / 2}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
      <path d={pathData.path} fill="none" stroke={strokeColor} strokeWidth={1.5} />
    </svg>
  );
}
