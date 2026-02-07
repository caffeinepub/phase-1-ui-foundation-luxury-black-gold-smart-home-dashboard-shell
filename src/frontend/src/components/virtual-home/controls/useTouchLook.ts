import { useState, useEffect, RefObject } from 'react';

interface TouchLookRotation {
  yaw: number;
  pitch: number;
}

/**
 * Touch-look hook for camera rotation on mobile devices.
 * Tracks finger drag and outputs stable rotation with clamped pitch.
 */
export function useTouchLook(
  elementRef: RefObject<HTMLElement | null>,
  enabled: boolean
): TouchLookRotation {
  const [rotation, setRotation] = useState<TouchLookRotation>({ yaw: 0, pitch: 0 });
  const [activeTouch, setActiveTouch] = useState<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      setActiveTouch(null);
      return;
    }

    const sensitivity = 0.003;

    const handleTouchStart = (e: TouchEvent) => {
      if (activeTouch === null && e.touches.length > 0) {
        setActiveTouch(e.touches[0].identifier);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeTouch === null) return;

      const touch = Array.from(e.touches).find(t => t.identifier === activeTouch);
      if (!touch) return;

      const movementX = e.touches[0].clientX - (e.touches[0].clientX - touch.clientX);
      const movementY = e.touches[0].clientY - (e.touches[0].clientY - touch.clientY);

      // Use touch movement deltas (approximated)
      const deltaX = touch.clientX - (element.clientWidth / 2);
      const deltaY = touch.clientY - (element.clientHeight / 2);

      setRotation((prev) => {
        const newPitch = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, prev.pitch - deltaY * sensitivity * 0.1)
        );
        const newYaw = prev.yaw - deltaX * sensitivity * 0.1;

        return {
          pitch: newPitch,
          yaw: newYaw,
        };
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const stillActive = Array.from(e.touches).some(t => t.identifier === activeTouch);
      if (!stillActive) {
        setActiveTouch(null);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [elementRef, enabled, activeTouch]);

  // Reset rotation when disabled
  useEffect(() => {
    if (!enabled) {
      setRotation({ yaw: 0, pitch: 0 });
      setActiveTouch(null);
    }
  }, [enabled]);

  return rotation;
}
