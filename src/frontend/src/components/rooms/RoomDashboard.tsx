import { Home, Lightbulb, Power, Zap, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import {
  useGetDevicesByRoom,
  useToggleDevice,
  useSetBrightness,
  useToggleAllDevicesInRoom,
} from '../../hooks/useQueries';
import { BulkAddDevicesDialog } from './BulkAddDevicesDialog';
import type { RoomInfo, DeviceId } from '../../backend';
import { useState, useMemo } from 'react';

interface RoomDashboardProps {
  room: RoomInfo;
  onBack: () => void;
}

export function RoomDashboard({ room }: RoomDashboardProps) {
  const { data: devices = [], isLoading: devicesLoading, error: devicesError, refetch: refetchDevices } = useGetDevicesByRoom(room.id);
  const toggleDevice = useToggleDevice();
  const setBrightness = useSetBrightness();
  const toggleAllDevices = useToggleAllDevicesInRoom();

  const [brightnessValues, setBrightnessValues] = useState<Record<DeviceId, number>>({});

  const allDevicesOn = devices.length > 0 && devices.every(([, device]) => device.isOn);
  const anyDeviceOn = devices.some(([, device]) => device.isOn);

  // Device Statistics
  const deviceStats = useMemo(() => {
    const total = devices.length;
    const devicesOn = devices.filter(([, device]) => device.isOn).length;
    const devicesOff = total - devicesOn;
    return { total, devicesOn, devicesOff };
  }, [devices]);

  // Calculate electricity consumption based on active devices
  const electricityConsumption = useMemo(() => {
    // Simple calculation: each active device consumes ~0.1 kWh
    const activeDevices = devices.filter(([, device]) => device.isOn).length;
    return (activeDevices * 0.1).toFixed(1);
  }, [devices]);

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

  const handleMasterSwitch = async (turnOn: boolean) => {
    try {
      await toggleAllDevices.mutateAsync({ roomId: room.id, turnOn });
    } catch (error) {
      console.error('Failed to toggle all devices:', error);
    }
  };

  if (devicesLoading) {
    return (
      <div className="space-y-6">
        <GlassCard disableTilt>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  if (devicesError) {
    return (
      <div className="space-y-6">
        <GlassCard disableTilt>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Failed to Load Devices</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {devicesError instanceof Error ? devicesError.message : 'An unexpected error occurred.'}
                </p>
              </div>
              <Button onClick={() => refetchDevices()} variant="outline" className="shadow-gold-glow-sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{room.name}</CardTitle>
                <CardDescription>Room ID: {room.id}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              {devices.length} {devices.length === 1 ? 'Device' : 'Devices'}
            </Badge>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Device Statistics */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Device Statistics</CardTitle>
              <CardDescription>Overview of devices in this room</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/50 border border-border">
              <p className="text-3xl font-bold text-foreground">{deviceStats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Devices</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-3xl font-bold text-primary">{deviceStats.devicesOn}</p>
              <p className="text-sm text-muted-foreground mt-1">Devices On</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/50 border border-border">
              <p className="text-3xl font-bold text-muted-foreground">{deviceStats.devicesOff}</p>
              <p className="text-sm text-muted-foreground mt-1">Devices Off</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Electricity Consumption */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Electricity Consumption</CardTitle>
              <CardDescription>Current energy usage for this room</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">
                {electricityConsumption}
              </p>
              <p className="text-lg text-muted-foreground mt-2">kWh</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Master Switch */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
                <Power className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Master Switch</CardTitle>
                <CardDescription>Control all devices in this room</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {anyDeviceOn ? 'Some devices on' : 'All devices off'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant={allDevicesOn ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMasterSwitch(true)}
                  disabled={toggleAllDevices.isPending || devices.length === 0}
                  className={allDevicesOn ? 'shadow-gold-glow-sm' : ''}
                >
                  All On
                </Button>
                <Button
                  variant={!anyDeviceOn ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMasterSwitch(false)}
                  disabled={toggleAllDevices.isPending || devices.length === 0}
                  className={!anyDeviceOn ? 'shadow-gold-glow-sm' : ''}
                >
                  All Off
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Bulk Add Devices */}
      <div className="flex justify-end">
        <BulkAddDevicesDialog roomId={room.id} />
      </div>

      {/* Device Controls */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Device Controls</h3>
        {devices.length === 0 ? (
          <GlassCard disableTilt>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Lightbulb className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No Devices Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Add devices to this room to start controlling them.
                  </p>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        ) : (
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
                          <CardDescription className="text-xs">Device ID: {deviceId}</CardDescription>
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
      </div>
    </div>
  );
}
