import { DoorOpen, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RoomCountStepper } from '../components/rooms/RoomCountStepper';
import { RoomTile } from '../components/rooms/RoomTile';
import { useGetRoomsForCount } from '../hooks/useQueries';
import { useAutoProvisionUser } from '../hooks/useAutoProvisionUser';
import { RoomsListSkeleton } from '../components/rooms/RoomsListSkeleton';
import { ProvisioningStateCard } from '../components/security/ProvisioningStateCard';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { getStoredRoomsDisplayCount, setStoredRoomsDisplayCount, getStoredShowHiddenRooms, setStoredShowHiddenRooms } from '../utils/urlParams';
import type { RoomInfo, RoomId } from '../backend';
import { useQueryClient } from '@tanstack/react-query';

interface RoomsPageProps {
  onOpenRoomDetails: (roomId: RoomId) => void;
}

export function RoomsPage({ onOpenRoomDetails }: RoomsPageProps) {
  const provisioningState = useAutoProvisionUser();
  const queryClient = useQueryClient();
  
  // Restore display count from sessionStorage or default to 5
  const [displayCount, setDisplayCount] = useState(() => getStoredRoomsDisplayCount());
  
  const [showHidden, setShowHidden] = useState(() => getStoredShowHiddenRooms());

  // Persist display count to sessionStorage
  useEffect(() => {
    setStoredRoomsDisplayCount(displayCount);
  }, [displayCount]);

  // Persist show hidden preference to sessionStorage
  useEffect(() => {
    setStoredShowHiddenRooms(showHidden);
  }, [showHidden]);

  // Fetch exactly N rooms (IDs 1 to displayCount) from backend
  const { data: fetchedRooms = [], isLoading: roomsLoading, error: roomsError, refetch, isFetching } = useGetRoomsForCount(
    displayCount,
    {
      enabled: provisioningState.isSuccess,
    }
  );

  // Create optimistic room list that always includes rooms 1..displayCount
  const allRooms = useMemo(() => {
    const roomsMap = new Map<RoomId, RoomInfo>();
    
    // First, add all fetched rooms
    fetchedRooms.forEach(room => {
      roomsMap.set(room.id, room);
    });
    
    // Then, fill in any missing rooms with placeholders
    for (let i = 1; i <= displayCount; i++) {
      const roomId = i as RoomId;
      if (!roomsMap.has(roomId)) {
        roomsMap.set(roomId, {
          id: roomId,
          name: `Room ${roomId}`,
          color: 'white',
          isHidden: false,
          isRunning: false,
        });
      }
    }
    
    // Convert to array and sort by id
    return Array.from(roomsMap.values()).sort((a, b) => a.id - b.id);
  }, [fetchedRooms, displayCount]);

  // Filter rooms based on visibility setting
  const displayedRooms = useMemo(() => {
    if (!allRooms || allRooms.length === 0) return [];
    return allRooms;
  }, [allRooms]);

  // Filter for visible rooms only (for the hidden count badge)
  const visibleRooms = useMemo(() => {
    return displayedRooms.filter((room) => !room.isHidden);
  }, [displayedRooms]);

  const hiddenRoomsCount = useMemo(() => {
    return displayedRooms.length - visibleRooms.length;
  }, [displayedRooms, visibleRooms]);

  const hasRooms = displayedRooms.length > 0;

  // Stable callbacks to prevent unnecessary re-renders
  const handleOpenRoomDetails = useCallback((roomId: RoomId) => {
    onOpenRoomDetails(roomId);
  }, [onOpenRoomDetails]);

  const handleToggleHidden = useCallback(() => {
    setShowHidden((prev) => !prev);
  }, []);

  const handleRetrySetup = useCallback(() => {
    provisioningState.retry();
  }, [provisioningState]);

  const handleDisplayCountChange = useCallback((newCount: number) => {
    // Pre-seed the cache with optimistic data
    const previousRooms = queryClient.getQueryData<RoomInfo[]>(['roomsForCount', displayCount]) || [];
    
    // Create optimistic room list for the new count
    const optimisticRooms: RoomInfo[] = [];
    for (let i = 1; i <= newCount; i++) {
      const roomId = i as RoomId;
      const existingRoom = previousRooms.find(r => r.id === roomId);
      
      if (existingRoom) {
        optimisticRooms.push(existingRoom);
      } else {
        optimisticRooms.push({
          id: roomId,
          name: `Room ${roomId}`,
          color: 'white',
          isHidden: false,
          isRunning: false,
        });
      }
    }
    
    // Pre-populate the cache for the new count
    queryClient.setQueryData(['roomsForCount', newCount], optimisticRooms);
    
    // Update the display count
    setDisplayCount(newCount);
  }, [displayCount, queryClient]);

  // Loading state during provisioning or initial rooms fetch
  if (provisioningState.isLoading || (provisioningState.isSuccess && roomsLoading && !fetchedRooms.length)) {
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

  // Rooms error state with retry (only show if provisioning succeeded and no rooms at all)
  if (provisioningState.isSuccess && roomsError && !fetchedRooms.length) {
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

  // Determine which rooms to show based on showHidden filter
  const roomsToDisplay = showHidden ? displayedRooms : visibleRooms;

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
        </div>
      </div>

      {/* Display Count Selector with Stepper */}
      <GlassCard disableTilt>
        <CardHeader>
          <CardTitle className="text-lg">Display Settings</CardTitle>
          <CardDescription>Choose how many rooms to display (1-100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Number of Rooms:</span>
            <RoomCountStepper
              value={displayCount}
              onChange={handleDisplayCountChange}
              min={1}
              max={100}
            />
          </div>
        </CardContent>
      </GlassCard>

      {/* Rooms Grid - always show if we have rooms */}
      {hasRooms && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {roomsToDisplay.map((room) => (
            <RoomTile
              key={room.id}
              room={room}
              onClick={() => handleOpenRoomDetails(room.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
