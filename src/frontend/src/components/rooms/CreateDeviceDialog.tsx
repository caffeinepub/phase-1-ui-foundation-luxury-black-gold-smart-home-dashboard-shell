import { useState, useEffect } from 'react';
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
import { useAutoProvisionUser } from '../../hooks/useAutoProvisionUser';
import { classifyAuthError } from '../../utils/authErrors';
import { AccessIssueCallout } from '../security/AccessIssueCallout';
import type { RoomId } from '../../backend';

interface CreateDeviceDialogProps {
  roomId: RoomId;
}

export function CreateDeviceDialog({ roomId }: CreateDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState([128]);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState<{ message: string; suggestRetry: boolean } | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const createDevice = useCreateDevice();
  const { data: allDevices = [] } = useGetAllDevices();
  const provisioningState = useAutoProvisionUser();

  // Auto-retry submission after successful provisioning
  useEffect(() => {
    if (pendingSubmit && provisioningState.isSuccess && !provisioningState.isLoading) {
      setPendingSubmit(false);
      setAuthError(null);
      // Retry the submission
      handleSubmitInternal();
    }
  }, [provisioningState.isSuccess, provisioningState.isLoading, pendingSubmit]);

  const handleSubmitInternal = async () => {
    setError('');
    setAuthError(null);

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

    // Find next available device ID
    const usedIds = new Set(allDevices.map(([id]) => id));
    let nextDeviceId = 0;
    while (usedIds.has(nextDeviceId)) {
      nextDeviceId++;
      if (nextDeviceId > 255) {
        setError('Maximum number of devices reached (256)');
        return;
      }
    }

    try {
      await createDevice.mutateAsync({
        deviceId: nextDeviceId,
        name: deviceName.trim(),
        roomId,
        isOn,
        brightness: brightness[0],
      });
      setDeviceName('');
      setIsOn(false);
      setBrightness([128]);
      setOpen(false);
    } catch (err: any) {
      const authErrorInfo = classifyAuthError(err);
      
      if (authErrorInfo.isAuthError && authErrorInfo.suggestRetryProvisioning) {
        setAuthError({
          message: authErrorInfo.message,
          suggestRetry: true,
        });
        setPendingSubmit(true);
      } else {
        setError(authErrorInfo.message || 'Failed to create device. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitInternal();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDeviceName('');
      setIsOn(false);
      setBrightness([128]);
      setError('');
      setAuthError(null);
      setPendingSubmit(false);
    }
    setOpen(newOpen);
  };

  const handleRetryComplete = () => {
    // Provisioning completed, form will auto-retry via useEffect
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 shadow-gold-glow-sm">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Add a new smart device to this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {authError && authError.suggestRetry && (
              <AccessIssueCallout
                message={authError.message}
                onRetryComplete={handleRetryComplete}
              />
            )}
            <div className="grid gap-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g., Ceiling Light, Floor Lamp"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={createDevice.isPending || pendingSubmit}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="device-power">Power</Label>
                <p className="text-xs text-muted-foreground">
                  Turn device on by default
                </p>
              </div>
              <Switch
                id="device-power"
                checked={isOn}
                onCheckedChange={setIsOn}
                disabled={createDevice.isPending || pendingSubmit}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="device-brightness">Brightness</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round((brightness[0] / 255) * 100)}%
                </span>
              </div>
              <Slider
                id="device-brightness"
                value={brightness}
                onValueChange={setBrightness}
                max={255}
                step={1}
                disabled={createDevice.isPending || pendingSubmit}
                className="w-full"
              />
            </div>
            {error && !authError && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createDevice.isPending || pendingSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDevice.isPending || pendingSubmit}
              className="shadow-gold-glow-sm"
            >
              {createDevice.isPending || pendingSubmit ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
