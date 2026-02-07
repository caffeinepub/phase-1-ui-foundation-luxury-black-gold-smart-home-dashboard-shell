# Specification

## Summary
**Goal:** Make the Room Details page resilient to backend failures and ensure devices can be added to rooms reliably with immediate UI updates.

**Planned changes:**
- Update Room Details page to handle failed room queries safely (including canister-stopped/backend-unavailable cases) with a clear English error, no raw dumps, and actions for “Try Again” and “Back to Rooms”.
- Add a backend method to allocate a unique DeviceId per user (0–255) to prevent ID collisions, and update the frontend dialogs to request IDs from this allocator instead of generating IDs from timestamps.
- Ensure the Room Details device list refreshes immediately after successful single/bulk adds so newly created devices appear without manual page refresh and dialogs close cleanly.

**User-visible outcome:** Room Details stays usable even when loading fails (with clear recovery actions), device adds no longer randomly fail due to ID collisions, and newly added devices show up in the room immediately after adding.
