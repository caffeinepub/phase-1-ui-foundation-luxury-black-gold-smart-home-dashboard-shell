import { useRef } from 'react';
import type { DeviceId, LightDevice } from '../../../backend';
import { getDevicePosition } from '../deviceMapping';

interface SceneLightingProps {
  devices: Array<[DeviceId, LightDevice]>;
}

/**
 * Dynamic scene lighting with balanced ambient/directional/fill lighting for clear visibility in dark UI while preserving depth cues.
 */
export function SceneLighting({ devices }: SceneLightingProps) {
  return (
    <>
      {/* Enhanced ambient light for baseline visibility without washing out shadows */}
      <ambientLight intensity={0.5} />
      
      {/* Primary directional light simulating window light with softer shadows */}
      <directionalLight
        position={[-4, 4, -5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Soft fill light from opposite side for balanced illumination */}
      <directionalLight
        position={[5, 4, 3]}
        intensity={0.4}
      />

      {/* Additional ceiling fill light to prevent overly dark areas */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={0.3}
        distance={15}
        decay={2}
        color="#ffffff"
      />

      {/* Device-driven point lights */}
      {devices.map(([deviceId, device]) => {
        const position = getDevicePosition(device.name);
        if (!position) return null;

        // Calculate intensity: 0 when off, scaled by brightness when on
        const intensity = device.isOn ? (device.brightness / 255) * 3 : 0;

        return (
          <pointLight
            key={deviceId}
            position={position}
            intensity={intensity}
            distance={8}
            decay={2}
            color="#ffd700"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        );
      })}
    </>
  );
}
