import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { withTimeout } from '../utils/promiseTimeout';
import type { DeviceId, LightDevice, RoomId, UserProfile, RoomInfo, SensorStats } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Room Queries - Optimized for list views with timeout protection
export function useGetAllRoomSummaries(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['roomSummaries'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getAllRoomSummaries(),
          15000,
          'Loading rooms is taking longer than expected. Please try again.'
        );
        // Validate result
        if (!Array.isArray(result)) {
          console.error('Invalid rooms response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Failed to fetch room summaries:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

// Legacy hook for backward compatibility (used by other pages)
export function useGetAllRooms(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getAllRooms(),
          15000,
          'Loading rooms is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid rooms response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, name, color, isHidden }: { roomId: RoomId; name: string; color: string; isHidden: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRoom(roomId, name, color, isHidden);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummaries'] });
    },
  });
}

export function useUpdateRoomSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, name, color }: { roomId: RoomId; name: string; color: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRoomSettings(roomId, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummaries'] });
    },
  });
}

export function useSetRoomHidden() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, isHidden }: { roomId: RoomId; isHidden: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRoomHidden(roomId, isHidden);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomSummaries'] });
    },
  });
}

// Device Queries - Optimized to avoid global fetches
export function useGetAllDevices(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[DeviceId, LightDevice]>>({
    queryKey: ['devices'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getAllDevices(),
          15000,
          'Loading devices is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid devices response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

export function useGetDevicesByRoom(roomId?: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[DeviceId, LightDevice]>>({
    queryKey: ['devices', 'room', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getDevices(roomId),
          15000,
          'Loading room devices is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid room devices response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Failed to fetch room devices:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching && roomId !== undefined),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

export function useCreateDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, name, roomId, isOn, brightness }: { deviceId: DeviceId; name: string; roomId: RoomId; isOn: boolean; brightness: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDevice(deviceId, name, roomId, isOn, brightness);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', 'room', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['roomSwitchInfo', variables.roomId] });
    },
  });
}

export function useToggleDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: DeviceId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDevice(deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useSetBrightness() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, brightness }: { deviceId: DeviceId; brightness: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setBrightness(deviceId, brightness);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useToggleAllDevicesInRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, turnOn }: { roomId: RoomId; turnOn: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleAllDevicesInRoom(roomId, turnOn);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', 'room', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['roomSwitchInfo', variables.roomId] });
    },
  });
}

export function useGetRoomSwitchInfo(roomId?: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['roomSwitchInfo', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) {
        return null;
      }
      try {
        const result = await withTimeout(
          actor.getRoomSwitchInfo(roomId),
          10000,
          'Loading room info is taking longer than expected.'
        );
        return result;
      } catch (error) {
        console.error('Failed to fetch room switch info:', error);
        return null;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching && roomId !== undefined),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

// Sensor Queries
export function useGetRoomSensorStats(roomId?: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<SensorStats | null>({
    queryKey: ['sensorStats', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) {
        return null;
      }
      try {
        const result = await withTimeout(
          actor.getRoomSensorStats(roomId),
          10000,
          'Loading sensor data is taking longer than expected.'
        );
        return result;
      } catch (error) {
        console.error('Failed to fetch sensor stats:', error);
        return null;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : (!!actor && !isFetching && roomId !== undefined),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

// Support Ticket Mutations
export function useSubmitSupportTicket() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ subject, description }: { subject: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSupportTicket(subject, description);
    },
  });
}
