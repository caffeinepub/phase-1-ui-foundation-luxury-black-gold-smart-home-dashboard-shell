import { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  disabled?: boolean;
}

/**
 * On-screen joystick with deadzone smoothing for both touch and desktop, always resets to (0,0) when disabled.
 */
export function VirtualJoystick({ onMove, disabled = false }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Deadzone threshold (0-1 range, where 1 is max distance)
  const DEADZONE = 0.15;

  useEffect(() => {
    if (disabled) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      onMove({ x: 0, y: 0 });
    }
  }, [disabled, onMove]);

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    updatePosition(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const maxDistance = rect.width / 2 - 20;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;

    setPosition({ x, y });

    // Normalize to -1 to 1 range
    const normalizedX = x / maxDistance;
    const normalizedY = -y / maxDistance; // Invert Y for forward/backward

    // Apply deadzone with smooth scaling
    const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    
    if (magnitude < DEADZONE) {
      // Inside deadzone - emit zero
      onMove({ x: 0, y: 0 });
    } else {
      // Outside deadzone - scale smoothly from deadzone to max
      const scaledMagnitude = (magnitude - DEADZONE) / (1 - DEADZONE);
      const scale = scaledMagnitude / magnitude;
      onMove({
        x: normalizedX * scale,
        y: normalizedY * scale,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 z-40 h-32 w-32 rounded-full glass-surface border-primary/40"
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          e.preventDefault();
          handleMove(e.clientX, e.clientY);
        }
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        handleEnd();
      }}
      onMouseLeave={(e) => {
        if (isDragging) {
          e.preventDefault();
          handleEnd();
        }
      }}
      style={{
        opacity: disabled ? 0.3 : 0.8,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* Joystick Stick */}
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-gold-glow transition-transform"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
}
