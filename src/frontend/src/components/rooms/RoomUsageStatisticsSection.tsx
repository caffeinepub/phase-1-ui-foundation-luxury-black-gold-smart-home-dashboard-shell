import { BarChart3, Lightbulb, Power, Zap, Loader2 } from 'lucide-react';
import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useGetDevicesByRoom } from '../../hooks/useQueries';
import { DeviceActivityPieChart } from '../dashboard/widgets/DeviceActivityPieChart';
import { Skeleton } from '../ui/skeleton';
import type { RoomId } from '../../backend';
import { useMemo } from 'react';

interface RoomUsageStatisticsSectionProps {
  roomId: RoomId;
}

/**
 * Dashboard-style statistics section for a single room showing total device count, on/off activity breakdown, and activity pie chart visualization.
 */
export function RoomUsageStatisticsSection({ roomId }: RoomUsageStatisticsSectionProps) {
  const { data: devices = [], isLoading, error } = useGetDevicesByRoom(roomId);

  // Compute statistics from device data
  const stats = useMemo(() => {
    const total = devices.length;
    const activeDevices = devices.filter(([, device]) => device.isOn).length;
    const idleDevices = total - activeDevices;
    
    return {
      total,
      active: activeDevices,
      idle: idleDevices,
    };
  }, [devices]);

  // Prepare data for pie chart
  const activityData = useMemo(() => {
    return [
      {
        name: 'Active',
        value: stats.active,
        color: 'oklch(var(--primary))',
      },
      {
        name: 'Idle',
        value: stats.idle,
        color: 'oklch(var(--muted))',
      },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard disableTilt>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </GlassCard>
        <GlassCard disableTilt>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard disableTilt>
        <CardContent className="py-8">
          <div className="text-center text-sm text-muted-foreground">
            Failed to load usage statistics
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Device Statistics Card */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Device Statistics</CardTitle>
              <CardDescription>Overview of devices in this room</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/50 border border-border">
              <Lightbulb className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Power className="h-6 w-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-accent/50 border border-border">
              <Zap className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-muted-foreground">{stats.idle}</p>
              <p className="text-xs text-muted-foreground mt-1">Idle</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Activity Breakdown Card */}
      <GlassCard disableTilt>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-gold-glow-sm">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Activity Breakdown</CardTitle>
              <CardDescription>Device usage distribution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DeviceActivityPieChart data={activityData} />
        </CardContent>
      </GlassCard>
    </div>
  );
}
