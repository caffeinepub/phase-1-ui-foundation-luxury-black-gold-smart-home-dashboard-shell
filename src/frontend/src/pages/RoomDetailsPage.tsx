import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RoomDashboard } from '../components/rooms/RoomDashboard';
import { useGetRoomInfo } from '../hooks/useQueries';
import { RoomsListSkeleton } from '../components/rooms/RoomsListSkeleton';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent } from '../components/ui/card';
import type { RoomId } from '../backend';

interface RoomDetailsPageProps {
  roomId: RoomId;
  onBack: () => void;
}

export function RoomDetailsPage({ roomId, onBack }: RoomDetailsPageProps) {
  const { data: room, isLoading, error, refetch } = useGetRoomInfo(roomId);

  if (isLoading) {
    return <RoomsListSkeleton />;
  }

  if (error || !room) {
    const errorMessage = error instanceof Error ? error.message : 'Room not found';
    
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
              <div>
                <h3 className="text-lg font-semibold text-foreground">Failed to Load Room</h3>
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

      {/* Room Dashboard with all details */}
      <RoomDashboard room={room} onBack={onBack} />
    </div>
  );
}
