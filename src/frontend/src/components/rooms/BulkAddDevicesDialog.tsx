import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2 } from 'lucide-react';
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
import { ScrollArea } from '../ui/scroll-area';
import { useCreateDevice, useGenerateNextDeviceId } from '../../hooks/useQueries';
import { useAutoProvisionUser } from '../../hooks/useAutoProvisionUser';
import { AccessIssueCallout } from '../security/AccessIssueCallout';
import { classifyAuthError } from '../../utils/authErrors';
import type { RoomId } from '../../backend';

interface BulkAddDevicesDialogProps {
  roomId: RoomId;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Bulk device creation dialog with backend-allocated device IDs per device, authorization error handling, retry provisioning support, and optional success callback for immediate parent refetch.
 */
export function BulkAddDevicesDialog({ roomId, open: controlledOpen, onOpenChange, onSuccess }: BulkAddDevicesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [deviceCount, setDeviceCount] = useState(3);
  const [deviceNames, setDeviceNames] = useState<string[]>(['', '', '']);
  const [authError, setAuthError] = useState<string | null>(null);
  const [idAllocationError, setIdAllocationError] = useState<string | null>(null);
  const [shouldRetryAfterProvision, setShouldRetryAfterProvision] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createDevice = useCreateDevice();
  const generateDeviceId = useGenerateNextDeviceId();
  const provisioningState = useAutoProvisionUser();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setDeviceCount(3);
      setDeviceNames(['', '', '']);
      setAuthError(null);
      setIdAllocationError(null);
      setShouldRetryAfterProvision(false);
      setIsCreating(false);
    }
  }, [isOpen]);

  // Auto-retry after successful provisioning
  useEffect(() => {
    if (shouldRetryAfterProvision && provisioningState.isSuccess) {
      setShouldRetryAfterProvision(false);
      handleBulkCreate();
    }
  }, [shouldRetryAfterProvision, provisioningState.isSuccess]);

  // Update device names array when count changes
  useEffect(() => {
    setDeviceNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < deviceCount) {
        newNames.push('');
      }
      return newNames.slice(0, deviceCount);
    });
  }, [deviceCount]);

  const handleBulkCreate = async () => {
    setAuthError(null);
    setIdAllocationError(null);
    setIsCreating(true);

    try {
      // Create devices one by one with backend-allocated IDs
      for (let i = 0; i < deviceCount; i++) {
        const name = deviceNames[i].trim() || `Device ${i + 1}`;
        
        // Request backend-allocated device ID for each device
        const deviceId = await generateDeviceId.mutateAsync();

        await createDevice.mutateAsync({
          deviceId,
          name,
          roomId,
          isOn: false,
          brightness: 100,
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to create devices:', error);
      
      // Check if it's an ID allocation error
      if (error.message && error.message.includes('Maximum device ID limit')) {
        setIdAllocationError('You have reached the maximum number of devices (256). Some devices may have been created. Please check the device list.');
        setIsCreating(false);
        return;
      }

      const errorClassification = classifyAuthError(error);
      if (errorClassification.isAuthError) {
        setAuthError(errorClassification.message);
        if (errorClassification.suggestRetryProvisioning) {
          setShouldRetryAfterProvision(true);
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetryComplete = () => {
    // Provisioning retry completed successfully, form will auto-submit via useEffect
  };

  const allNamesValid = deviceNames.every(
    (name) => name.trim().length >= 2 && name.trim().length <= 50
  );

  const triggerButton = (
    <Button variant="outline" className="gap-2 shadow-gold-glow-sm">
      <Plus className="h-4 w-4" />
      Bulk Add
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledOpen && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl glass-surface border-border">
        <DialogHeader>
          <DialogTitle>Bulk Add Devices</DialogTitle>
          <DialogDescription>
            Add multiple devices to this room at once. Specify how many devices you want to add and provide names for each.
          </DialogDescription>
        </DialogHeader>

        {authError && (
          <AccessIssueCallout
            message={authError}
            onRetryComplete={handleRetryComplete}
          />
        )}

        {idAllocationError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{idAllocationError}</p>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device-count">Number of Devices</Label>
            <Input
              id="device-count"
              type="number"
              min={1}
              max={20}
              value={deviceCount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 20) {
                  setDeviceCount(value);
                }
              }}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Choose between 1 and 20 devices
            </p>
          </div>

          <div className="space-y-2">
            <Label>Device Names</Label>
            <ScrollArea className="h-64 rounded-md border border-border p-4">
              <div className="space-y-3">
                {deviceNames.map((name, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`device-${index}`} className="text-xs text-muted-foreground">
                      Device {index + 1}
                    </Label>
                    <Input
                      id={`device-${index}`}
                      placeholder={`Device ${index + 1}`}
                      value={name}
                      onChange={(e) => {
                        const newNames = [...deviceNames];
                        newNames[index] = e.target.value;
                        setDeviceNames(newNames);
                      }}
                      disabled={isCreating}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      {name.length}/50 characters (minimum 2)
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkCreate}
            disabled={!allNamesValid || isCreating}
            className="gap-2 shadow-gold-glow-sm"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating {deviceCount} Devices...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create {deviceCount} Devices
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
