import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Home } from 'lucide-react';
import type { RoomId, RoomInfo } from '../../backend';

interface RoomSelectorProps {
  rooms: RoomInfo[];
  open: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: RoomId) => void;
}

/**
 * Room selector dialog for choosing a room to teleport to in 3D mode.
 */
export function RoomSelector({ rooms, open, onClose, onSelectRoom }: RoomSelectorProps) {
  const handleSelect = (roomId: RoomId) => {
    onSelectRoom(roomId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-surface border-primary/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Home className="h-5 w-5 text-primary" />
            Select Room
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a room to teleport to in the 3D walkthrough.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {rooms.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No rooms available
              </p>
            ) : (
              rooms.map((room) => (
                <Button
                  key={room.id}
                  onClick={() => handleSelect(room.id)}
                  variant="outline"
                  className="w-full justify-start border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                >
                  <Home className="mr-2 h-4 w-4 text-primary" />
                  {room.name}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
