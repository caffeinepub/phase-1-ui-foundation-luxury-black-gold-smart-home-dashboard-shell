import { useMemo } from 'react';

interface DataPoint {
  time: string;
  value: number;
}

interface EnergyConsumptionLineChartProps {
  data: DataPoint[];
}

export function EnergyConsumptionLineChart({ data }: EnergyConsumptionLineChartProps) {
  const { path, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) return { path: '', maxValue: 0, minValue: 0 };

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const width = 300;
    const height = 120;
    const padding = 10;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return {
      path: `M ${points.join(' L ')}`,
      maxValue: max,
      minValue: min,
    };
  }, [data]);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between text-xs text-muted-foreground">
        <span>Last 24h</span>
        <span className="text-primary font-medium">{maxValue.toFixed(1)} kWh</span>
      </div>
      <svg
        viewBox="0 0 300 120"
        className="w-full h-auto"
        style={{ maxHeight: '120px' }}
      >
        {/* Grid lines */}
        <line x1="10" y1="30" x2="290" y2="30" stroke="oklch(var(--border))" strokeWidth="0.5" opacity="0.3" />
        <line x1="10" y1="60" x2="290" y2="60" stroke="oklch(var(--border))" strokeWidth="0.5" opacity="0.3" />
        <line x1="10" y1="90" x2="290" y2="90" stroke="oklch(var(--border))" strokeWidth="0.5" opacity="0.3" />

        {/* Gradient fill */}
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.18 85)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.75 0.18 85)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area under curve */}
        {path && (
          <path
            d={`${path} L 290,110 L 10,110 Z`}
            fill="url(#energyGradient)"
          />
        )}

        {/* Line */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke="oklch(0.75 0.18 85)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          const x = 10 + (i / (data.length - 1)) * 280;
          const y = 110 - ((d.value - minValue) / (maxValue - minValue || 1)) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="oklch(0.75 0.18 85)"
              className="drop-shadow-[0_0_4px_oklch(0.75_0.18_85)]"
            />
          );
        })}
      </svg>
    </div>
  );
}
