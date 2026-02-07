import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { useCreateDevice, useGetAllDevices } from '../../hooks/useQueries';
import { useState } from 'react';
import type { RoomId } from '../../backend';
import { classifyAuthError } from '../../utils/authErrors';
import { AccessIssueCallout } from '../security/AccessIssueCallout';

interface BulkAddDevicesDialogProps {
  roomId: RoomId;
}

export function BulkAddDevicesDialog({ roomId }: BulkAddDevicesDialogProps) {
  const [open, setOpen] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number>(1);
  const [deviceNames, setDeviceNames] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const createDevice = useCreateDevice();
  const { data: allDevices = [] } = useGetAllDevices();

  const handleDeviceCountChange = (value: string) => {
    const count = parseInt(value, 10);
    setDeviceCount(count);
    
    // Adjust device names array
    const newNames = Array(count).fill('').map((_, i) => deviceNames[i] || '');
    setDeviceNames(newNames);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...deviceNames];
    newNames[index] = value;
    setDeviceNames(newNames);
  };

  const validateNames = (): boolean => {
    return deviceNames.every((name) => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    });
  };

  const getNextAvailableDeviceIds = (count: number): number[] => {
    const usedIds = new Set(allDevices.map(([id]) => id));
    const availableIds: number[] = [];
    
    for (let id = 1; id <= 255 && availableIds.length < count; id++) {
      if (!usedIds.has(id)) {
        availableIds.push(id);
      }
    }
    
    return availableIds;
  };

  const handleSubmit = async () => {
    if (!validateNames()) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const deviceIds = getNextAvailableDeviceIds(deviceCount);
      
      if (deviceIds.length < deviceCount) {
        throw new Error(`Only ${deviceIds.length} device IDs available. Cannot create ${deviceCount} devices.`);
      }

      // Create all devices
      for (let i = 0; i < deviceCount; i++) {
        await createDevice.mutateAsync({
          deviceId: deviceIds[i],
          name: deviceNames[i].trim(),
          roomId,
          isOn: false,
          brightness: 100,
        });
      }

      // Reset and close
      setDeviceNames(['']);
      setDeviceCount(1);
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to create devices:', error);
      const authIssue = classifyAuthError(error);
      if (authIssue) {
        setAuthError(authIssue.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDeviceNames(['']);
      setDeviceCount(1);
      setAuthError(null);
    }
    setOpen(newOpen);
  };

  const handleRetryComplete = () => {
    setAuthError(null);
    // Retry the submission after provisioning completes
    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  const isValid = validateNames();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-gold-glow-sm">
          <Plus className="h-4 w-4" />
          Bulk Add Devices
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Devices</DialogTitle>
          <DialogDescription>
            Add multiple devices to this room at once
          </DialogDescription>
        </DialogHeader>

        {authError && (
          <AccessIssueCallout
            message={authError}
            onRetryComplete={handleRetryComplete}
          />
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-count">Number of Devices</Label>
            <Select value={deviceCount.toString()} onValueChange={handleDeviceCountChange}>
              <SelectTrigger id="device-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Device' : 'Devices'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Device Names</Label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {deviceNames.map((name, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`device-${index}`} className="text-xs text-muted-foreground">
                      Device {index + 1}
                    </Label>
                    <Input
                      id={`device-${index}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Device ${index + 1} name`}
                      maxLength={50}
                    />
                    {name.trim().length > 0 && (name.trim().length < 2 || name.trim().length > 50) && (
                      <p className="text-xs text-destructive">
                        Name must be between 2 and 50 characters
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="shadow-gold-glow-sm">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${deviceCount} ${deviceCount === 1 ? 'Device' : 'Devices'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
