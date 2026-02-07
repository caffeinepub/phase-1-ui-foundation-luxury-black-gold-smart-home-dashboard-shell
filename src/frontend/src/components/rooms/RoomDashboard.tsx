import { Home, Lightbulb, Power, Thermometer, Droplets, Loader2 } from 'lucide-react';
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
  useGetRoomSensorStats,
} from '../../hooks/useQueries';
import type { RoomInfo, DeviceId, LightDevice } from '../../backend';
import { useState } from 'react';

interface RoomDashboardProps {
  room: RoomInfo;
  onBack: () => void;
}

export function RoomDashboard({ room }: RoomDashboardProps) {
  const { data: devices = [], isLoading: devicesLoading } = useGetDevicesByRoom(room.id);
  const { data: sensorStats, isLoading: sensorsLoading } = useGetRoomSensorStats(room.id);
  const toggleDevice = useToggleDevice();
  const setBrightness = useSetBrightness();
  const toggleAllDevices = useToggleAllDevicesInRoom();

  const [brightnessValues, setBrightnessValues] = useState<Record<DeviceId, number>>({});

  const allDevicesOn = devices.length > 0 && devices.every(([, device]) => device.isOn);
  const anyDeviceOn = devices.some(([, device]) => device.isOn);

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
                  className="shadow-gold-glow-sm"
                >
                  {toggleAllDevices.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'All ON'
                  )}
                </Button>
                <Button
                  variant={!anyDeviceOn ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMasterSwitch(false)}
                  disabled={toggleAllDevices.isPending || devices.length === 0}
                  className="shadow-gold-glow-sm"
                >
                  {toggleAllDevices.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'All OFF'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Environmental Sensors */}
      {!sensorsLoading && sensorStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard disableTilt>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
                  <Thermometer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Temperature</CardTitle>
                  <CardDescription>Current room temperature</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {sensorStats.temperature.toFixed(1)}°C
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard disableTilt>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Humidity</CardTitle>
                  <CardDescription>Current room humidity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {sensorStats.humidity.toFixed(1)}%
              </div>
            </CardContent>
          </GlassCard>
        </div>
      )}

      {/* Device Controls */}
      <GlassCard disableTilt>
        <CardHeader>
          <CardTitle className="text-lg">Device Controls</CardTitle>
          <CardDescription>Quick toggles for all devices in this room</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map(([deviceId, device]) => {
                const currentBrightness =
                  brightnessValues[deviceId] !== undefined
                    ? brightnessValues[deviceId]
                    : device.brightness;

                return (
                  <div
                    key={deviceId}
                    className="flex flex-col gap-4 rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm shadow-gold-glow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((currentBrightness / 255) * 100)}% brightness
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={device.isOn ? 'default' : 'secondary'}>
                          {device.isOn ? 'On' : 'Off'}
                        </Badge>
                        <Switch
                          checked={device.isOn}
                          onCheckedChange={() => handleToggleDevice(deviceId)}
                          disabled={toggleDevice.isPending}
                          className="shadow-gold-glow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground min-w-[80px]">
                        Brightness
                      </span>
                      <Slider
                        value={[currentBrightness]}
                        onValueChange={(value) => handleBrightnessChange(deviceId, value)}
                        onValueCommit={(value) => handleBrightnessCommit(deviceId, value)}
                        max={255}
                        step={1}
                        disabled={!device.isOn || setBrightness.isPending}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium min-w-[50px] text-right">
                        {Math.round((currentBrightness / 255) * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No devices in this room yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Add devices to start controlling them
              </p>
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
