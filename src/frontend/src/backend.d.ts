import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SupportTicket {
    subject: string;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
}
export interface SensorStats {
    temperature: number;
    humidity: number;
}
export type DeviceId = number;
export interface LightDevice {
    isOn: boolean;
    name: string;
    brightness: number;
    roomId: RoomId;
}
export interface RoomSwitchInfo {
    totalDevices: bigint;
    activeDevices: bigint;
}
export type RoomId = number;
export interface RoomInfo {
    id: RoomId;
    name: string;
    color: string;
    isHidden: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateSensors(roomId: RoomId, temperature: number, humidity: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDevice(deviceId: DeviceId, name: string, roomId: RoomId, isOn: boolean, brightness: number): Promise<void>;
    createRoom(roomId: RoomId, name: string, color: string, isHidden: boolean): Promise<void>;
    getAllDevices(): Promise<Array<[DeviceId, LightDevice]>>;
    /**
     * / Returns all rooms meta-data without devices list (for list-views)
     */
    getAllRoomSummaries(): Promise<Array<RoomInfo>>;
    getAllRooms(): Promise<Array<RoomInfo>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDevices(roomId: RoomId): Promise<Array<[DeviceId, LightDevice]>>;
    getRoomInfo(roomId: RoomId): Promise<RoomInfo | null>;
    getRoomSensorStats(roomId: RoomId): Promise<SensorStats | null>;
    /**
     * / Returns only a room range (support lazy loading)
     */
    getRoomSummariesRange(fromIndex: bigint, toIndex: bigint): Promise<Array<RoomInfo>>;
    getRoomSwitchInfo(roomId: RoomId): Promise<RoomSwitchInfo | null>;
    getSupportTicket(user: Principal): Promise<SupportTicket | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccess(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBrightness(deviceId: DeviceId, brightness: number): Promise<boolean>;
    setRoomHidden(roomId: RoomId, isHidden: boolean): Promise<void>;
    submitSupportTicket(subject: string, description: string): Promise<void>;
    toggleAllDevicesInRoom(roomId: RoomId, turnOn: boolean): Promise<boolean>;
    toggleDevice(deviceId: DeviceId): Promise<boolean>;
    toggleRoomHidden(roomId: RoomId): Promise<boolean>;
    updateRoomSettings(roomId: RoomId, name: string, color: string): Promise<void>;
}
