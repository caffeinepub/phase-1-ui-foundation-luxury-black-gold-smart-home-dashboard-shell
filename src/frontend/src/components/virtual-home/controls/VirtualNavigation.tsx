import { useFrame, useThree } from '@react-three/fiber';
import { useWASDMovement } from './useWASDMovement';
import { useMouseLook } from './useMouseLook';
import { Vector3, Euler } from 'three';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { ROOM_SPAWN_POINTS } from '../rooms/roomSpawnPoints';
import { ROOM_NAVIGATION_BOUNDS } from '../rooms/roomNavigationBounds';
import { useEffect, useRef } from 'react';
import type { RoomId } from '../../../backend';

interface VirtualNavigationProps {
  joystickVector: { x: number; y: number };
  touchLookRotation: { yaw: number; pitch: number };
  isDialogOpen: boolean;
  teleportTarget: RoomId | null;
  activeRoomId: RoomId | null;
  onTeleportComplete: () => void;
}

/**
 * Unified navigation with desktop WASD/mouse-look, mobile joystick/touch-look, room teleportation, and per-room navigation bounds.
 */
export function VirtualNavigation({ 
  joystickVector, 
  touchLookRotation,
  isDialogOpen,
  teleportTarget,
  activeRoomId,
  onTeleportComplete
}: VirtualNavigationProps) {
  const { camera } = useThree();
  const keys = useWASDMovement(!isDialogOpen);
  const mouseLookRotation = useMouseLook(!isDialogOpen);
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastTeleportRef = useRef<RoomId | null>(null);

  // Detect touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Handle teleportation
  useEffect(() => {
    if (teleportTarget !== null && teleportTarget !== lastTeleportRef.current) {
      const spawnPoint = ROOM_SPAWN_POINTS[teleportTarget];
      if (spawnPoint) {
        camera.position.set(spawnPoint.position[0], spawnPoint.position[1], spawnPoint.position[2]);
        camera.rotation.set(0, spawnPoint.rotation, 0);
        lastTeleportRef.current = teleportTarget;
        onTeleportComplete();
      }
    }
  }, [teleportTarget, camera, onTeleportComplete]);

  useFrame((state, delta) => {
    if (isDialogOpen) return;

    // Apply rotation (mouse-look on desktop, touch-look on mobile)
    camera.rotation.order = 'YXZ';
    if (isTouchDevice) {
      camera.rotation.x = touchLookRotation.pitch;
      camera.rotation.y = touchLookRotation.yaw;
    } else {
      camera.rotation.x = mouseLookRotation.x;
      camera.rotation.y = mouseLookRotation.y;
    }

    // Calculate movement vector
    const moveSpeed = 3;
    const velocity = new Vector3();

    // WASD movement (desktop)
    if (keys.forward) velocity.z -= 1;
    if (keys.backward) velocity.z += 1;
    if (keys.left) velocity.x -= 1;
    if (keys.right) velocity.x += 1;

    // Joystick movement (mobile and desktop)
    velocity.x += joystickVector.x;
    velocity.z += joystickVector.y;

    // Normalize and apply speed
    if (velocity.length() > 0) {
      velocity.normalize();
      velocity.multiplyScalar(moveSpeed * delta);

      // Apply camera rotation to movement direction
      const euler = new Euler(0, camera.rotation.y, 0, 'YXZ');
      velocity.applyEuler(euler);

      // Update position
      camera.position.add(velocity);
    }

    // Apply navigation bounds based on active room
    const bounds = activeRoomId !== null ? ROOM_NAVIGATION_BOUNDS[activeRoomId] : null;
    if (bounds) {
      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    } else {
      // Default bounds for entire space
      camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
      camera.position.z = Math.max(-4, Math.min(9, camera.position.z));
    }

    // Keep camera at eye level
    camera.position.y = 1.6;
  });

  return null;
}
