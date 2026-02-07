import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { useCreateDevice, useGetAllDevices } from '../../hooks/useQueries';
import type { RoomId } from '../../backend';

interface CreateDeviceDialogProps {
  roomId: RoomId;
}

export function CreateDeviceDialog({ roomId }: CreateDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(128);
  const [error, setError] = useState('');

  const createDevice = useCreateDevice();
  const { data: allDevices = [] } = useGetAllDevices();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    if (deviceName.trim().length < 2) {
      setError('Device name must be at least 2 characters');
      return;
    }

    if (deviceName.trim().length > 50) {
      setError('Device name must be less than 50 characters');
      return;
    }

    // Generate next device ID
    const maxId = allDevices.length > 0 ? Math.max(...allDevices.map(([id]) => id)) : -1;
    const nextDeviceId = maxId + 1;

    try {
      await createDevice.mutateAsync({
        deviceId: nextDeviceId,
        name: deviceName.trim(),
        roomId,
        isOn,
        brightness: Math.min(Math.max(brightness, 0), 255),
      });
      setDeviceName('');
      setIsOn(false);
      setBrightness(128);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create device. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-primary/30 hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Add a new light device to this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g., Ceiling Light, Desk Lamp"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={createDevice.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="device-power">Power</Label>
              <Switch
                id="device-power"
                checked={isOn}
                onCheckedChange={setIsOn}
                disabled={createDevice.isPending}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="device-brightness">Brightness</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((brightness / 255) * 100)}%
                </span>
              </div>
              <Slider
                id="device-brightness"
                min={0}
                max={255}
                step={1}
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                disabled={createDevice.isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createDevice.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDevice.isPending}>
              {createDevice.isPending ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
