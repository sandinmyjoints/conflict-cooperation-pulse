import { goldsteinColor } from "../utils/colorScale";

export function ColorLegend() {
  // Generate gradient stops from -10 to +10
  const steps = 11;
  const stops = Array.from({ length: steps }, (_, i) => {
    const value = -10 + (20 * i) / (steps - 1);
    return { offset: `${(i / (steps - 1)) * 100}%`, color: goldsteinColor(value) };
  });

  return (
    <div className="color-legend" aria-label="Color scale: red is conflict, blue is cooperation">
      <span className="color-legend__label">Conflict</span>
      <svg width={120} height={12} className="color-legend__bar">
        <defs>
          <linearGradient id="goldstein-gradient">
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect width={120} height={12} rx={2} fill="url(#goldstein-gradient)" />
      </svg>
      <span className="color-legend__label">Cooperation</span>
    </div>
  );
}
