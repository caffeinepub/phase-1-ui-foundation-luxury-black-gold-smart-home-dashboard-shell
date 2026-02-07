import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { BasicInterior } from './BasicInterior';
import { SceneLighting } from './lighting/SceneLighting';
import { LightFixturesLayer } from './lighting/LightFixturesLayer';
import { DeviceHotspotsLayer } from './hotspots/DeviceHotspotsLayer';
import { DeviceControlDialog } from './devices/DeviceControlDialog';
import { VirtualNavigation } from './controls/VirtualNavigation';
import { VirtualJoystick } from './controls/VirtualJoystick';
import { TouchLookArea } from './controls/TouchLookArea';
import { RoomSurfacePickerLayer } from './rooms/RoomSurfacePickerLayer';
import { filterMappedDevices } from './deviceMapping';
import { useGetDevicesByRoom } from '../../hooks/useQueries';
import type { DeviceId, RoomId, RoomInfo } from '../../backend';

interface VirtualHomeSceneProps {
  rooms: RoomInfo[];
  activeRoomId: RoomId | null;
  teleportTarget: RoomId | null;
  onTeleportComplete: () => void;
  onSurfaceSelectRoom: (roomId: RoomId) => void;
  onError?: (error: string) => void;
}

/**
 * Main 3D scene with stable lighting, joystick controls, room surface selection, and device interaction respecting activeRoomId.
 */
export function VirtualHomeScene({ 
  rooms, 
  activeRoomId, 
  teleportTarget, 
  onTeleportComplete,
  onSurfaceSelectRoom,
  onError 
}: VirtualHomeSceneProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [touchLookRotation, setTouchLookRotation] = useState({ yaw: 0, pitch: 0 });
  const teleportRequestRef = useRef<RoomId | null>(null);

  // Fetch devices for active room (or all devices if no room is active)
  // For now, we show devices from Room 1 as the default living room
  const { data: devices = [] } = useGetDevicesByRoom(activeRoomId ?? 1);

  // Filter to only devices with mapped 3D positions
  const mappedDevices = filterMappedDevices(devices);

  // Find selected device safely
  const selectedDevice = selectedDeviceId !== null 
    ? devices.find(([id]) => id === selectedDeviceId)
    : undefined;

  // Handle teleport requests
  useEffect(() => {
    if (teleportTarget !== null) {
      teleportRequestRef.current = teleportTarget;
    }
  }, [teleportTarget]);

  const handleCloseDialog = () => {
    setSelectedDeviceId(null);
  };

  const handleCanvasError = (error: any) => {
    console.error('Canvas error:', error);
    onError?.('An error occurred while rendering the 3D scene. Please try refreshing the page.');
  };

  const handleTeleportComplete = () => {
    teleportRequestRef.current = null;
    onTeleportComplete();
  };

  // Detect touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Modal open state (device dialog or any other modal)
  const isModalOpen = selectedDeviceId !== null;

  return (
    <>
      <Canvas
        className="h-full w-full"
        camera={{ 
          position: [0, 1.6, 3], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        shadows="soft"
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
        onError={handleCanvasError}
      >
        <Suspense fallback={null}>
          <SceneLighting devices={mappedDevices} />
          <BasicInterior />
          <LightFixturesLayer devices={mappedDevices} />
          <DeviceHotspotsLayer
            devices={mappedDevices}
            onSelectDevice={setSelectedDeviceId}
            isDialogOpen={isModalOpen}
          />
          <RoomSurfacePickerLayer
            onSelectRoom={onSurfaceSelectRoom}
            disabled={isModalOpen}
          />
          <VirtualNavigation
            joystickVector={joystickVector}
            touchLookRotation={touchLookRotation}
            isDialogOpen={isModalOpen}
            teleportTarget={teleportRequestRef.current}
            activeRoomId={activeRoomId}
            onTeleportComplete={handleTeleportComplete}
          />
        </Suspense>
      </Canvas>

      {/* On-screen Joystick - visible on both touch and desktop */}
      <VirtualJoystick
        onMove={setJoystickVector}
        disabled={isModalOpen}
      />

      {/* Mobile Touch Look Area */}
      {isTouchDevice && (
        <TouchLookArea
          onRotate={setTouchLookRotation}
          disabled={isModalOpen}
        />
      )}

      {/* Device Control Dialog */}
      {selectedDevice && (
        <DeviceControlDialog
          deviceId={selectedDevice[0]}
          device={selectedDevice[1]}
          open={true}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}
