import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useUpdateRoomSettings } from '../../hooks/useQueries';
import { useState } from 'react';
import type { RoomInfo } from '../../backend';

interface RoomsEditModeOverlayProps {
  rooms: RoomInfo[];
  onClose: () => void;
}

export function RoomsEditModeOverlay({ rooms, onClose }: RoomsEditModeOverlayProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [newName, setNewName] = useState('');
  const updateRoom = useUpdateRoomSettings();

  const handleSelectRoom = (room: RoomInfo) => {
    setSelectedRoom(room);
    setNewName(room.name);
  };

  const handleSave = async () => {
    if (!selectedRoom || !newName.trim()) return;

    try {
      await updateRoom.mutateAsync({
        roomId: selectedRoom.id,
        name: newName.trim(),
        color: selectedRoom.color,
      });
      setSelectedRoom(null);
      setNewName('');
    } catch (error) {
      console.error('Failed to update room name:', error);
    }
  };

  const handleCancel = () => {
    setSelectedRoom(null);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <Card className="border-primary/20 shadow-gold-glow-lg bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Edit Room Names</CardTitle>
                <CardDescription>Select a room to rename</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedRoom ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/40 transition-all text-left"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full shrink-0"
                        style={{ backgroundColor: `${room.color}20` }}
                      >
                        <div
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: room.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{room.name}</p>
                        <p className="text-sm text-muted-foreground">Room ID: {room.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-primary/20 bg-accent/50">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: `${selectedRoom.color}20` }}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: selectedRoom.color }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Editing</p>
                    <p className="text-lg font-semibold text-foreground">{selectedRoom.name}</p>
                    <p className="text-sm text-muted-foreground">Room ID: {selectedRoom.id}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-name">New Room Name</Label>
                  <Input
                    id="room-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new room name"
                    maxLength={50}
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {newName.length}/50 characters
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateRoom.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!newName.trim() || newName === selectedRoom.name || updateRoom.isPending}
                    className="shadow-gold-glow-sm"
                  >
                    {updateRoom.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
