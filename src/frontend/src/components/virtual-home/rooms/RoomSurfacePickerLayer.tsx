import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { RoomId } from '../../../backend';

interface RoomSurfacePickerLayerProps {
  onSelectRoom: (roomId: RoomId) => void;
  disabled: boolean;
}

/**
 * Invisible room surface picking layer that maps pointer clicks to roomId based on camera position.
 * Fallback: defaults to Room 1 (Living Room) when specific room cannot be determined.
 */
export function RoomSurfacePickerLayer({ onSelectRoom, disabled }: RoomSurfacePickerLayerProps) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (disabled) return;

    const handleClick = (event: MouseEvent) => {
      // Determine room based on camera position
      // Room boundaries match navigation bounds
      const x = camera.position.x;
      const z = camera.position.z;

      let roomId: RoomId;

      // Room 2 (Bedroom) - right side, front half
      if (x >= 3 && x <= 9 && z >= -4 && z <= 2) {
        roomId = 2;
      }
      // Room 3 (Kitchen) - right side, back half
      else if (x >= 3 && x <= 9 && z >= 3 && z <= 9) {
        roomId = 3;
      }
      // Room 1 (Living Room) - default/fallback for center and left areas
      else {
        roomId = 1;
      }

      onSelectRoom(roomId);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [camera, gl, onSelectRoom, disabled]);

  return null;
}
