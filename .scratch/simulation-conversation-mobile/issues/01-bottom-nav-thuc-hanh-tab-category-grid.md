Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add a 4th "Practice" tab to the bottom nav (index 2, between Courses and Profile) and build the tab landing screen that shows a 2x3 grid of **Danh mục tình huống** cards. Each card shows icon + name + color tint. Tapping a category selects it (highlighted border), scrolling down to the scenario section (populated in a later slice — for now show an empty section header "All Scenarios" when no category is selected).

Update `ShellScreen` to handle 4 destinations: `/` (home, index 0), `/courses` (1), `/practice` (2), `/profile` (3). Add `/practice` as a `NoTransitionPage` route inside the existing `ShellRoute`. Tab icon: `Icons.chat_bubble_outline` / `Icons.chat_bubble` (selected). Label: "Practice".

Create `SimulationRepository` with `listCategories()` method. Create domain model `ScenarioCategory` (fromJson: id, name, description, icon, color, orderIndex). Create `simulationCategoriesProvider` (AsyncNotifier, fetches categories). Landing screen uses `AppAppBar(title: "Practice")`, `RefreshIndicator > ListView`, category grid using `AppCard` with icon + name + color tint, and placeholder for scenario section.

Follow existing conventions: AsyncNotifier + shimmer loading + centered error/empty states, Repository + Dio + `mapDioException`, `ResponseUnwrapInterceptor` strips `{ data: T }`.

## Acceptance criteria

- [x] Bottom nav shows 4 tabs: Home, Courses, Practice, Profile — Practice at index 2 with chat_bubble icon
- [x] Tapping Practice navigates to `/practice` tab landing
- [x] `_getCurrentIndex` and `_onTap` in `ShellScreen` correctly map all 4 indices
- [x] Tab landing shows 2x3 grid of Danh mục tình huống cards (icon + name + color tint)
- [x] Loading state shows shimmer placeholders; error state shows centered error + retry
- [x] Empty state shows "No categories yet" message
- [x] `SimulationRepository.listCategories()` calls `GET /simulations/categories` via Dio
- [x] `ScenarioCategory` model parses all fields from JSON correctly
- [x] `simulationCategoriesProvider` fetches and caches categories on build

## Blocked by

None — can start immediately

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/scenario_category.dart` — `ScenarioCategory` domain model with fromJson/toJson (id, name, description, icon, color, orderIndex)
- `mobile/lib/features/simulation/data/simulation_repository.dart` — `SimulationRepository` with `listCategories()` calling `GET /simulations/categories` via Dio + `mapDioException`
- `mobile/lib/features/simulation/data/simulation_providers.dart` — `simulationRepositoryProvider` (Dio injection), `simulationCategoriesProvider` (CachedRepository AsyncNotifier, 30min TTL)
- `mobile/lib/features/simulation/presentation/screens/practice_screen.dart` — `PracticeScreen` tab landing: `AppAppBar("Practice")`, `RefreshIndicator > ListView`, category 2-col grid with `AppCard` (icon + name + color tint), shimmer loading, centered error + retry, empty state "No categories yet", placeholder "All Scenarios" section header

### Files modified

- `mobile/lib/core/presentation/shell_screen.dart` — Added Practice tab at index 2 (chat_bubble icons), shifted Profile to index 3, updated `_getCurrentIndex` and `_onTap` to handle 4 tabs
- `mobile/lib/core/router/app_router.dart` — Added `/practice` NoTransitionPage route inside ShellRoute pointing to PracticeScreen, added import for PracticeScreen

### Files deleted

None
