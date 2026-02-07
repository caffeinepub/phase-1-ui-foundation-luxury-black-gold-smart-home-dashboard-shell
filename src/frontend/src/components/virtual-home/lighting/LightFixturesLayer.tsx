import type { DeviceId, LightDevice } from '../../../backend';
import { getDevicePosition } from '../deviceMapping';

interface LightFixturesLayerProps {
  devices: Array<[DeviceId, LightDevice]>;
}

/**
 * Renders visual light fixtures (bulbs) at device positions.
 * Fixtures appear lit (emissive) when devices are ON.
 */
export function LightFixturesLayer({ devices }: LightFixturesLayerProps) {
  if (!devices || devices.length === 0) {
    return null;
  }

  return (
    <group>
      {devices.map(([deviceId, device]) => {
        const position = getDevicePosition(device.name);
        
        if (!position) return null;

        // Calculate emissive intensity based on device state
        const emissiveIntensity = device.isOn 
          ? (device.brightness / 255) * 2.0 
          : 0;

        return (
          <mesh key={deviceId} position={position}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={device.isOn ? '#ffd700' : '#2a2a2a'}
              emissive="#ffd700"
              emissiveIntensity={emissiveIntensity}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}
