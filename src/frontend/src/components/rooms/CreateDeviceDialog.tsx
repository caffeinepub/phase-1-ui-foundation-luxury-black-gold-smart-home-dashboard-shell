import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
import { useCreateDevice, useGenerateNextDeviceId } from '../../hooks/useQueries';
import { useAutoProvisionUser } from '../../hooks/useAutoProvisionUser';
import { AccessIssueCallout } from '../security/AccessIssueCallout';
import { classifyAuthError } from '../../utils/authErrors';
import type { RoomId } from '../../backend';

interface CreateDeviceDialogProps {
  roomId: RoomId;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Device creation dialog with backend-allocated device IDs, authorization error handling, retry provisioning support, and optional success callback for immediate parent refetch.
 */
export function CreateDeviceDialog({ roomId, open: controlledOpen, onOpenChange, onSuccess }: CreateDeviceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [idAllocationError, setIdAllocationError] = useState<string | null>(null);
  const [shouldRetryAfterProvision, setShouldRetryAfterProvision] = useState(false);

  const createDevice = useCreateDevice();
  const generateDeviceId = useGenerateNextDeviceId();
  const provisioningState = useAutoProvisionUser();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setDeviceName('');
      setAuthError(null);
      setIdAllocationError(null);
      setShouldRetryAfterProvision(false);
    }
  }, [isOpen]);

  // Auto-retry after successful provisioning
  useEffect(() => {
    if (shouldRetryAfterProvision && provisioningState.isSuccess && deviceName.trim()) {
      setShouldRetryAfterProvision(false);
      handleCreateDevice();
    }
  }, [shouldRetryAfterProvision, provisioningState.isSuccess]);

  const handleCreateDevice = async () => {
    if (!deviceName.trim()) return;

    setAuthError(null);
    setIdAllocationError(null);

    try {
      // Request backend-allocated device ID
      const deviceId = await generateDeviceId.mutateAsync();

      await createDevice.mutateAsync({
        deviceId,
        name: deviceName.trim(),
        roomId,
        isOn: false,
        brightness: 100,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to create device:', error);
      
      // Check if it's an ID allocation error
      if (error.message && error.message.includes('Maximum device ID limit')) {
        setIdAllocationError('You have reached the maximum number of devices (256). Please delete some devices before adding new ones.');
        return;
      }

      const errorClassification = classifyAuthError(error);
      if (errorClassification.isAuthError) {
        setAuthError(errorClassification.message);
        if (errorClassification.suggestRetryProvisioning) {
          setShouldRetryAfterProvision(true);
        }
      }
    }
  };

  const handleRetryComplete = () => {
    // Provisioning retry completed successfully, form will auto-submit via useEffect
  };

  const isCreating = createDevice.isPending || generateDeviceId.isPending;
  const isValid = deviceName.trim().length >= 2 && deviceName.trim().length <= 50;

  const triggerButton = (
    <Button variant="outline" className="gap-2 shadow-gold-glow-sm">
      <Plus className="h-4 w-4" />
      Add Device
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledOpen && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-md glass-surface border-border">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Create a new device in this room. Enter a name for the device.
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
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              placeholder="e.g., Ceiling Light"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid && !isCreating) {
                  handleCreateDevice();
                }
              }}
              disabled={isCreating}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {deviceName.length}/50 characters (minimum 2)
            </p>
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
            onClick={handleCreateDevice}
            disabled={!isValid || isCreating}
            className="gap-2 shadow-gold-glow-sm"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Device
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
