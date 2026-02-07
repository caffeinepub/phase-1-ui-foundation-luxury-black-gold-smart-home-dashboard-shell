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
import { useCreateRoom, useGetAllRooms } from '../../hooks/useQueries';
import { useAutoProvisionUser } from '../../hooks/useAutoProvisionUser';
import { classifyAuthError } from '../../utils/authErrors';
import { AccessIssueCallout } from '../security/AccessIssueCallout';

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomColor, setRoomColor] = useState('#ffffff');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState<{ message: string; suggestRetry: boolean } | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const createRoom = useCreateRoom();
  const { data: rooms = [] } = useGetAllRooms();
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

    // Check 100-room cap
    if (rooms.length >= 100) {
      setError('Maximum of 100 rooms reached. Please delete or hide existing rooms.');
      return;
    }

    // Validation
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    if (roomName.trim().length < 2) {
      setError('Room name must be at least 2 characters');
      return;
    }

    if (roomName.trim().length > 50) {
      setError('Room name must be less than 50 characters');
      return;
    }

    // Validate color format (hex)
    if (!/^#[0-9A-Fa-f]{6}$/.test(roomColor)) {
      setError('Color must be a valid hex code (e.g., #ffffff)');
      return;
    }

    // Find next available room ID in range 0-99
    const usedIds = new Set(rooms.map((r) => r.id));
    let nextRoomId: number | null = null;
    for (let i = 0; i < 100; i++) {
      if (!usedIds.has(i)) {
        nextRoomId = i;
        break;
      }
    }

    if (nextRoomId === null) {
      setError('No available room IDs. Maximum of 100 rooms reached.');
      return;
    }

    try {
      await createRoom.mutateAsync({
        roomId: nextRoomId,
        name: roomName.trim(),
        color: roomColor,
        isHidden: false,
      });
      setRoomName('');
      setRoomColor('#ffffff');
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
        setError(authErrorInfo.message || 'Failed to create room. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitInternal();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRoomName('');
      setRoomColor('#ffffff');
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
        <Button className="gap-2 bg-primary text-primary-foreground shadow-gold-glow-sm hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
            <DialogDescription>
              Add a new room to organize your smart home devices. Maximum 100 rooms.
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
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g., Kitchen, Bedroom, Office"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={createRoom.isPending || pendingSubmit}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-color">Room Color</Label>
              <div className="flex gap-2">
                <Input
                  id="room-color"
                  type="color"
                  value={roomColor}
                  onChange={(e) => setRoomColor(e.target.value)}
                  disabled={createRoom.isPending || pendingSubmit}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={roomColor}
                  onChange={(e) => setRoomColor(e.target.value)}
                  placeholder="#ffffff"
                  disabled={createRoom.isPending || pendingSubmit}
                  className="flex-1"
                />
              </div>
            </div>
            {error && !authError && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createRoom.isPending || pendingSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRoom.isPending || pendingSubmit}
              className="shadow-gold-glow-sm"
            >
              {createRoom.isPending || pendingSubmit ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
