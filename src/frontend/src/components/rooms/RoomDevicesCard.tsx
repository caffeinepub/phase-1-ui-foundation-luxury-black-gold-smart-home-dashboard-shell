import { Home, ChevronRight } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { RoomSettingsDialog } from './RoomSettingsDialog';
import type { RoomInfo } from '../../backend';
import { memo } from 'react';

interface RoomDevicesCardProps {
  room: RoomInfo;
  onOpenRoom: (room: RoomInfo) => void;
}

/**
 * Lightweight room card component displaying room metadata without fetching device data.
 * Device counts are shown only when the sidebar is opened for optimal list performance.
 */
export const RoomDevicesCard = memo(function RoomDevicesCard({ room, onOpenRoom }: RoomDevicesCardProps) {
  return (
    <GlassCard disableTilt>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full shadow-gold-glow-sm"
              style={{ backgroundColor: `${room.color}20` }}
            >
              <Home className="h-8 w-8" style={{ color: room.color }} />
            </div>
            <div>
              <CardTitle className="text-xl">{room.name}</CardTitle>
              <CardDescription>Room ID: {room.id}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {room.isHidden && (
              <Badge variant="secondary" className="text-xs">
                Hidden
              </Badge>
            )}
            <RoomSettingsDialog room={room} />
            <CreateDeviceDialog roomId={room.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Click to view device controls in the sidebar
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoom(room);
            }}
            className="gap-2 shadow-gold-glow-sm"
          >
            Open Dashboard
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
});
