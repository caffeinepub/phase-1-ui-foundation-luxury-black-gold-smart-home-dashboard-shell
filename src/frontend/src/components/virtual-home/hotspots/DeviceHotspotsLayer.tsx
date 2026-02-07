import { DeviceHotspot } from './DeviceHotspot';
import type { DeviceId, LightDevice } from '../../../backend';
import { getDevicePosition } from '../deviceMapping';

interface DeviceHotspotsLayerProps {
  devices: Array<[DeviceId, LightDevice]>;
  onSelectDevice: (deviceId: DeviceId) => void;
  isDialogOpen: boolean;
}

/**
 * Renders interactive hotspots at mapped device positions.
 * Uses shared device mapping to ensure consistency with lighting.
 */
export function DeviceHotspotsLayer({ devices, onSelectDevice, isDialogOpen }: DeviceHotspotsLayerProps) {
  // Handle empty devices array safely
  if (!devices || devices.length === 0) {
    return null;
  }

  return (
    <group>
      {devices.map(([deviceId, device]) => {
        const position = getDevicePosition(device.name);
        
        // Skip devices without mapped positions
        if (!position) return null;

        // Adjust hotspot position slightly above device for visibility
        const hotspotPosition: [number, number, number] = [
          position[0],
          position[1] + 0.6,
          position[2]
        ];

        return (
          <DeviceHotspot
            key={deviceId}
            position={hotspotPosition}
            onClick={() => {
              // Only allow selection when dialog is not already open
              if (!isDialogOpen) {
                onSelectDevice(deviceId);
              }
            }}
            isActive={device.isOn}
          />
        );
      })}
    </group>
  );
}
