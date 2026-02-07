import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGetRoomInfo } from '../hooks/useQueries';
import { RoomsListSkeleton } from '../components/rooms/RoomsListSkeleton';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent } from '../components/ui/card';
import { RoomUsageStatisticsSection } from '../components/rooms/RoomUsageStatisticsSection';
import { RoomDeviceListSection } from '../components/rooms/RoomDeviceListSection';
import { sanitizeBackendError } from '../utils/backendAvailability';
import type { RoomId } from '../backend';

interface RoomDetailsPageProps {
  roomId: RoomId;
  onBack: () => void;
}

/**
 * Room details page with resilient error handling that distinguishes backend-unavailable/canister-stopped failures from generic errors, providing clear recovery UI with Try Again and Back to Rooms actions.
 */
export function RoomDetailsPage({ roomId, onBack }: RoomDetailsPageProps) {
  const { data: room, isLoading, error, refetch } = useGetRoomInfo(roomId);

  if (isLoading) {
    return <RoomsListSkeleton />;
  }

  if (error || !room) {
    const sanitized = sanitizeBackendError(error || new Error('Room not found'));
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 shadow-gold-glow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Button>
        </div>
        <GlassCard disableTilt>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Failed to Load Room</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {sanitized.message}
                </p>
                {sanitized.isCanisterUnavailable && (
                  <p className="mt-2 text-xs text-muted-foreground max-w-md">
                    The backend service may be starting up or temporarily unavailable. Please wait a moment and try again.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {sanitized.canRetry && (
                  <Button onClick={() => refetch()} variant="outline" className="shadow-gold-glow-sm">
                    Try Again
                  </Button>
                )}
                <Button onClick={onBack} variant="default" className="shadow-gold-glow-sm">
                  Back to Rooms
                </Button>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 shadow-gold-glow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Button>
      </div>

      {/* Room Header */}
      <GlassCard disableTilt>
        <CardContent className="py-8">
          <div className="flex items-center gap-6">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-gold-glow-sm"
              style={{ backgroundColor: room.color, color: '#fff' }}
            >
              {room.id}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {room.name}
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Room #{room.id}
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Room Usage Statistics */}
      <RoomUsageStatisticsSection roomId={roomId} />

      {/* Room Device List */}
      <RoomDeviceListSection roomId={roomId} />
    </div>
  );
}
