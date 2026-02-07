import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
import { Label } from '../../ui/label';
import { Lightbulb } from 'lucide-react';
import { useToggleDevice, useSetBrightness } from '../../../hooks/useQueries';
import type { DeviceId, LightDevice } from '../../../backend';

interface DeviceControlDialogProps {
  deviceId: DeviceId;
  device: LightDevice;
  open: boolean;
  onClose: () => void;
}

export function DeviceControlDialog({ deviceId, device, open, onClose }: DeviceControlDialogProps) {
  const toggleMutation = useToggleDevice();
  const brightnessMutation = useSetBrightness();

  const handleToggle = async () => {
    await toggleMutation.mutateAsync(deviceId);
  };

  const handleBrightnessChange = async (value: number[]) => {
    await brightnessMutation.mutateAsync({ deviceId, brightness: value[0] });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-surface border-primary/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            {device.name}
          </DialogTitle>
          <DialogDescription>
            Control your light device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Power Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="power-toggle" className="text-base">
              Power
            </Label>
            <Switch
              id="power-toggle"
              checked={device.isOn}
              onCheckedChange={handleToggle}
              disabled={toggleMutation.isPending}
            />
          </div>

          {/* Brightness Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="brightness-slider" className="text-base">
                Brightness
              </Label>
              <span className="text-sm text-muted-foreground">
                {Math.round((device.brightness / 255) * 100)}%
              </span>
            </div>
            <Slider
              id="brightness-slider"
              value={[device.brightness]}
              onValueChange={handleBrightnessChange}
              max={255}
              step={1}
              disabled={!device.isOn || brightnessMutation.isPending}
              className="w-full"
            />
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div
              className={`h-2 w-2 rounded-full ${
                device.isOn ? 'bg-primary animate-pulse' : 'bg-muted'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {device.isOn ? 'Device is ON' : 'Device is OFF'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
