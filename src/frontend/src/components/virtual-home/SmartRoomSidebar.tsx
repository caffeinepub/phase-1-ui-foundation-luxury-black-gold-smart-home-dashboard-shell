import { X, Power, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useToggleAllDevicesInRoom } from '../../hooks/useQueries';
import type { RoomId, DeviceId, LightDevice } from '../../backend';

interface SmartRoomSidebarProps {
  roomId: RoomId;
  devices: Array<[DeviceId, LightDevice]>;
  onClose: () => void;
}

/**
 * Compact semi-transparent glassmorphism sidebar showing active device count and master ON/OFF controls for a room.
 */
export function SmartRoomSidebar({ roomId, devices, onClose }: SmartRoomSidebarProps) {
  const toggleAllMutation = useToggleAllDevicesInRoom();

  const activeDeviceCount = devices.filter(([, device]) => device.isOn).length;
  const totalDeviceCount = devices.length;
  const allOn = totalDeviceCount > 0 && activeDeviceCount === totalDeviceCount;
  const allOff = activeDeviceCount === 0;

  const handleAllOn = async () => {
    try {
      await toggleAllMutation.mutateAsync({ roomId, turnOn: true });
    } catch (error) {
      console.error('Failed to turn on all devices:', error);
    }
  };

  const handleAllOff = async () => {
    try {
      await toggleAllMutation.mutateAsync({ roomId, turnOn: false });
    } catch (error) {
      console.error('Failed to turn off all devices:', error);
    }
  };

  return (
    <div className="fixed right-4 top-20 z-40 w-72">
      <Card className="glass-surface border-primary/40 bg-background/80 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Room Control
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Devices Count */}
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Active Devices</p>
              <p className="text-lg font-bold text-foreground">
                {activeDeviceCount} / {totalDeviceCount}
              </p>
            </div>
          </div>

          {/* Master Controls */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Master Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAllOn}
                disabled={toggleAllMutation.isPending || allOn || totalDeviceCount === 0}
                variant="outline"
                size="sm"
                className="border-primary/40 hover:bg-primary/20 disabled:opacity-50"
              >
                <Power className="mr-1 h-3 w-3" />
                All ON
              </Button>
              <Button
                onClick={handleAllOff}
                disabled={toggleAllMutation.isPending || allOff || totalDeviceCount === 0}
                variant="outline"
                size="sm"
                className="border-primary/40 hover:bg-primary/20 disabled:opacity-50"
              >
                <Power className="mr-1 h-3 w-3" />
                All OFF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
