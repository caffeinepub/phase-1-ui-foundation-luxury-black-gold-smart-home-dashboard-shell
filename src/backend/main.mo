import Map "mo:core/Map";
import Nat8 "mo:core/Nat8";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration on upgrade, provide access control mixin

actor {
  // Initialize access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type DeviceId = Nat8;
  public type RoomId = Nat8;

  public type Room = {
    id : RoomId;
    name : Text;
    color : Text;
    isHidden : Bool;
  };

  public type LightDevice = {
    name : Text;
    roomId : RoomId;
    isOn : Bool;
    brightness : Nat8;
  };

  public type Sensor = {
    roomId : RoomId;
    temperature : Float;
    humidity : Float;
  };

  public type SensorStats = {
    temperature : Float;
    humidity : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  public type SupportTicket = {
    createdBy : Principal;
    subject : Text;
    description : Text;
    createdAt : Int;
  };

  // Room info type for frontend sync
  public type RoomInfo = {
    id : RoomId;
    name : Text;
    color : Text;
    isHidden : Bool;
  };

  // Room master switch info
  public type RoomSwitchInfo = {
    totalDevices : Nat;
    activeDevices : Nat;
  };

  public type RoomMasterSwitch = {
    totalDevices : Nat;
    activeDevices : Nat;
  };

  let devices = Map.empty<DeviceId, LightDevice>();
  let rooms = Map.empty<RoomId, Room>();
  let sensors = Map.empty<RoomId, Sensor>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let supportTickets = Map.empty<Principal, SupportTicket>();

  // Room management - Admin at creation
  public shared ({ caller }) func createRoom(roomId : RoomId, name : Text, color : Text, isHidden : Bool) : async () {
    _assertAdmin(caller);
    let newRoom = { id = roomId; name; color; isHidden };
    rooms.add(roomId, newRoom);
  };

  // Update existing room settings (name and color)
  public shared ({ caller }) func updateRoomSettings(roomId : RoomId, name : Text, color : Text) : async () {
    _assertUser(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = { room with name; color };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  // Set room hidden entry
  public shared ({ caller }) func setRoomHidden(roomId : RoomId, isHidden : Bool) : async () {
    _assertUser(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = { room with isHidden };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  // Query all rooms with settings
  public query ({ caller }) func getAllRooms() : async [RoomInfo] {
    _assertUser(caller);
    rooms.values().toArray().map<Room, RoomInfo>(
      func(room) {
        {
          id = room.id;
          name = room.name;
          color = room.color;
          isHidden = room.isHidden;
        };
      }
    );
  };

  // Query specific room info with settings
  public query ({ caller }) func getRoomInfo(roomId : RoomId) : async ?RoomInfo {
    _assertUser(caller);

    switch (rooms.get(roomId)) {
      case (null) { null };
      case (?room) {
        ?{
          id = room.id;
          name = room.name;
          color = room.color;
          isHidden = room.isHidden;
        };
      };
    };
  };

  // Device management - Only Admins create devices
  public shared ({ caller }) func createDevice(deviceId : DeviceId, name : Text, roomId : RoomId, isOn : Bool, brightness : Nat8) : async () {
    _assertAdmin(caller);
    let newDevice = {
      name;
      roomId;
      isOn;
      brightness = Nat8.min(brightness, 255);
    };
    devices.add(deviceId, newDevice);
  };

  // Query all devices
  public query ({ caller }) func getAllDevices() : async [(DeviceId, LightDevice)] {
    _assertUser(caller);
    devices.toArray().sort(
      func(a, b) {
        Nat8.compare(a.0, b.0);
      }
    );
  };

  // Query devices specific to a room
  public query ({ caller }) func getDevices(roomId : RoomId) : async [(DeviceId, LightDevice)] {
    _assertUser(caller);

    devices.filter(func(_id, device) { device.roomId == roomId }).toArray().sort(
      func(a, b) { Nat8.compare(a.0, b.0) }
    );
  };

  // Individual device control
  public shared ({ caller }) func toggleDevice(deviceId : DeviceId) : async Bool {
    _assertUser(caller);

    switch (devices.get(deviceId)) {
      case (null) { false };
      case (?device) {
        let newDevice = { device with isOn = not device.isOn };
        devices.add(deviceId, newDevice);
        newDevice.isOn;
      };
    };
  };

  // Set device brightness
  public shared ({ caller }) func setBrightness(deviceId : DeviceId, brightness : Nat8) : async Bool {
    _assertUser(caller);

    switch (devices.get(deviceId)) {
      case (null) { false };
      case (?device) {
        let updatedDevice = { device with brightness = Nat8.min(brightness, 255) };
        devices.add(deviceId, updatedDevice);
        true;
      };
    };
  };

  // Room Master Switch - toggle all devices in a room
  public shared ({ caller }) func toggleAllDevicesInRoom(roomId : RoomId, turnOn : Bool) : async Bool {
    _assertUser(caller);

    let filteredDevices = devices.filter(func(_id, device) { device.roomId == roomId });
    filteredDevices.forEach(func(deviceId, device) {
      let updatedDevice = { device with isOn = turnOn };
      devices.add(deviceId, updatedDevice);
    });

    true;
  };

  // Query total/active devices in a room
  public query ({ caller }) func getRoomSwitchInfo(roomId : RoomId) : async ?RoomSwitchInfo {
    _assertUser(caller);

    switch (rooms.get(roomId)) {
      case (null) { null };
      case (?_) {
        let roomDevices = devices.filter(func(_id, device) { device.roomId == roomId });
        let total = roomDevices.size();
        let active = roomDevices.values().filter(func(dev) { dev.isOn }).toArray().size();
        ?{
          totalDevices = total;
          activeDevices = active;
        };
      };
    };
  };

  // Environmental Sensor Management (Admin)
  public shared ({ caller }) func addOrUpdateSensors(roomId : RoomId, temperature : Float, humidity : Float) : async () {
    _assertAdmin(caller);
    let sensor : Sensor = {
      roomId;
      temperature;
      humidity;
    };
    sensors.add(roomId, sensor);
  };

  // Environmental Sensor Query (User)
  public query ({ caller }) func getRoomSensorStats(roomId : RoomId) : async ?SensorStats {
    _assertUser(caller);

    switch (sensors.get(roomId)) {
      case (null) { null };
      case (?sensor) {
        ?{
          temperature = sensor.temperature;
          humidity = sensor.humidity;
        };
      };
    };
  };

  // Support Ticket Management (User)
  public shared ({ caller }) func submitSupportTicket(subject : Text, description : Text) : async () {
    _assertUser(caller);

    let newTicket : SupportTicket = {
      createdBy = caller;
      subject;
      description;
      createdAt = 0;
    };

    supportTickets.add(caller, newTicket);
  };

  // Get support ticket (caller or admin only)
  public query ({ caller }) func getSupportTicket(user : Principal) : async ?SupportTicket {
    _assertUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own support ticket");
    };
    supportTickets.get(user);
  };

  // User profile management (User)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    _assertUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    _assertUser(caller);
    userProfiles.add(caller, profile);
  };

  // Internal assertion helpers (not public/shared)
  func _assertAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Must have admin role");
    };
  };

  func _assertUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must have user role");
    };
  };
};
