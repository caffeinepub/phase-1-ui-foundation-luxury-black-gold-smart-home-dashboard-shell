# Specification

## Summary
**Goal:** Make the Rooms stepper update the rooms grid immediately, with sensible default names for newly shown rooms and reliable React Query synchronization.

**Planned changes:**
- Update the Rooms page so increasing/decreasing the room count immediately renders/hides corresponding RoomTile items in the rooms grid without requiring a refresh.
- When a new room becomes visible, auto-generate its default English name as "Room N" (matching its room number/id) while keeping the existing inline edit flow to rename and persist via the backend.
- Ensure React Query room-list data stays in sync with room count changes (consistent refetch/invalidation as needed), with clean loading/error behavior and no stale list.

**User-visible outcome:** Clicking + on the Rooms page instantly shows a new room tile named like "Room 6" (editable later), and clicking − hides extra rooms, with no refresh needed.
