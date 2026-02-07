import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useUpdateRoomSettings } from '../../hooks/useQueries';
import type { RoomInfo } from '../../backend';

interface RoomTileProps {
  room: RoomInfo;
  onClick: () => void;
}

/**
 * Simple rectangular RoomTile component that displays room id and room name with color-derived styling and inline editing for name and hex color with auto-generated default names.
 */
export function RoomTile({ room, onClick }: RoomTileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(room.name);
  const [editColor, setEditColor] = useState(room.color);
  const updateSettings = useUpdateRoomSettings();

  // Use the room name from backend (which already has "Room N" as default)
  const displayName = room.name || `Room ${room.id}`;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(room.name);
    setEditColor(room.color);
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Validate name
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      return;
    }

    // Validate color (basic hex validation)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    const colorToSave = editColor.startsWith('#') ? editColor : `#${editColor}`;
    if (!hexColorRegex.test(colorToSave)) {
      return;
    }

    try {
      await updateSettings.mutateAsync({
        roomId: room.id,
        name: trimmedName,
        color: colorToSave,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update room settings:', error);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(room.name);
    setEditColor(room.color);
    setIsEditing(false);
  };

  const handleTileClick = () => {
    if (!isEditing) {
      onClick();
    }
  };

  if (isEditing) {
    return (
      <GlassCard
        disableTilt
        className="p-4 transition-all"
      >
        <div 
          className="space-y-4 border-l-4" 
          style={{ borderLeftColor: room.color }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-gold-glow-sm"
                style={{ backgroundColor: room.color, color: '#fff' }}
              >
                {room.id}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Edit Room
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={updateSettings.isPending}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`room-name-${room.id}`} className="text-xs">
                Room Name
              </Label>
              <Input
                id={`room-name-${room.id}`}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter room name"
                className="h-9"
                maxLength={50}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`room-color-${room.id}`} className="text-xs">
                Room Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`room-color-${room.id}`}
                  type="color"
                  value={editColor.startsWith('#') ? editColor : `#${editColor}`}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-9 w-16 p-1 cursor-pointer"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#RRGGBB"
                  className="h-9 flex-1 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      disableTilt
      className="cursor-pointer transition-all hover:shadow-gold-glow-md group"
      onClick={handleTileClick}
    >
      <div 
        className="p-4 relative border-l-4" 
        style={{ 
          borderLeftColor: room.color,
          background: `linear-gradient(135deg, ${room.color}08 0%, transparent 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-gold-glow-sm flex-shrink-0"
              style={{ backgroundColor: room.color, color: '#fff' }}
            >
              {room.id}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Room #{room.id}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
