import { Map, Box } from 'lucide-react';
import { Button } from '../ui/button';

interface VirtualHomeModeToggleProps {
  mode: '2d' | '3d';
  onChange: (mode: '2d' | '3d') => void;
}

/**
 * Toggle control for switching between 2D Map and 3D Walkthrough modes.
 */
export function VirtualHomeModeToggle({ mode, onChange }: VirtualHomeModeToggleProps) {
  return (
    <div className="glass-surface flex gap-1 rounded-full border border-primary/40 p-1">
      <Button
        variant={mode === '2d' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('2d')}
        className={`rounded-full ${
          mode === '2d' 
            ? 'bg-primary text-primary-foreground shadow-gold-glow' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Map className="mr-2 h-4 w-4" />
        2D Map
      </Button>
      <Button
        variant={mode === '3d' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('3d')}
        className={`rounded-full ${
          mode === '3d' 
            ? 'bg-primary text-primary-foreground shadow-gold-glow' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Box className="mr-2 h-4 w-4" />
        3D Walkthrough
      </Button>
    </div>
  );
}
