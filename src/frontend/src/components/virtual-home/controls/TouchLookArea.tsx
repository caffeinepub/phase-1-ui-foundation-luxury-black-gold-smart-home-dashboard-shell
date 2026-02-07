import { useRef, useEffect } from 'react';
import { useTouchLook } from './useTouchLook';

interface TouchLookAreaProps {
  onRotate: (rotation: { yaw: number; pitch: number }) => void;
  disabled?: boolean;
}

/**
 * Transparent touch-drag area for camera rotation on mobile devices.
 * Positioned to avoid joystick area (bottom-left).
 */
export function TouchLookArea({ onRotate, disabled = false }: TouchLookAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotation = useTouchLook(containerRef, !disabled);

  useEffect(() => {
    onRotate(rotation);
  }, [rotation, onRotate]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30"
      style={{
        // Exclude joystick area (bottom-left 200x200px)
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 200px 100%, 200px calc(100% - 200px), 0 calc(100% - 200px))',
        pointerEvents: disabled ? 'none' : 'auto',
        touchAction: 'none',
      }}
      aria-label="Touch and drag to look around"
    />
  );
}
