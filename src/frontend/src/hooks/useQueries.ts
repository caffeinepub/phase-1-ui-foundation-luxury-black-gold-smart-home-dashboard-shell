import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
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

// Room Queries
export function useGetAllRooms() {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRooms();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
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
    },
  });
}

// Device Queries
export function useGetAllDevices() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[DeviceId, LightDevice]>>({
    queryKey: ['devices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDevices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDevicesByRoom(roomId?: RoomId) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[DeviceId, LightDevice]>>({
    queryKey: ['devices', 'room', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) return [];
      return actor.getDevices(roomId);
    },
    enabled: !!actor && !isFetching && roomId !== undefined,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useGetRoomSwitchInfo(roomId?: RoomId) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['roomSwitchInfo', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) return null;
      return actor.getRoomSwitchInfo(roomId);
    },
    enabled: !!actor && !isFetching && roomId !== undefined,
  });
}

// Sensor Queries
export function useGetRoomSensorStats(roomId?: RoomId) {
  const { actor, isFetching } = useActor();

  return useQuery<SensorStats | null>({
    queryKey: ['sensorStats', roomId],
    queryFn: async () => {
      if (!actor || roomId === undefined) return null;
      return actor.getRoomSensorStats(roomId);
    },
    enabled: !!actor && !isFetching && roomId !== undefined,
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
