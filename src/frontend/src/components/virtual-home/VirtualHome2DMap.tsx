import { useState, useEffect } from 'react';
import { Home, ZoomIn } from 'lucide-react';
import { Button } from '../ui/button';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ROOM_REGIONS } from './map2d/roomRegions';
import type { RoomId, RoomInfo } from '../../backend';

interface VirtualHome2DMapProps {
  rooms: RoomInfo[];
  activeRoomId: RoomId | null;
  onRoomSelect: (roomId: RoomId) => void;
  onClearSelection: () => void;
}

/**
 * 2D top-down floorplan view with luxury black/gold theme, clickable room regions, and smooth zoom animation using CSS transforms.
 */
export function VirtualHome2DMap({ rooms, activeRoomId, onRoomSelect, onClearSelection }: VirtualHome2DMapProps) {
  const [zoomedRoom, setZoomedRoom] = useState<RoomId | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (activeRoomId !== null) {
      setZoomedRoom(activeRoomId);
    } else {
      setZoomedRoom(null);
    }
  }, [activeRoomId]);

  const handleRoomClick = (roomId: RoomId) => {
    setZoomedRoom(roomId);
    onRoomSelect(roomId);
  };

  const handleResetZoom = () => {
    setZoomedRoom(null);
    onClearSelection();
  };

  const currentZoom = zoomedRoom !== null ? ROOM_REGIONS[zoomedRoom] : null;

  return (
    <div className="relative h-full w-full overflow-hidden map-2d-background">
      {/* Reset Zoom Button */}
      {zoomedRoom !== null && (
        <div
          className="absolute left-1/2 top-20 z-30 -translate-x-1/2 transition-opacity duration-300"
          style={{ opacity: zoomedRoom !== null ? 1 : 0 }}
        >
          <Button
            onClick={handleResetZoom}
            variant="outline"
            size="sm"
            className="map-2d-button"
          >
            <Home className="mr-2 h-4 w-4" />
            Full View
          </Button>
        </div>
      )}

      {/* SVG Floorplan */}
      <svg
        viewBox="0 0 800 600"
        className="h-full w-full"
        style={{
          transform: currentZoom
            ? `scale(${currentZoom.scale}) translate(${currentZoom.translateX}px, ${currentZoom.translateY}px)`
            : 'scale(1) translate(0, 0)',
          transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* House Outline - Black with Gold Border */}
        <rect
          x="50"
          y="50"
          width="700"
          height="500"
          fill="oklch(0.08 0 0)"
          stroke="oklch(0.75 0.18 85)"
          strokeWidth="4"
          rx="8"
        />

        {/* Room Regions */}
        {rooms.map((room) => {
          const region = ROOM_REGIONS[room.id];
          if (!region) return null;

          const isActive = activeRoomId === room.id;
          const isZoomed = zoomedRoom === room.id;

          return (
            <g key={room.id}>
              {/* Room Rectangle */}
              <rect
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                fill={
                  isActive
                    ? 'oklch(0.75 0.18 85 / 0.25)'
                    : 'oklch(0.12 0 0 / 0.8)'
                }
                stroke={
                  isActive
                    ? 'oklch(0.85 0.15 85)'
                    : 'oklch(0.65 0.20 85 / 0.4)'
                }
                strokeWidth={isActive ? '3' : '2'}
                className="map-2d-room cursor-pointer transition-all"
                style={{
                  filter: isActive ? 'drop-shadow(0 0 12px oklch(0.75 0.18 85 / 0.6))' : 'none',
                }}
                onClick={() => handleRoomClick(room.id)}
                rx="4"
              />

              {/* Room Label */}
              <text
                x={region.x + region.width / 2}
                y={region.y + region.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? 'oklch(0.95 0.15 85)' : 'oklch(0.75 0.18 85 / 0.9)'}
                fontSize={isZoomed ? '28' : '18'}
                fontWeight={isActive ? '700' : '500'}
                className="pointer-events-none select-none font-serif map-2d-label"
                style={{
                  textShadow: isActive 
                    ? '0 0 8px oklch(0.75 0.18 85 / 0.8), 0 2px 4px oklch(0 0 0 / 0.8)' 
                    : '0 1px 2px oklch(0 0 0 / 0.6)',
                }}
              >
                {room.name}
              </text>

              {/* Zoom Icon Hint */}
              {!isZoomed && (
                <g
                  opacity="0.7"
                  className="pointer-events-none"
                  transform={`translate(${region.x + region.width - 30}, ${region.y + 10})`}
                >
                  <circle cx="12" cy="12" r="10" fill="oklch(0.75 0.18 85 / 0.15)" stroke="oklch(0.75 0.18 85 / 0.5)" strokeWidth="1.5" />
                  <ZoomIn
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    stroke="oklch(0.85 0.15 85)"
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Doors/Connections - Gold Accent */}
        <line
          x1="400"
          y1="300"
          x2="400"
          y2="350"
          stroke="oklch(0.75 0.18 85 / 0.6)"
          strokeWidth="4"
          strokeDasharray="8,4"
        />
      </svg>

      {/* Legend */}
      <div className="map-2d-legend">
        <h3 className="mb-2 text-sm font-semibold text-gold-light">Legend</h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border-2 border-gold bg-gold/30 shadow-gold-glow-sm" />
            <span className="text-gold-light">Active Room</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-gold-dark/60 bg-black/80" />
            <span className="text-gold-dark">Available Room</span>
          </div>
        </div>
      </div>
    </div>
  );
}
