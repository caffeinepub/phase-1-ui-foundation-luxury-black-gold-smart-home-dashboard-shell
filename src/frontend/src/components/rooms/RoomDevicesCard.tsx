import { Home, Lightbulb, ChevronRight } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { RoomSettingsDialog } from './RoomSettingsDialog';
import type { RoomInfo, DeviceId, LightDevice } from '../../backend';
import { memo } from 'react';

interface RoomDevicesCardProps {
  room: RoomInfo;
  devices: Array<[DeviceId, LightDevice]>;
  onOpenRoom: (room: RoomInfo) => void;
}

const DeviceTile = memo(function DeviceTile({
  deviceId,
  device,
}: {
  deviceId: DeviceId;
  device: LightDevice;
}) {
  return (
    <div
      key={deviceId}
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3 backdrop-blur-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Lightbulb className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{device.name}</p>
        <p className="text-xs text-muted-foreground">
          {device.isOn ? 'On' : 'Off'} • {Math.round((device.brightness / 255) * 100)}%
        </p>
      </div>
      <Badge variant={device.isOn ? 'default' : 'secondary'} className="text-xs">
        {device.isOn ? 'Active' : 'Idle'}
      </Badge>
    </div>
  );
});

export function RoomDevicesCard({ room, devices, onOpenRoom }: RoomDevicesCardProps) {
  return (
    <GlassCard disableTilt>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${room.color}20` }}
            >
              <Home className="h-6 w-6" style={{ color: room.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{room.name}</CardTitle>
                <div
                  className="h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: room.color }}
                  title={`Room color: ${room.color}`}
                />
              </div>
              <CardDescription>Room ID: {room.id}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {devices.length} {devices.length === 1 ? 'Device' : 'Devices'}
            </Badge>
            <RoomSettingsDialog room={room} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenRoom(room)}
              className="gap-2 shadow-gold-glow-sm"
            >
              Open
              <ChevronRight className="h-4 w-4" />
            </Button>
            <CreateDeviceDialog roomId={room.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {devices.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Devices</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map(([deviceId, device]) => (
                <DeviceTile key={deviceId} deviceId={deviceId} device={device} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No devices in this room yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click "Add Device" to get started
            </p>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
