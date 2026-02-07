import { useEffect, useRef, useState } from 'react';

export function useMouseLook(enabled: boolean = true) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isLockedRef = useRef(false);
  const canvasRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find the canvas element
    const canvas = document.querySelector('canvas');
    canvasRef.current = canvas;

    if (!enabled) {
      if (isLockedRef.current && document.pointerLockElement) {
        document.exitPointerLock();
      }
      isLockedRef.current = false;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return;

      const sensitivity = 0.002;
      setRotation((prev) => ({
        x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.x - e.movementY * sensitivity)),
        y: prev.y - e.movementX * sensitivity,
      }));
    };

    const handleCanvasClick = () => {
      if (!enabled || isLockedRef.current || !canvas) return;
      canvas.requestPointerLock();
    };

    const handlePointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvas;
      if (!isLockedRef.current) {
        // Reset cursor when pointer lock is released
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerLockError = () => {
      console.warn('Pointer lock failed');
      isLockedRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
    }
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      
      if (isLockedRef.current && document.pointerLockElement) {
        document.exitPointerLock();
      }
      isLockedRef.current = false;
      document.body.style.cursor = 'default';
    };
  }, [enabled]);

  return rotation;
}
