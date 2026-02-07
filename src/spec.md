# Specification

## Summary
**Goal:** Prevent first-time authenticated users from seeing “Unauthorized: Must have user role” by automatically provisioning them with the `#user` role after Internet Identity login.

**Planned changes:**
- Backend: auto-provision `#user` role for previously unseen authenticated principals on first interaction, without granting anything to the anonymous principal, and without affecting existing roles (including admins).
- Backend: add a new shared, idempotent provisioning method that the frontend can call after login to ensure the caller has `#user` (reject/trap with a clear Unauthorized error for anonymous callers).
- Frontend: call the provisioning method once after successful Internet Identity authentication and before Rooms-related React Query fetches, avoiding repeated calls on re-render.
- Frontend: if provisioning fails, show a clear English error state with a retry action that can re-run provisioning and then re-fetch Rooms.

**User-visible outcome:** After logging in with Internet Identity, first-time users can open the Rooms view and load room/device lists without hitting the “Must have user role” Unauthorized error, and can retry provisioning if an error occurs.
