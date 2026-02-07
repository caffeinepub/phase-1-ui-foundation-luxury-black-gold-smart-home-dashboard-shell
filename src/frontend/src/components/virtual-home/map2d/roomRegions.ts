import type { RoomId } from '../../../backend';

/**
 * Static 2D floorplan geometry for room regions.
 * Each room has a clickable region and zoom focus transform.
 */

interface RoomRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  translateX: number;
  translateY: number;
}

export const ROOM_REGIONS: Record<RoomId, RoomRegion> = {
  1: {
    // Living Room (left side)
    x: 70,
    y: 70,
    width: 320,
    height: 460,
    scale: 1.8,
    translateX: 150,
    translateY: 100,
  },
  2: {
    // Bedroom (top right)
    x: 410,
    y: 70,
    width: 320,
    height: 220,
    scale: 2.2,
    translateX: -200,
    translateY: 120,
  },
  3: {
    // Kitchen (bottom right)
    x: 410,
    y: 310,
    width: 320,
    height: 220,
    scale: 2.2,
    translateX: -200,
    translateY: -80,
  },
};
