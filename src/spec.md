# Specification

## Summary
**Goal:** Make the homepage hero feel more African-themed by defaulting to a new orange & navy Ankara-print background when no admin hero image is set.

**Planned changes:**
- Add a new generated hero background asset: `hero-bg-ankara-orange-navy-print.dim_2400x1350.png` under `frontend/public/assets/generated`.
- Update the homepage hero fallback logic so the new Ankara background is used only when `adminConfig.homepageVisuals.heroImage` is not configured.
- Preserve all existing admin controls and current overlay/opacity behavior to keep hero text readable and editable.

**User-visible outcome:** When no admin-uploaded hero image is set, the homepage hero shows an orange-and-navy Ankara-inspired background by default; if an admin uploads a hero image, it still takes precedence, and overlay settings continue to control readability.
