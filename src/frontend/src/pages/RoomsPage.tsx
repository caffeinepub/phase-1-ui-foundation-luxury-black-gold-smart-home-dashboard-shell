import { ArrowLeft, DoorOpen, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useGetAllRoomSummaries } from '../hooks/useQueries';
import { useAutoProvisionUser } from '../hooks/useAutoProvisionUser';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomDevicesCard } from '../components/rooms/RoomDevicesCard';
import { RoomDashboard } from '../components/rooms/RoomDashboard';
import { SmartRoomSidebar } from '../components/virtual-home/SmartRoomSidebar';
import { RoomsListSkeleton } from '../components/rooms/RoomsListSkeleton';
import { useMemo, useState, useCallback } from 'react';
import type { RoomInfo } from '../backend';

export function RoomsPage() {
  const provisioningState = useAutoProvisionUser();
  
  // Only enable rooms query after provisioning succeeds
  const { data: rooms = [], isLoading: roomsLoading, error: roomsError, refetch } = useGetAllRoomSummaries({
    enabled: provisioningState.isSuccess,
  });
  
  const [activeRoom, setActiveRoom] = useState<RoomInfo | null>(null);
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] = useState<RoomInfo | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  // Filter rooms based on visibility - memoized with stable dependencies
  const visibleRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter((room) => showHidden || !room.isHidden);
  }, [rooms, showHidden]);

  const hiddenRoomsCount = useMemo(() => {
    if (!rooms) return 0;
    return rooms.filter((room) => room.isHidden).length;
  }, [rooms]);

  const hasRooms = rooms.length > 0;

  // Stable callbacks to prevent unnecessary re-renders
  const handleOpenRoom = useCallback((room: RoomInfo) => {
    setActiveRoom(room);
    setSelectedRoomForSidebar(null);
  }, []);

  const handleSelectRoomForSidebar = useCallback((room: RoomInfo) => {
    setSelectedRoomForSidebar(room);
    setActiveRoom(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveRoom(null);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedRoomForSidebar(null);
  }, []);

  const handleToggleHidden = useCallback(() => {
    setShowHidden((prev) => !prev);
  }, []);

  const handleRetrySetup = useCallback(() => {
    provisioningState.retry();
  }, [provisioningState]);

  // Loading state during provisioning or rooms fetch
  if (provisioningState.isLoading || (provisioningState.isSuccess && roomsLoading)) {
    return <RoomsListSkeleton />;
  }

  // Provisioning error state with retry
  if (provisioningState.isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Rooms</h2>
            <p className="mt-2 text-muted-foreground">
              Organize your smart home by rooms and spaces
            </p>
          </div>
        </div>
        <GlassCard disableTilt>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Setup Required</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {provisioningState.error?.message || 'Failed to initialize your account. Please try again.'}
                </p>
              </div>
              <Button 
                onClick={handleRetrySetup} 
                variant="outline" 
                className="shadow-gold-glow-sm gap-2"
                disabled={provisioningState.isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${provisioningState.isLoading ? 'animate-spin' : ''}`} />
                Retry Setup
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  // Rooms error state with retry (only show if provisioning succeeded)
  if (provisioningState.isSuccess && roomsError) {
    const errorMessage = roomsError instanceof Error ? roomsError.message : 'An unexpected error occurred while loading rooms.';
    
    // Check if it's an authorization error (shouldn't happen after provisioning, but handle gracefully)
    const isAuthError = errorMessage.toLowerCase().includes('unauthorized');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Rooms</h2>
            <p className="mt-2 text-muted-foreground">
              Organize your smart home by rooms and spaces
            </p>
          </div>
        </div>
        <GlassCard disableTilt>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {isAuthError ? 'Access Issue' : 'Failed to Load Rooms'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {errorMessage}
                </p>
              </div>
              <div className="flex gap-2">
                {isAuthError && (
                  <Button 
                    onClick={handleRetrySetup} 
                    variant="outline" 
                    className="shadow-gold-glow-sm gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Setup
                  </Button>
                )}
                <Button onClick={() => refetch()} variant="outline" className="shadow-gold-glow-sm">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </GlassCard>
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
              onClick={handleToggleHidden}
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
                <CardTitle className="text-base">Room Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Group devices by rooms for easier management and control
                </p>
              </CardContent>
            </GlassCard>

            <GlassCard disableTilt>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use the master switch to control all devices in a room at once
                </p>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      ) : (
        <GlassCard disableTilt>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <DoorOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No Rooms Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Get started by creating your first room. Organize your smart home by spaces like Living Room, Bedroom, or Kitchen.
                </p>
              </div>
              <CreateRoomDialog />
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Mini Sidebar */}
      {selectedRoomForSidebar && (
        <SmartRoomSidebar
          roomId={selectedRoomForSidebar.id}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
}
