import { DoorOpen, Eye, EyeOff, Edit } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { useGetRoomSummariesRange } from '../hooks/useQueries';
import { useAutoProvisionUser } from '../hooks/useAutoProvisionUser';
import { RoomDevicesCard } from '../components/rooms/RoomDevicesCard';
import { SmartRoomSidebar } from '../components/virtual-home/SmartRoomSidebar';
import { RoomsListSkeleton } from '../components/rooms/RoomsListSkeleton';
import { ProvisioningStateCard } from '../components/security/ProvisioningStateCard';
import { RoomsEditModeOverlay } from '../components/rooms/RoomsEditModeOverlay';
import { useMemo, useState, useCallback, useEffect } from 'react';
import type { RoomInfo, RoomId } from '../backend';

interface RoomsPageProps {
  onOpenRoomDetails: (roomId: RoomId) => void;
}

export function RoomsPage({ onOpenRoomDetails }: RoomsPageProps) {
  const provisioningState = useAutoProvisionUser();
  
  // Restore display count from sessionStorage or default to 25
  const [displayCount, setDisplayCount] = useState(() => {
    const stored = sessionStorage.getItem('rooms-display-count');
    return stored ? parseInt(stored, 10) : 25;
  });
  
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] = useState<RoomInfo | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Persist display count to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('rooms-display-count', displayCount.toString());
  }, [displayCount]);

  // Fetch rooms from backend (1 to displayCount)
  const { data: allRooms = [], isLoading: roomsLoading, error: roomsError, refetch } = useGetRoomSummariesRange(
    0,
    displayCount,
    {
      enabled: provisioningState.isSuccess,
    }
  );

  // Filter and slice rooms based on visibility and display count
  const displayedRooms = useMemo(() => {
    if (!allRooms) return [];
    
    // Sort by room id to ensure consistent ordering
    const sorted = [...allRooms].sort((a, b) => a.id - b.id);
    
    // Filter based on showHidden setting
    let filtered = sorted;
    if (!showHidden) {
      filtered = sorted.filter((room) => !room.isHidden);
    }
    
    // Take exactly displayCount rooms
    return filtered.slice(0, displayCount);
  }, [allRooms, showHidden, displayCount]);

  const hiddenRoomsCount = useMemo(() => {
    if (!allRooms) return 0;
    return allRooms.filter((room) => room.isHidden).length;
  }, [allRooms]);

  const hasRooms = displayedRooms.length > 0;

  // Stable callbacks to prevent unnecessary re-renders
  const handleOpenRoomDetails = useCallback((room: RoomInfo) => {
    onOpenRoomDetails(room.id);
  }, [onOpenRoomDetails]);

  const handleSelectRoomForSidebar = useCallback((room: RoomInfo) => {
    setSelectedRoomForSidebar(room);
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

  const handleDisplayCountChange = useCallback((value: number[]) => {
    setDisplayCount(value[0]);
  }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const handleCloseEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

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
        <ProvisioningStateCard
          state="error"
          message={provisioningState.error?.message}
          onRetry={handleRetrySetup}
          isRetrying={provisioningState.isLoading}
        />
      </div>
    );
  }

  // Rooms error state with retry (only show if provisioning succeeded)
  if (provisioningState.isSuccess && roomsError) {
    const errorMessage = roomsError instanceof Error ? roomsError.message : 'An unexpected error occurred while loading rooms.';
    
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
              <div>
                <h3 className="text-lg font-semibold text-foreground">Failed to Load Rooms</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {errorMessage}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="shadow-gold-glow-sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
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
            <Button
              variant="outline"
              onClick={handleToggleEditMode}
              className="gap-2 shadow-gold-glow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Room Names
            </Button>
          </div>
        </div>

        {/* Display Count Selector with Slider */}
        <GlassCard disableTilt>
          <CardHeader>
            <CardTitle className="text-lg">Display Settings</CardTitle>
            <CardDescription>Choose how many rooms to display (1-100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Number of Rooms:</span>
                <span className="text-2xl font-bold text-primary">{displayCount}</span>
              </div>
              <Slider
                min={1}
                max={100}
                step={1}
                value={[displayCount]}
                onValueChange={handleDisplayCountChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Empty State */}
        {!hasRooms && (
          <GlassCard disableTilt>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <DoorOpen className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No Rooms Available</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Adjust the display count or visibility settings to see your rooms.
                  </p>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Rooms Grid */}
        {hasRooms && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedRooms.map((room) => (
              <RoomDevicesCard
                key={room.id}
                room={room}
                onOpenRoomDetails={handleOpenRoomDetails}
                onSelectForSidebar={handleSelectRoomForSidebar}
              />
            ))}
          </div>
        )}

        {/* Smart Room Sidebar */}
        {selectedRoomForSidebar && (
          <SmartRoomSidebar
            roomId={selectedRoomForSidebar.id}
            onClose={handleCloseSidebar}
          />
        )}
      </div>

      {/* Edit Mode Overlay */}
      {isEditMode && (
        <RoomsEditModeOverlay
          rooms={displayedRooms}
          onClose={handleCloseEditMode}
        />
      )}
    </>
  );
}
