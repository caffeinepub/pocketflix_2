# Specification

## Summary
**Goal:** Ensure the production (live) app matches the current draft build so admin users see and can use the “Admin Dashboard” navigation link.

**Planned changes:**
- Republish/redeploy the current draft build to production so the live frontend reflects the draft navigation menu for admin users.
- Verify in production that the “Admin Dashboard” nav item appears for authenticated admin users and routes to `/admin` rendering `AdminDashboardPage`.

**User-visible outcome:** In the live app, an admin user sees an “Admin Dashboard” link in the top navigation alongside “Home” and “My Account”, and can click it to access `/admin` without an access denied screen.
