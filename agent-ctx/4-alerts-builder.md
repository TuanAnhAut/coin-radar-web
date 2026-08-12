# Task 4: Alert Hub & Overlays

## Files Created
- `src/components/alerts/alert-fab.tsx` — Floating action button
- `src/components/alerts/alert-hub.tsx` — Main alerts view with tabs, filters, cards
- `src/components/alerts/alert-templates-sheet.tsx` — Templates sheet overlay
- `src/components/alerts/alert-builder-sheet.tsx` — 3-step alert creation wizard
- `src/components/alerts/alert-detail-sheet.tsx` — Alert detail sheet with timeline, gauge, actions

## Files Modified
- `src/components/layout/app-layout.tsx` — Integrated AlertHub + overlays + FAB

## API Integration
- `GET /api/alerts?status=active|triggered|history&type=stock|crypto|gold`
- `GET /api/alerts/[id]`
- `POST /api/alerts`
- `PATCH /api/alerts/[id]`
- `DELETE /api/alerts/[id]`
- `GET /api/alert-templates`
- `GET /api/assets` (search in builder)

## Notes
- All text in Vietnamese
- Uses framer-motion for animations
- Uses shadcn/ui components (Sheet, Dialog, Tabs, Badge, etc.)
- Zero lint errors in all alert files
- Pre-existing lint errors in market/ files are from other tasks
