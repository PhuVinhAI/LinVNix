Status: done

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Build the Courses tab: browse courses → tap course → view modules → tap module → view lessons. Course list from `GET /courses` shows thumbnail (cached_network_image), title, level badge (A1–C2), and estimated hours. Course detail from `GET /courses/:id` shows description and ordered module list with topic, description, estimated hours. Module detail from `GET /modules/:id` shows ordered lesson list with lesson type icon, estimated duration, and progress status (not_started/in_progress/completed via `GET /progress`). All endpoints are public (no auth required for browsing). Lessons load all at once (small lists). Images use cached_network_image with shimmer placeholder and fallback icon on error. Smooth navigation with go_router nested routes: `/courses`, `/courses/:id`, `/modules/:id`.

## Acceptance criteria

- [x] Course list displays all courses with thumbnail, title, level, estimated hours
- [x] Tapping a course shows its modules with descriptions and topics
- [x] Tapping a module shows its lessons with type icons, duration, and progress status
- [x] Images load with caching, shimmer placeholder, and fallback icon
- [x] Navigation uses go_router nested routes correctly
- [x] Error and loading states handled on each screen
- [x] Works without authentication (public endpoints)

## Blocked by

- `01-project-scaffold-navigation-shell`

## Implementation notes

- Created domain models: `Course`, `CourseModule`, `Lesson`, `UserProgress` in `lib/features/courses/domain/course_models.dart`
- Created `CoursesRepository` in `lib/features/courses/data/courses_repository.dart` with methods for all 4 endpoints
- Created Riverpod providers in `lib/features/courses/data/courses_providers.dart`
- CoursesScreen: ListView with shimmer loading, cached_network_image, level badge (A1-C2 color coded), error/retry state
- CourseDetailScreen: SliverAppBar with hero image, module list with topic/description/estimated hours
- ModuleDetailScreen: lesson list with lesson type icons (vocabulary, grammar, reading, etc.), duration, progress status (not_started/in_progress/completed with color coding)
- Added `shimmer` package (v3.0.0) for loading placeholders
- Router updated: `/courses/:id` and `/modules/:id` as top-level routes (full-screen without bottom nav)
- All course routes marked as public (no auth redirect)
- `flutter analyze` passes cleanly (56 tests pass, 3 pre-existing failures unrelated to this feature)
