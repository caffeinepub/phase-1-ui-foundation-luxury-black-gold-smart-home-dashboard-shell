import { Lightbulb, Plus, Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { useGetDevicesByRoom, useToggleDevice, useSetBrightness } from '../../hooks/useQueries';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { BulkAddDevicesDialog } from './BulkAddDevicesDialog';
import { Skeleton } from '../ui/skeleton';
import type { RoomId, DeviceId } from '../../backend';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RoomDeviceListSectionProps {
  roomId: RoomId;
}

/**
 * Room-scoped device list section with add-device actions that immediately refetch devices after successful creation, replacing empty state with actual device cards without requiring manual page refresh.
 */
export function RoomDeviceListSection({ roomId }: RoomDeviceListSectionProps) {
  const { data: devices = [], isLoading, error, refetch } = useGetDevicesByRoom(roomId);
  const toggleDevice = useToggleDevice();
  const setBrightness = useSetBrightness();
  const queryClient = useQueryClient();

  const [brightnessValues, setBrightnessValues] = useState<Record<DeviceId, number>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);

  const handleToggleDevice = async (deviceId: DeviceId) => {
    try {
      await toggleDevice.mutateAsync(deviceId);
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  const handleBrightnessChange = (deviceId: DeviceId, value: number[]) => {
    setBrightnessValues((prev) => ({ ...prev, [deviceId]: value[0] }));
  };

  const handleBrightnessCommit = async (deviceId: DeviceId, value: number[]) => {
    try {
      await setBrightness.mutateAsync({ deviceId, brightness: value[0] });
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  const handleDeviceCreated = () => {
    // Immediately refetch devices for this room
    queryClient.invalidateQueries({ queryKey: ['devices', roomId] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} disableTilt>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard disableTilt>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Failed to Load Devices</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="shadow-gold-glow-sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header with Add Device Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Devices</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 shadow-gold-glow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkAddDialog(true)}
            className="gap-2 shadow-gold-glow-sm"
          >
            <Plus className="h-4 w-4" />
            Bulk Add
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {devices.length === 0 ? (
        <GlassCard disableTilt>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Lightbulb className="h-20 w-20 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">No Devices Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Add devices to this room to start controlling them.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="gap-2 shadow-gold-glow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Your First Device
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      ) : (
        /* Device List */
        <div className="grid gap-4 md:grid-cols-2">
          {devices.map(([deviceId, device]) => {
            const currentBrightness = brightnessValues[deviceId] ?? device.brightness;
            return (
              <GlassCard key={deviceId} disableTilt>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
                        <Lightbulb className={`h-5 w-5 ${device.isOn ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{device.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {device.isOn ? 'On' : 'Off'}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={device.isOn}
                      onCheckedChange={() => handleToggleDevice(deviceId)}
                      disabled={toggleDevice.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Brightness</span>
                      <span className="text-sm font-medium text-foreground">{currentBrightness}%</span>
                    </div>
                    <Slider
                      value={[currentBrightness]}
                      onValueChange={(value) => handleBrightnessChange(deviceId, value)}
                      onValueCommit={(value) => handleBrightnessCommit(deviceId, value)}
                      max={100}
                      step={1}
                      disabled={!device.isOn || setBrightness.isPending}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create Device Dialog */}
      <CreateDeviceDialog
        roomId={roomId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleDeviceCreated}
      />

      {/* Bulk Add Devices Dialog */}
      <BulkAddDevicesDialog
        roomId={roomId}
        open={showBulkAddDialog}
        onOpenChange={setShowBulkAddDialog}
        onSuccess={handleDeviceCreated}
      />
    </div>
  );
}
