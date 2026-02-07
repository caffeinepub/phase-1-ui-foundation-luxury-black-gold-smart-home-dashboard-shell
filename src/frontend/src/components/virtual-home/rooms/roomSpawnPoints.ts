import type { RoomId } from '../../../backend';

/**
 * Predefined 3D spawn points for room teleportation.
 * Each room has a position and orientation (yaw rotation).
 */

interface SpawnPoint {
  position: [number, number, number]; // [x, y, z]
  rotation: number; // yaw in radians
}

export const ROOM_SPAWN_POINTS: Record<RoomId, SpawnPoint> = {
  1: {
    // Living Room - center view
    position: [0, 1.6, 3],
    rotation: 0,
  },
  2: {
    // Bedroom - right side
    position: [6, 1.6, -2],
    rotation: Math.PI / 2,
  },
  3: {
    // Kitchen - far right
    position: [6, 1.6, 6],
    rotation: -Math.PI / 2,
  },
};
