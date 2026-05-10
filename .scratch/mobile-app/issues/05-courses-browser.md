Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the Courses tab: browse courses → tap course → view modules → tap module → view lessons. Course list from `GET /courses` shows thumbnail (cached_network_image), title, level badge (A1–C2), and estimated hours. Course detail from `GET /courses/:id` shows description and ordered module list with topic, description, estimated hours. Module detail from `GET /modules/:id` shows ordered lesson list with lesson type icon, estimated duration, and progress status (not_started/in_progress/completed via `GET /progress`). All endpoints are public (no auth required for browsing). Lessons load all at once (small lists). Images use cached_network_image with shimmer placeholder and fallback icon on error. Smooth navigation with go_router nested routes: `/courses`, `/courses/:id`, `/modules/:id`.

## Acceptance criteria

- [ ] Course list displays all courses with thumbnail, title, level, estimated hours
- [ ] Tapping a course shows its modules with descriptions and topics
- [ ] Tapping a module shows its lessons with type icons, duration, and progress status
- [ ] Images load with caching, shimmer placeholder, and fallback icon
- [ ] Navigation uses go_router nested routes correctly
- [ ] Error and loading states handled on each screen
- [ ] Works without authentication (public endpoints)

## Blocked by

- `01-project-scaffold-navigation-shell`
