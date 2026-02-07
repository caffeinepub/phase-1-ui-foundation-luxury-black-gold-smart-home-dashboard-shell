import Map "mo:core/Map";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
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
    isRunning : Bool;
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
    isRunning : Bool;
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

  // Per-user data storage
  let userRooms = Map.empty<Principal, Map.Map<RoomId, Room>>();
  let userDevices = Map.empty<Principal, Map.Map<DeviceId, LightDevice>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let supportTickets = Map.empty<Principal, SupportTicket>();
  let initializedUsers = Map.empty<Principal, Bool>();

  // Tracking room count per user
  let userRoomCounts = Map.empty<Principal, Nat>();

  let nextDeviceId = Map.empty<Principal, Nat8>();

  // Auto-provision user role for new authenticated principals
  // Note: This function allows self-registration. If stricter control is needed,
  // an admin must manually assign roles using the assignRole function from MixinAuthorization
  public shared ({ caller }) func initializeAccess() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot initialize access");
    };

    // Check if user already has a role assigned
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    if (currentRole == #guest) {
      // Self-assign user role for new users
      // This is the only place where non-admins can call assignRole
      // and only for themselves
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };

    // Initialize default rooms for this user only if not already done
    switch (initializedUsers.get(caller)) {
      case (?true) { /* Already initialized */ };
      case (_) {
        initializeDefaultRoomsForUser(caller);
        initializedUsers.add(caller, true);
      };
    };
  };

  // Initialize default rooms for a specific user
  func initializeDefaultRoomsForUser(user : Principal) {
    let newRooms = Map.empty<RoomId, Room>();
    for (roomId in Nat8.range(1, 101)) {
      let newRoom : Room = {
        id = roomId;
        name = "Room " # roomId.toText();
        color = "white";
        isHidden = false;
        isRunning = false;
      };
      newRooms.add(roomId, newRoom);
    };
    userRooms.add(user, newRooms);

    // Initialize empty device map for user
    userDevices.add(user, Map.empty<DeviceId, LightDevice>());

    // Initialize default room count
    userRoomCounts.add(user, 5);
  };

  // Get user's rooms map
  func getUserRoomsMap(caller : Principal) : Map.Map<RoomId, Room> {
    switch (userRooms.get(caller)) {
      case (?rooms) { rooms };
      case (null) {
        let newRooms = Map.empty<RoomId, Room>();
        userRooms.add(caller, newRooms);
        newRooms;
      };
    };
  };

  // Get user's devices map
  func getUserDevicesMap(caller : Principal) : Map.Map<DeviceId, LightDevice> {
    switch (userDevices.get(caller)) {
      case (?devices) { devices };
      case (null) {
        let newDevices = Map.empty<DeviceId, LightDevice>();
        userDevices.add(caller, newDevices);
        newDevices;
      };
    };
  };

  public shared ({ caller }) func setRoomCount(count : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set room count");
    };
    if (count > 100) {
      Runtime.trap("Room count cannot exceed 100");
    };
    userRoomCounts.add(caller, count);
  };

  public query ({ caller }) func getRoomCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get room count");
    };
    switch (userRoomCounts.get(caller)) {
      case (?count) { count };
      case (null) { 5 }; // Default to 5 if not set
    };
  };

  public query ({ caller }) func getRoomsForCount(count : Nat) : async [RoomInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get rooms");
    };
    if (count == 0 or count > 100) {
      Runtime.trap("Invalid room count");
    };

    let rooms = getUserRoomsMap(caller);
    Array.tabulate<RoomInfo>(
      count,
      func(i) {
        let roomId = Nat8.fromNat((i + 1) : Nat);
        switch (rooms.get(roomId)) {
          case (?room) { room };
          case (null) {
            {
              id = roomId;
              name = "Room " # roomId.toText();
              color = "white";
              isHidden = false;
              isRunning = false;
            };
          };
        };
      },
    );
  };

  public query ({ caller }) func getAllRoomSummaries() : async [RoomInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get room summaries");
    };
    let rooms = getUserRoomsMap(caller);
    rooms.values().toArray().map<Room, RoomInfo>(
      func(r) { r }
    );
  };

  public query ({ caller }) func getRoomSummariesRange(fromIndex : Nat, toIndex : Nat) : async [RoomInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get room summaries");
    };
    let rooms = getUserRoomsMap(caller);
    let allRooms = rooms.values().toArray();
    getSlice(allRooms, fromIndex, toIndex);
  };

  func getSlice(arr : [Room], fromIndex : Nat, toIndex : Nat) : [RoomInfo] {
    let validatedFrom = fromIndex;
    let validatedTo = Nat.min(toIndex, arr.size());
    if (validatedFrom >= validatedTo) { return [] };
    let size = validatedTo - validatedFrom : Nat;
    Array.tabulate<RoomInfo>(
      size,
      func(i) {
        let origIndex = validatedFrom + i;
        toRoomInfo(arr[origIndex]);
      },
    );
  };

  func toRoomInfo(room : Room) : RoomInfo {
    room;
  };

  public shared ({ caller }) func createRoom(roomId : RoomId, name : Text, color : Text, isHidden : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create rooms");
    };
    let rooms = getUserRoomsMap(caller);
    let newRoom = { id = roomId; name; color; isHidden; isRunning = false };
    rooms.add(roomId, newRoom);
  };

  public shared ({ caller }) func toggleRoomRunningState(roomId : RoomId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle room state");
    };
    let rooms = getUserRoomsMap(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = {
          room with
          isRunning = not room.isRunning;
        };
        rooms.add(roomId, updatedRoom);
        updatedRoom.isRunning;
      };
    };
  };

  public shared ({ caller }) func updateRoomSettings(roomId : RoomId, name : Text, color : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update room settings");
    };
    let rooms = getUserRoomsMap(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = { room with name; color };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func setRoomHidden(roomId : RoomId, isHidden : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set room visibility");
    };
    let rooms = getUserRoomsMap(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = { room with isHidden };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func setRoomRunning(roomId : RoomId, isRunning : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set room running state");
    };
    let rooms = getUserRoomsMap(caller);

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) {
        let updatedRoom = { room with isRunning };
        rooms.add(roomId, updatedRoom);
      };
    };
  };

  public query ({ caller }) func getAllRooms() : async [RoomInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get all rooms");
    };
    let rooms = getUserRoomsMap(caller);
    rooms.values().toArray().map<Room, RoomInfo>(
      func(room) {
        {
          id = room.id;
          name = room.name;
          color = room.color;
          isHidden = room.isHidden;
          isRunning = room.isRunning;
        };
      }
    );
  };

  public query ({ caller }) func getRoomInfo(roomId : RoomId) : async ?RoomInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get room info");
    };
    let rooms = getUserRoomsMap(caller);

    switch (rooms.get(roomId)) {
      case (null) { null };
      case (?room) {
        ?{
          id = room.id;
          name = room.name;
          color = room.color;
          isHidden = room.isHidden;
          isRunning = room.isRunning;
        };
      };
    };
  };

  public shared ({ caller }) func generateNextDeviceId() : async Nat8 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate device IDs");
    };
    let newId : Nat8 = switch (nextDeviceId.get(caller)) {
      case (null) { 0 };
      case (?lastId) {
        if (lastId == 255) {
          Runtime.trap("Maximum device ID limit reached. Consider reusing device IDs since the system assigns the next available ID automatically.");
        };
        Nat8.fromNat(lastId.toNat() + 1);
      };
    };
    nextDeviceId.add(caller, newId);
    newId;
  };

  public shared ({ caller }) func createDevice(deviceId : DeviceId, name : Text, roomId : RoomId, isOn : Bool, brightness : Nat8) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create devices");
    };
    let devices = getUserDevicesMap(caller);
    let newDevice = {
      name;
      roomId;
      isOn;
      brightness = Nat8.min(brightness, 255);
    };
    devices.add(deviceId, newDevice);
  };

  public query ({ caller }) func getAllDevices() : async [(DeviceId, LightDevice)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get devices");
    };
    let devices = getUserDevicesMap(caller);
    devices.toArray().sort(
      func(a, b) {
        Nat8.compare(a.0, b.0);
      }
    );
  };

  public query ({ caller }) func getDevices(roomId : RoomId) : async [(DeviceId, LightDevice)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get devices");
    };
    let devices = getUserDevicesMap(caller);

    devices.filter(func(_id, device) { device.roomId == roomId }).toArray().sort(
      func(a, b) { Nat8.compare(a.0, b.0) }
    );
  };

  public shared ({ caller }) func toggleDevice(deviceId : DeviceId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle devices");
    };
    let devices = getUserDevicesMap(caller);

    switch (devices.get(deviceId)) {
      case (null) { false };
      case (?device) {
        let newDevice = { device with isOn = not device.isOn };
        devices.add(deviceId, newDevice);
        newDevice.isOn;
      };
    };
  };

  public shared ({ caller }) func setBrightness(deviceId : DeviceId, brightness : Nat8) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set brightness");
    };
    let devices = getUserDevicesMap(caller);

    switch (devices.get(deviceId)) {
      case (null) { false };
      case (?device) {
        let updatedDevice = { device with brightness = Nat8.min(brightness, 255) };
        devices.add(deviceId, updatedDevice);
        true;
      };
    };
  };

  public shared ({ caller }) func toggleAllDevicesInRoom(roomId : RoomId, turnOn : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle devices");
    };
    let devices = getUserDevicesMap(caller);

    let filteredDevices = devices.filter(func(_id, device) { device.roomId == roomId });
    filteredDevices.forEach(func(deviceId, device) {
      let updatedDevice = { device with isOn = turnOn };
      devices.add(deviceId, updatedDevice);
    });

    true;
  };

  public query ({ caller }) func getRoomSwitchInfo(roomId : RoomId) : async ?RoomSwitchInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get room switch info");
    };
    let rooms = getUserRoomsMap(caller);
    let devices = getUserDevicesMap(caller);

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

  public shared ({ caller }) func addOrUpdateSensors(roomId : RoomId, temperature : Float, humidity : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manage sensors");
    };
    Runtime.trap("Sensor management has been moved to the frontend");
  };

  public query ({ caller }) func getRoomSensorStats(roomId : RoomId) : async ?SensorStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sensor stats");
    };
    Runtime.trap("Sensor management has been moved to the frontend");
  };

  public shared ({ caller }) func submitSupportTicket(subject : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit support tickets");
    };

    let newTicket : SupportTicket = {
      createdBy = caller;
      subject;
      description;
      createdAt = 0;
    };

    supportTickets.add(caller, newTicket);
  };

  public query ({ caller }) func getSupportTicket(user : Principal) : async ?SupportTicket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support tickets");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own support ticket");
    };
    supportTickets.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
