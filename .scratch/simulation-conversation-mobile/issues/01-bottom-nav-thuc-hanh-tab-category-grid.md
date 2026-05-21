Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add a 4th "Practice" tab to the bottom nav (index 2, between Courses and Profile) and build the tab landing screen that shows a 2x3 grid of **Danh mục tình huống** cards. Each card shows icon + name + color tint. Tapping a category selects it (highlighted border), scrolling down to the scenario section (populated in a later slice — for now show an empty section header "All Scenarios" when no category is selected).

Update `ShellScreen` to handle 4 destinations: `/` (home, index 0), `/courses` (1), `/practice` (2), `/profile` (3). Add `/practice` as a `NoTransitionPage` route inside the existing `ShellRoute`. Tab icon: `Icons.chat_bubble_outline` / `Icons.chat_bubble` (selected). Label: "Practice".

Create `SimulationRepository` with `listCategories()` method. Create domain model `ScenarioCategory` (fromJson: id, name, description, icon, color, orderIndex). Create `simulationCategoriesProvider` (AsyncNotifier, fetches categories). Landing screen uses `AppAppBar(title: "Practice")`, `RefreshIndicator > ListView`, category grid using `AppCard` with icon + name + color tint, and placeholder for scenario section.

Follow existing conventions: AsyncNotifier + shimmer loading + centered error/empty states, Repository + Dio + `mapDioException`, `ResponseUnwrapInterceptor` strips `{ data: T }`.

## Acceptance criteria

- [ ] Bottom nav shows 4 tabs: Home, Courses, Practice, Profile — Practice at index 2 with chat_bubble icon
- [ ] Tapping Practice navigates to `/practice` tab landing
- [ ] `_getCurrentIndex` and `_onTap` in `ShellScreen` correctly map all 4 indices
- [ ] Tab landing shows 2x3 grid of Danh mục tình huống cards (icon + name + color tint)
- [ ] Loading state shows shimmer placeholders; error state shows centered error + retry
- [ ] Empty state shows "No categories yet" message
- [ ] `SimulationRepository.listCategories()` calls `GET /simulations/categories` via Dio
- [ ] `ScenarioCategory` model parses all fields from JSON correctly
- [ ] `simulationCategoriesProvider` fetches and caches categories on build

## Blocked by

None — can start immediately
