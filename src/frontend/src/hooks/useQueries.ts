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

// Room Queries - Get exactly N rooms by count
export function useGetRoomsForCount(count: number, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['roomsForCount', count],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getRoomsForCount(BigInt(count)),
          15000,
          'Loading rooms is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid rooms response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Error fetching rooms for count:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching && count > 0,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}

// Room Queries - Range-based for efficient subset fetching
export function useGetRoomSummariesRange(fromIndex: number, toIndex: number, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['roomSummaries', 'range', fromIndex, toIndex],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getRoomSummariesRange(BigInt(fromIndex), BigInt(toIndex)),
          15000,
          'Loading rooms is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid rooms response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Error fetching room summaries range:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Room Queries - Get all rooms
export function useGetAllRooms(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo[]>({
    queryKey: ['allRooms'],
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
        console.error('Error fetching all rooms:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Room Queries - Get single room info
export function useGetRoomInfo(roomId: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<RoomInfo | null>({
    queryKey: ['roomInfo', roomId],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getRoomInfo(roomId),
          10000,
          'Loading room information is taking longer than expected. Please try again.'
        );
        return result;
      } catch (error) {
        console.error('Error fetching room info:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Room Mutations
export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, name, color, isHidden }: { roomId: RoomId; name: string; color: string; isHidden: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRoom(roomId, name, color, isHidden);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomsForCount'] });
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomsForCount'] });
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomInfo', variables.roomId] });
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
      queryClient.invalidateQueries({ queryKey: ['roomsForCount'] });
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
    },
  });
}

export function useToggleRoomRunningState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: RoomId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleRoomRunningState(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomsForCount'] });
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
    },
  });
}

export function useSetRoomRunning() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, isRunning }: { roomId: RoomId; isRunning: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRoomRunning(roomId, isRunning);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomsForCount'] });
      queryClient.invalidateQueries({ queryKey: ['allRooms'] });
    },
  });
}

// Device Queries
export function useGetAllDevices(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<[DeviceId, LightDevice][]>({
    queryKey: ['allDevices'],
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
        console.error('Error fetching all devices:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useGetDevices(roomId: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery<[DeviceId, LightDevice][]>({
    queryKey: ['devices', roomId],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getDevices(roomId),
          10000,
          'Loading devices is taking longer than expected. Please try again.'
        );
        if (!Array.isArray(result)) {
          console.error('Invalid devices response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Alias for backward compatibility
export const useGetDevicesByRoom = useGetDevices;

// Device ID Generation
export function useGenerateNextDeviceId() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateNextDeviceId();
    },
  });
}

// Device Mutations
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
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['roomSwitchInfo'] });
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
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
  });
}

export function useCreateDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      name,
      roomId,
      isOn,
      brightness,
    }: {
      deviceId: DeviceId;
      name: string;
      roomId: RoomId;
      isOn: boolean;
      brightness: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDevice(deviceId, name, roomId, isOn, brightness);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['roomSwitchInfo'] });
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
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['roomSwitchInfo'] });
    },
  });
}

// Room Switch Info Query
export function useGetRoomSwitchInfo(roomId: RoomId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['roomSwitchInfo', roomId],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to backend. Please check your connection.');
      }
      try {
        const result = await withTimeout(
          actor.getRoomSwitchInfo(roomId),
          10000,
          'Loading room switch info is taking longer than expected. Please try again.'
        );
        return result;
      } catch (error) {
        console.error('Error fetching room switch info:', error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
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
