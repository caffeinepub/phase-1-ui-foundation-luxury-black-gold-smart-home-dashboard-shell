import type { LightDevice } from '../../backend';

/**
 * Shared device-to-3D-position mapping for the Virtual Home.
 * Updated positions to align with the realistic home model layout.
 */

export type DevicePosition = [number, number, number];

export const DEVICE_POSITION_MAP: Record<string, DevicePosition> = {
  'floor lamp': [-3, 1.6, -2],
  'ceiling light': [3, 4.0, 0],
};

/**
 * Get the 3D position for a device by name.
 * Returns undefined if the device has no mapped position.
 */
export function getDevicePosition(deviceName: string): DevicePosition | undefined {
  const normalizedName = deviceName.toLowerCase().trim();
  return DEVICE_POSITION_MAP[normalizedName];
}

/**
 * Check if a device has a mapped 3D position.
 */
export function hasDevicePosition(deviceName: string): boolean {
  return getDevicePosition(deviceName) !== undefined;
}

/**
 * Get all devices that have mapped positions.
 */
export function filterMappedDevices<T extends [any, LightDevice]>(
  devices: T[]
): T[] {
  return devices.filter(([, device]) => hasDevicePosition(device.name));
}
