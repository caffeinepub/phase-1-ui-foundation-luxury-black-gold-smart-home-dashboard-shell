import type { RoomId } from '../../../backend';

/**
 * Per-room navigation bounds to keep camera movement sensible after teleporting.
 */

interface NavigationBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const ROOM_NAVIGATION_BOUNDS: Record<RoomId, NavigationBounds> = {
  1: {
    // Living Room
    minX: -9,
    maxX: 9,
    minZ: -4,
    maxZ: 9,
  },
  2: {
    // Bedroom
    minX: 3,
    maxX: 9,
    minZ: -4,
    maxZ: 2,
  },
  3: {
    // Kitchen
    minX: 3,
    maxX: 9,
    minZ: 3,
    maxZ: 9,
  },
};
