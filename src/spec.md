# Specification

## Summary
**Goal:** Make the 3D Walkthrough mode the default-quality 3D experience with a clearly visible interior, PUBG-style on-screen joystick movement, and room-surface clicking that opens the existing Mini Sidebar while keeping room selection and device/scene data consistent.

**Planned changes:**
- Improve/ensure the 3D house/interior renders with stable lighting, shadows, and materials so walls/floors/furniture are clearly readable in the dark UI context and the scene renders without console errors.
- Add/ensure an on-screen PUBG-style joystick in 3D mode (also on non-touch devices) with smooth movement and a deadzone, while preserving WASD + mouse-look; disable and reset joystick input when modals/dialogs are open.
- Enable clicking/tapping wall/floor surfaces in the 3D scene to set the existing active room selection state and open the existing SmartRoomSidebar; select the correct room when determinable, otherwise fall back to a defined default.
- Update 3D scene data flow to respect the current active room (and teleport target) for device fetching, device hotspot mapping, lighting fixtures, and navigation bounds, removing any hardcoded room id behavior.

**User-visible outcome:** In 3D Walkthrough mode, users see a properly lit, readable home interior, can move using either an on-screen joystick or WASD/mouse, and can click room surfaces to open the existing Mini Sidebar for that room with devices/hotspots and navigation behavior matching the selected room.
