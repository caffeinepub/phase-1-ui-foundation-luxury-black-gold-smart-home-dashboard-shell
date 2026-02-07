import { Home, Settings } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { RoomSettingsDialog } from './RoomSettingsDialog';
import { useToggleRoomRunningState } from '../../hooks/useQueries';
import type { RoomInfo } from '../../backend';
import { memo } from 'react';

interface RoomDevicesCardProps {
  room: RoomInfo;
  onOpenRoomDetails: (room: RoomInfo) => void;
  onSelectForSidebar?: (room: RoomInfo) => void;
}

/**
 * Clickable room card component that navigates to room details page on click, with settings and device creation controls.
 */
export const RoomDevicesCard = memo(function RoomDevicesCard({ room, onOpenRoomDetails, onSelectForSidebar }: RoomDevicesCardProps) {
  const toggleRunning = useToggleRoomRunningState();

  const handleCardClick = () => {
    onOpenRoomDetails(room);
  };

  const handleToggleRunning = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleRunning.mutateAsync(room.id);
    } catch (error) {
      console.error('Failed to toggle room running state:', error);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCreateDeviceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <GlassCard 
      disableTilt 
      className="cursor-pointer transition-all hover:shadow-gold-glow-md"
      onClick={handleCardClick}
    >
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
          <div className="flex items-center gap-2" onClick={handleSettingsClick}>
            {room.isHidden && (
              <Badge variant="secondary" className="text-xs">
                Hidden
              </Badge>
            )}
            <RoomSettingsDialog room={room} />
            <div onClick={handleCreateDeviceClick}>
              <CreateDeviceDialog roomId={room.id} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant={room.isRunning ? 'default' : 'secondary'} className="text-xs">
            {room.isRunning ? 'Running' : 'Stopped'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-gold-glow-sm"
          >
            <Settings className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
});
