import { useMemo } from 'react';

interface HomeHealthGaugeProps {
  value: number; // 0-100
}

export function HomeHealthGauge({ value }: HomeHealthGaugeProps) {
  const { strokeDasharray, strokeDashoffset, color } = useMemo(() => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (clampedValue / 100) * circumference;

    let gaugeColor = 'oklch(0.75 0.18 85)'; // gold
    if (clampedValue < 50) {
      gaugeColor = 'oklch(0.704 0.191 22.216)'; // destructive
    } else if (clampedValue < 75) {
      gaugeColor = 'oklch(0.828 0.189 84.429)'; // warning
    }

    return {
      strokeDasharray: circumference,
      strokeDashoffset: offset,
      color: gaugeColor,
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="oklch(var(--border))"
            strokeWidth="8"
            opacity="0.2"
          />
          
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{Math.round(value)}%</span>
          <span className="text-xs text-muted-foreground">Health</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {value >= 75 ? 'Excellent' : value >= 50 ? 'Good' : 'Needs Attention'}
        </p>
      </div>
    </div>
  );
}
