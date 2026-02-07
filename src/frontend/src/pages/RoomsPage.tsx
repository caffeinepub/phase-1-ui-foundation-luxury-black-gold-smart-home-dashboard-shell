import { ArrowLeft, DoorOpen, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useGetAllRooms, useGetAllDevices } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomDevicesCard } from '../components/rooms/RoomDevicesCard';
import { RoomDashboard } from '../components/rooms/RoomDashboard';
import { SmartRoomSidebar } from '../components/virtual-home/SmartRoomSidebar';
import { useMemo, useState } from 'react';
import type { RoomInfo, DeviceId, LightDevice } from '../backend';

export function RoomsPage() {
  const { data: rooms = [], isLoading: roomsLoading } = useGetAllRooms();
  const { data: allDevices = [], isLoading: devicesLoading } = useGetAllDevices();
  const [activeRoom, setActiveRoom] = useState<RoomInfo | null>(null);
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] = useState<RoomInfo | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  // Group devices by room ID for efficient lookup
  const devicesByRoom = useMemo(() => {
    const grouped = new Map<number, Array<[DeviceId, LightDevice]>>();
    allDevices.forEach(([deviceId, device]) => {
      const existing = grouped.get(device.roomId) || [];
      existing.push([deviceId, device]);
      grouped.set(device.roomId, existing);
    });
    return grouped;
  }, [allDevices]);

  // Filter rooms based on visibility
  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => showHidden || !room.isHidden);
  }, [rooms, showHidden]);

  const hiddenRoomsCount = useMemo(() => {
    return rooms.filter((room) => room.isHidden).length;
  }, [rooms]);

  const hasRooms = rooms.length > 0;

  const handleOpenRoom = (room: RoomInfo) => {
    setActiveRoom(room);
    setSelectedRoomForSidebar(null);
  };

  const handleSelectRoomForSidebar = (room: RoomInfo) => {
    setSelectedRoomForSidebar(room);
    setActiveRoom(null);
  };

  const handleBackToList = () => {
    setActiveRoom(null);
  };

  const handleCloseSidebar = () => {
    setSelectedRoomForSidebar(null);
  };

  if (roomsLoading || devicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-2 h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show room dashboard if a room is selected
  if (activeRoom) {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="gap-2 shadow-gold-glow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Button>
        </div>

        {/* Room Dashboard */}
        <RoomDashboard room={activeRoom} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Rooms</h2>
          <p className="mt-2 text-muted-foreground">
            Organize your smart home by rooms and spaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hiddenRoomsCount > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowHidden(!showHidden)}
              className="gap-2"
            >
              {showHidden ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Hidden Rooms
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Hidden Rooms ({hiddenRoomsCount})
                </>
              )}
            </Button>
          )}
          {hasRooms && <CreateRoomDialog />}
        </div>
      </div>

      {/* Room Content */}
      {hasRooms ? (
        <div className="space-y-6">
          {/* Room Cards */}
          {visibleRooms.length > 0 ? (
            visibleRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectRoomForSidebar(room)}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <RoomDevicesCard
                  room={room}
                  devices={devicesByRoom.get(room.id) || []}
                  onOpenRoom={handleOpenRoom}
                />
              </div>
            ))
          ) : (
            <GlassCard disableTilt>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {showHidden
                    ? 'No hidden rooms found'
                    : 'All rooms are hidden. Click "Show Hidden Rooms" to view them.'}
                </p>
              </CardContent>
            </GlassCard>
          )}

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard disableTilt>
              <CardHeader>
                <CardTitle className="text-base">Device Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Control your devices from the dashboard or explore them in 3D view
                </p>
              </CardContent>
            </GlassCard>

            <GlassCard disableTilt>
              <CardHeader>
                <CardTitle className="text-base">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All device states are synchronized in real-time across all views
                </p>
              </CardContent>
            </GlassCard>

            <GlassCard disableTilt>
              <CardHeader>
                <CardTitle className="text-base">Room Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Group devices by room for easier management and control
                </p>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      ) : (
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DoorOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>No Rooms Yet</CardTitle>
                <CardDescription>Create your first room to get started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-6 text-sm text-muted-foreground">
                Rooms help you organize your smart home devices by location. Start by creating
                your first room.
              </p>
              <CreateRoomDialog />
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Mini Glassmorphism Sidebar */}
      {selectedRoomForSidebar && (
        <SmartRoomSidebar
          roomId={selectedRoomForSidebar.id}
          devices={devicesByRoom.get(selectedRoomForSidebar.id) || []}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
}
