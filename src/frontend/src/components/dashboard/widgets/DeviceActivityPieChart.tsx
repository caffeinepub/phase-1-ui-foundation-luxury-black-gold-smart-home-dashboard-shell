import { useMemo } from 'react';

interface DeviceCategory {
  name: string;
  value: number;
  color: string;
}

interface DeviceActivityPieChartProps {
  data: DeviceCategory[];
}

export function DeviceActivityPieChart({ data }: DeviceActivityPieChartProps) {
  const { slices, total } = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.value, 0);

    // Handle edge case: no devices
    if (sum === 0) {
      return { slices: [], total: 0 };
    }

    let currentAngle = -90; // Start at top

    const pieSlices = data.map((d) => {
      const percentage = (d.value / sum) * 100;
      const angle = (d.value / sum) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Calculate path for pie slice
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = 60 + 45 * Math.cos(startRad);
      const y1 = 60 + 45 * Math.sin(startRad);
      const x2 = 60 + 45 * Math.cos(endRad);
      const y2 = 60 + 45 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      const path = `M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;

      currentAngle = endAngle;

      return {
        ...d,
        path,
        percentage,
      };
    });

    return { slices: pieSlices, total: sum };
  }, [data]);

  // Handle empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="oklch(var(--muted))" opacity="0.2" />
          <circle cx="60" cy="60" r="25" fill="oklch(var(--card))" />
          <text x="60" y="58" textAnchor="middle" className="text-xs font-bold fill-foreground">
            0
          </text>
          <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-muted-foreground">
            devices
          </text>
        </svg>
        <p className="mt-3 text-xs text-muted-foreground">No devices yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {slices.map((slice, i) => (
            <g key={i}>
              <path
                d={slice.path}
                fill={slice.color}
                opacity="0.8"
                className="transition-opacity hover:opacity-100"
                style={{
                  filter: `drop-shadow(0 0 4px ${slice.color})`,
                }}
              />
            </g>
          ))}

          {/* Center circle for donut effect */}
          <circle cx="60" cy="60" r="25" fill="oklch(var(--card))" />

          {/* Center text */}
          <text x="60" y="58" textAnchor="middle" className="text-xs font-bold fill-foreground">
            {total}
          </text>
          <text x="60" y="68" textAnchor="middle" className="text-[8px] fill-muted-foreground">
            devices
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-muted-foreground">{slice.name}</span>
            </div>
            <span className="font-medium text-foreground">{slice.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
