import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface DeviceHotspotProps {
  position: [number, number, number];
  onClick: () => void;
  isActive: boolean;
}

/**
 * Clickable 3D golden orb hotspot with enhanced emissive intensity, floating animation, hover affordances, and proper event propagation stop to prevent room surface selection.
 */
export function DeviceHotspot({ position, onClick, isActive }: DeviceHotspotProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      // Gentle rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      
      // Pulse scale on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale } as any, 0.1);
    }
  });

  // Cleanup cursor on unmount
  useEffect(() => {
    return () => {
      if (hovered) {
        document.body.style.cursor = 'default';
      }
    };
  }, [hovered]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffd700"
        emissiveIntensity={isActive ? 2 : 1.5}
        metalness={0.8}
        roughness={0.2}
      />
      
      {/* Outer glow ring */}
      <mesh scale={1.5}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </mesh>
    </mesh>
  );
}
