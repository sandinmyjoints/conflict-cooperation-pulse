import { useMemo, useRef, useEffect } from "react";
import {
  scaleLinear,
  scaleTime,
  area as d3Area,
  line as d3Line,
  max,
  axisBottom,
  axisLeft,
  axisRight,
  select,
  timeFormat,
} from "d3";
import type { WeekData } from "../types";

interface AreaChartProps {
  data: WeekData[];
  width?: number;
  height?: number;
}

const MARGIN = { top: 10, right: 50, bottom: 30, left: 50 };

export function AreaChart({ data, width = 800, height = 300 }: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const scales = useMemo(() => {
    const dates = data.map((d) => new Date(d.week + "T00:00:00Z"));
    const x = scaleTime()
      .domain([dates[0], dates[dates.length - 1]])
      .range([0, innerWidth]);

    const maxCount = max(data, (d) => Math.max(d.coop, d.conf)) ?? 1;
    const yCount = scaleLinear().domain([0, maxCount]).nice().range([innerHeight, 0]);

    const yGoldstein = scaleLinear().domain([-10, 10]).range([innerHeight, 0]);

    return { x, yCount, yGoldstein, dates };
  }, [data, innerWidth, innerHeight]);

  // Axes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);

    svg.select<SVGGElement>(".x-axis")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top + innerHeight})`)
      .call(axisBottom(scales.x).ticks(8).tickFormat(timeFormat("%b '%y") as (d: Date | { valueOf(): number }) => string));

    svg.select<SVGGElement>(".y-axis-left")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)
      .call(axisLeft(scales.yCount).ticks(5));

    svg.select<SVGGElement>(".y-axis-right")
      .attr("transform", `translate(${MARGIN.left + innerWidth},${MARGIN.top})`)
      .call(axisRight(scales.yGoldstein).ticks(5));
  }, [scales, innerWidth, innerHeight]);

  const coopArea = useMemo(() => {
    const gen = d3Area<number>()
      .x((_, i) => scales.x(scales.dates[i]))
      .y0(innerHeight)
      .y1((_, i) => scales.yCount(data[i].coop));
    return gen(data.map((_, i) => i)) ?? "";
  }, [data, scales, innerHeight]);

  const confArea = useMemo(() => {
    const gen = d3Area<number>()
      .x((_, i) => scales.x(scales.dates[i]))
      .y0(innerHeight)
      .y1((_, i) => scales.yCount(data[i].conf));
    return gen(data.map((_, i) => i)) ?? "";
  }, [data, scales, innerHeight]);

  const goldsteinLine = useMemo(() => {
    // 4-week rolling average
    const smoothed = data.map((_, i) => {
      const window = data.slice(Math.max(0, i - 3), i + 1);
      const vals = window.filter((w) => w.avg_goldstein !== null).map((w) => w.avg_goldstein!);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });

    const gen = d3Line<number>()
      .defined((_, i) => smoothed[i] !== null)
      .x((_, i) => scales.x(scales.dates[i]))
      .y((_, i) => scales.yGoldstein(smoothed[i]!));

    return gen(data.map((_, i) => i)) ?? "";
  }, [data, scales]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="area-chart"
      role="img"
      aria-label="Area chart showing cooperative and conflictual events over time"
    >
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        {/* Zero line for Goldstein */}
        <line x1={0} y1={scales.yGoldstein(0)} x2={innerWidth} y2={scales.yGoldstein(0)} stroke="#ccc" strokeDasharray="4 2" />
        {/* Cooperative area */}
        <path d={coopArea} fill="steelblue" opacity={0.3} />
        {/* Conflictual area */}
        <path d={confArea} fill="indianred" opacity={0.3} />
        {/* Goldstein trend line */}
        <path d={goldsteinLine} fill="none" stroke="#333" strokeWidth={2} />
      </g>
      <g className="x-axis" />
      <g className="y-axis-left" />
      <g className="y-axis-right" />
    </svg>
  );
}
