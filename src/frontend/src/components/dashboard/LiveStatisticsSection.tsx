import { GlassCard } from '../effects/GlassCard';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { EnergyConsumptionLineChart } from './widgets/EnergyConsumptionLineChart';
import { HomeHealthGauge } from './widgets/HomeHealthGauge';
import { DeviceActivityPieChart } from './widgets/DeviceActivityPieChart';
import { useGetAllDevices, useGetAllRooms } from '../../hooks/useQueries';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export function LiveStatisticsSection() {
  const { data: allDevices = [], isLoading: devicesLoading } = useGetAllDevices();
  const { data: rooms = [], isLoading: roomsLoading } = useGetAllRooms();

  // Compute device activity data from real backend state
  const deviceActivityData = useMemo(() => {
    const activeDevices = allDevices.filter(([, device]) => device.isOn).length;
    const idleDevices = allDevices.length - activeDevices;

    return [
      { name: 'Active', value: activeDevices, color: 'oklch(var(--primary))' },
      { name: 'Idle', value: idleDevices, color: 'oklch(var(--muted))' },
    ];
  }, [allDevices]);

  // Compute home health based on device states
  const homeHealth = useMemo(() => {
    if (allDevices.length === 0) return 100;
    // Simple health metric: percentage of devices that are operational (all are operational in this model)
    return 100;
  }, [allDevices]);

  // Generate energy consumption data (simulated hourly data for last 24 hours)
  const energyData = useMemo(() => {
    const activeCount = allDevices.filter(([, device]) => device.isOn).length;
    const baseConsumption = activeCount * 0.01; // 0.01 kWh per device per hour

    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
      return {
        time: timeLabel,
        value: baseConsumption * (0.8 + Math.random() * 0.4), // Add some variation
      };
    });
  }, [allDevices]);

  const isLoading = devicesLoading || roomsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Energy Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </GlassCard>
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Home Health</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </GlassCard>
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Device Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Energy Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <EnergyConsumptionLineChart data={energyData} />
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Home Health</CardTitle>
        </CardHeader>
        <CardContent>
          <HomeHealthGauge value={homeHealth} />
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Device Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceActivityPieChart data={deviceActivityData} />
        </CardContent>
      </GlassCard>
    </div>
  );
}
