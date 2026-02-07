import { Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface RoomCountStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/**
 * Plus/minus stepper control for room count with min/max clamping (1–100), clear disabled/hover/focus states.
 */
export function RoomCountStepper({ value, onChange, min = 1, max = 100 }: RoomCountStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={isMinDisabled}
        className="h-10 w-10 shadow-gold-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease room count"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center justify-center min-w-[80px]">
        <span className="text-3xl font-bold text-primary tabular-nums">
          {value}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={isMaxDisabled}
        className="h-10 w-10 shadow-gold-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase room count"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
