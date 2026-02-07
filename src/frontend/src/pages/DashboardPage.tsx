import { Activity, Zap, Home, TrendingUp, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LiveStatisticsSection } from '../components/dashboard/LiveStatisticsSection';
import { Button } from '../components/ui/button';
import { useGetAllRooms, useGetAllDevices } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { useMemo } from 'react';

interface DashboardPageProps {
  onExplore3D: () => void;
}

export function DashboardPage({ onExplore3D }: DashboardPageProps) {
  const { data: rooms = [], isLoading: roomsLoading } = useGetAllRooms();
  const { data: allDevices = [], isLoading: devicesLoading } = useGetAllDevices();

  const stats = useMemo(() => {
    const totalDevices = allDevices.length;
    const activeDevices = allDevices.filter(([, device]) => device.isOn).length;
    const activeRooms = new Set(
      allDevices.filter(([, device]) => device.isOn).map(([, device]) => device.roomId)
    ).size;

    // Calculate estimated energy usage (0.01 kWh per active device per hour, scaled to 24h)
    const energyUsage = (activeDevices * 0.01 * 24).toFixed(1);

    // System health: 100% if all devices are operational (no error states in this simple model)
    const systemHealth = 100;

    return {
      totalDevices,
      activeDevices,
      activeRooms,
      totalRooms: rooms.length,
      energyUsage,
      systemHealth,
    };
  }, [allDevices, rooms]);

  const isLoading = roomsLoading || devicesLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Welcome to your luxury smart home control center
          </p>
        </div>
        <Button
          onClick={onExplore3D}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-accent shadow-gold-glow hover:shadow-gold-glow-sm transition-all"
        >
          <Sparkles className="h-5 w-5" />
          Explore in 3D
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stats.totalDevices}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeDevices} active, {stats.totalDevices - stats.activeDevices} idle
                </p>
              </>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stats.activeRooms}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalRooms} {stats.totalRooms === 1 ? 'room' : 'rooms'}
                </p>
              </>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Usage</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stats.energyUsage} kWh</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{stats.systemHealth}%</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </>
            )}
          </CardContent>
        </GlassCard>
      </div>

      {/* Live Statistics Section */}
      <LiveStatisticsSection />

      {/* Main Content Card */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-xl">Getting Started</CardTitle>
          <CardDescription>Your premium smart home dashboard is ready to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="mb-2 font-semibold text-foreground">3D Virtual Home Experience</h3>
            <p className="text-sm text-muted-foreground">
              Click "Explore in 3D" to enter your virtual home. Navigate with WASD keys (desktop)
              or on-screen joystick (mobile). Click golden orbs to control your devices in an
              immersive 3D environment.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>
                  Navigate through your home with{' '}
                  <span className="font-medium text-primary">WASD controls</span> or touch joystick
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>
                  Interact with{' '}
                  <span className="font-medium text-primary">golden device hotspots</span> to
                  control lights
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>
                  Experience <span className="font-medium text-primary">dynamic lighting</span>{' '}
                  that responds to device state
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
