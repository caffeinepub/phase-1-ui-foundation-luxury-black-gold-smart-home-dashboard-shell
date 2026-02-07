import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    userRooms : Map.Map<Principal, Map.Map<Nat8, { id : Nat8; name : Text; color : Text; isHidden : Bool; isRunning : Bool }>>;
    userDevices : Map.Map<Principal, Map.Map<Nat8, { name : Text; roomId : Nat8; isOn : Bool; brightness : Nat8 }>>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    supportTickets : Map.Map<Principal, {
      createdBy : Principal;
      subject : Text;
      description : Text;
      createdAt : Int;
    }>;
    initializedUsers : Map.Map<Principal, Bool>;
    userRoomCounts : Map.Map<Principal, Nat>;
  };

  type NewActor = {
    userRooms : Map.Map<Principal, Map.Map<Nat8, { id : Nat8; name : Text; color : Text; isHidden : Bool; isRunning : Bool }>>;
    userDevices : Map.Map<Principal, Map.Map<Nat8, { name : Text; roomId : Nat8; isOn : Bool; brightness : Nat8 }>>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    supportTickets : Map.Map<Principal, {
      createdBy : Principal;
      subject : Text;
      description : Text;
      createdAt : Int;
    }>;
    initializedUsers : Map.Map<Principal, Bool>;
    userRoomCounts : Map.Map<Principal, Nat>;
    nextDeviceId : Map.Map<Principal, Nat8>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextDeviceId = Map.empty<Principal, Nat8>();
    };
  };
};
