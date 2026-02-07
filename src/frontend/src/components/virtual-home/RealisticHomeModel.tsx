import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * Realistic 3D home interior model with detailed furniture, architectural elements, proper materials, and shadow flags for clear visibility under updated lighting.
 */
export function RealisticHomeModel() {
  return (
    <group>
      {/* Floor - Hardwood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#5a4a3a" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>

      {/* Walls */}
      {/* Back Wall */}
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#ebe8e0" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#ebe8e0" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#ebe8e0" roughness={0.9} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, 2.5, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#ebe8e0" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f8f8f5" roughness={0.9} />
      </mesh>

      {/* Crown Molding */}
      <mesh position={[0, 4.8, -5]} castShadow>
        <boxGeometry args={[20, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[-10, 4.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[20, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[10, 4.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[20, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Baseboards */}
      <mesh position={[0, 0.1, -4.9]} castShadow>
        <boxGeometry args={[20, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[-9.9, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[20, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[9.9, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[20, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Sofa - Modern L-shaped */}
      {/* Main seat */}
      <mesh position={[-5, 0.4, -3]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.8, 2]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>
      {/* Backrest */}
      <mesh position={[-5, 1.1, -4]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.4, 0.3]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>
      {/* Armrest left */}
      <mesh position={[-7, 0.9, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 1.0, 2]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>
      {/* Armrest right */}
      <mesh position={[-3, 0.9, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 1.0, 2]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-5.8, 0.85, -3]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.8]} />
        <meshStandardMaterial color="#34495e" roughness={0.7} />
      </mesh>
      <mesh position={[-4.5, 0.85, -3]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.8]} />
        <meshStandardMaterial color="#34495e" roughness={0.7} />
      </mesh>

      {/* Coffee Table */}
      {/* Table top */}
      <mesh position={[-5, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.2]} />
        <meshStandardMaterial color="#8b7355" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Legs */}
      <mesh position={[-6, 0.25, -0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>
      <mesh position={[-6, 0.25, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>
      <mesh position={[-4, 0.25, -0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>
      <mesh position={[-4, 0.25, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>

      {/* TV Stand */}
      {/* Main body */}
      <mesh position={[0, 0.4, -4.7]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.8, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* TV Screen */}
      <mesh position={[0, 1.5, -4.85]} castShadow>
        <boxGeometry args={[2.5, 1.4, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* TV Frame */}
      <mesh position={[0, 1.5, -4.8]} castShadow>
        <boxGeometry args={[2.6, 1.5, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Bookshelf */}
      {/* Frame */}
      <mesh position={[8, 1.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 3, 2]} />
        <meshStandardMaterial color="#6b5544" roughness={0.6} />
      </mesh>
      {/* Shelves */}
      <mesh position={[8, 0.8, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.05, 1.9]} />
        <meshStandardMaterial color="#7a6655" roughness={0.5} />
      </mesh>
      <mesh position={[8, 1.6, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.05, 1.9]} />
        <meshStandardMaterial color="#7a6655" roughness={0.5} />
      </mesh>
      <mesh position={[8, 2.4, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.05, 1.9]} />
        <meshStandardMaterial color="#7a6655" roughness={0.5} />
      </mesh>
      {/* Books */}
      <mesh position={[8, 1.0, -3.5]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.2]} />
        <meshStandardMaterial color="#8b0000" roughness={0.7} />
      </mesh>
      <mesh position={[8, 1.0, -3.2]} castShadow>
        <boxGeometry args={[0.15, 0.35, 0.2]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
      </mesh>
      <mesh position={[8, 1.0, -2.9]} castShadow>
        <boxGeometry args={[0.15, 0.28, 0.2]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>

      {/* Floor Lamp - Modern Arc Design */}
      {/* Base */}
      <mesh position={[-3, 0.05, -2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Pole */}
      <mesh position={[-3, 0.75, -2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Shade holder */}
      <mesh position={[-3, 1.5, -2]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lampshade */}
      <mesh position={[-3, 1.6, -2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.4, 16]} />
        <meshStandardMaterial 
          color="#f5f5dc" 
          roughness={0.8} 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Ceiling Light Fixture - Modern Pendant */}
      {/* Mounting plate */}
      <mesh position={[3, 4.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cable */}
      <mesh position={[3, 4.65, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* Fixture housing */}
      <mesh position={[3, 4.3, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glass diffuser */}
      <mesh position={[3, 4.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          transparent 
          opacity={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Armchair */}
      {/* Seat */}
      <mesh position={[5, 0.4, 2]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>
      {/* Backrest */}
      <mesh position={[5, 1.0, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>
      {/* Armrests */}
      <mesh position={[5.6, 0.7, 2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.6, 1.0]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>
      <mesh position={[4.4, 0.7, 2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.6, 1.0]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>

      {/* Side Table */}
      <mesh position={[6.5, 0.5, 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.0, 16]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.4} />
      </mesh>
      {/* Table top */}
      <mesh position={[6.5, 1.05, 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#6b5544" roughness={0.3} />
      </mesh>

      {/* Decorative Plant */}
      {/* Pot */}
      <mesh position={[6.5, 1.2, 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.2, 16]} />
        <meshStandardMaterial color="#8b4726" roughness={0.6} />
      </mesh>
      {/* Plant leaves */}
      <mesh position={[6.5, 1.4, 2]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>

      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.01, 0]} receiveShadow>
        <planeGeometry args={[5, 3.5]} />
        <meshStandardMaterial color="#8b7d6b" roughness={0.9} />
      </mesh>

      {/* Window Frame (on back wall) */}
      <mesh position={[-4, 2.5, -4.95]} castShadow>
        <boxGeometry args={[2, 2.5, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Window glass */}
      <mesh position={[-4, 2.5, -4.9]} receiveShadow>
        <planeGeometry args={[1.8, 2.3]} />
        <meshStandardMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.3} 
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Picture Frame on wall */}
      <mesh position={[4, 2.5, -4.95]} castShadow>
        <boxGeometry args={[1.2, 0.9, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Picture */}
      <mesh position={[4, 2.5, -4.9]}>
        <planeGeometry args={[1.0, 0.7]} />
        <meshStandardMaterial color="#4a6fa5" roughness={0.6} />
      </mesh>
    </group>
  );
}
