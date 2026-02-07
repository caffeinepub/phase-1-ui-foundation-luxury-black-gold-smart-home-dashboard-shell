import { Skeleton } from '../ui/skeleton';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader } from '../ui/card';

/**
 * Skeleton loading state for the Rooms list page.
 * Matches the final layout to prevent layout shifts.
 */
export function RoomsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Room Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} disableTilt>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/30 p-4">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </CardContent>
        </GlassCard>
      ))}
    </div>
  );
}
