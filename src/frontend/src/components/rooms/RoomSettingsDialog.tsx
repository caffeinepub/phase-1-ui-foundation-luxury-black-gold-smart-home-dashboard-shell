import { useState } from 'react';
import { Settings } from 'lucide-react';
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
import { useUpdateRoomSettings, useSetRoomHidden } from '../../hooks/useQueries';
import type { RoomInfo } from '../../backend';

interface RoomSettingsDialogProps {
  room: RoomInfo;
}

export function RoomSettingsDialog({ room }: RoomSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState(room.name);
  const [roomColor, setRoomColor] = useState(room.color);
  const [isHidden, setIsHidden] = useState(room.isHidden);
  const [error, setError] = useState('');

  const updateSettings = useUpdateRoomSettings();
  const setHidden = useSetRoomHidden();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    try {
      // Update name and color
      await updateSettings.mutateAsync({
        roomId: room.id,
        name: roomName.trim(),
        color: roomColor,
      });

      // Update hidden state if changed
      if (isHidden !== room.isHidden) {
        await setHidden.mutateAsync({
          roomId: room.id,
          isHidden,
        });
      }

      setOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update room settings. Please try again.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setRoomName(room.name);
      setRoomColor(room.color);
      setIsHidden(room.isHidden);
      setError('');
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Room Settings</DialogTitle>
            <DialogDescription>
              Customize the name, color, and visibility of this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g., Kitchen, Bedroom, Office"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={updateSettings.isPending || setHidden.isPending}
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
                  disabled={updateSettings.isPending || setHidden.isPending}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={roomColor}
                  onChange={(e) => setRoomColor(e.target.value)}
                  placeholder="#ffffff"
                  disabled={updateSettings.isPending || setHidden.isPending}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="room-hidden">Hide Room</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden rooms won't appear in the default list
                </p>
              </div>
              <Switch
                id="room-hidden"
                checked={isHidden}
                onCheckedChange={setIsHidden}
                disabled={updateSettings.isPending || setHidden.isPending}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateSettings.isPending || setHidden.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateSettings.isPending || setHidden.isPending}
              className="shadow-gold-glow-sm"
            >
              {updateSettings.isPending || setHidden.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
