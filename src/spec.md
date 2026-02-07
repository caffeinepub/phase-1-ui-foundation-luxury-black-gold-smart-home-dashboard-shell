# Specification

## Summary
**Goal:** Simplify the Rooms page by removing manual room creation, make the room grid reflect the selected room count, and add a dedicated Room Details page for room-specific information and controls.

**Planned changes:**
- Remove the "Add Room" button and any Rooms-page flows/empty-states that prompt creating rooms; ensure no UI path from the Rooms page triggers the create-room dialog.
- Update the room count selector so the grid shows exactly N room cards/icons based on the first N pre-created rooms (IDs 1–100), updating immediately when the selection changes (with a defined, consistent behavior when hidden rooms are involved).
- Add page-level navigation: clicking a room card/icon opens a dedicated Room Details page that shows room details, statistics, electricity/consumption, and the room’s devices/controls (reusing existing room dashboard functionality where applicable), with a Back control returning to Rooms while preserving the selected room count where feasible.

**User-visible outcome:** Users can choose how many rooms to display and see exactly that many room icons; selecting a room opens a full Room Details page with stats, consumption, and device controls, and they can navigate back to the Rooms list without losing their selection.
