Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the **Tình huống** browsing experience on the tab landing: scenario cards below the category grid, multi-filter bottom sheet, and category-filter interaction.

When a category card is tapped, filter scenarios by that category and show a section header with the category name. "See all" clears the filter. A filter button on the AppBar opens a bottom sheet with Category, Level (CEFR levels), and Difficulty (EASY/MEDIUM/HARD) selectors. All filters apply at once on "Apply" tap (no incremental re-rendering while selecting). The AppBar filter icon shows which category is currently active.

Each scenario card (`AppCard` outlined) shows: top row (level `AppBadge` with CEFR colors + clock icon + estimated minutes), title (maxLines 2), description (maxLines 2), bottom row (difficulty `AppBadge` + people icon + character count). Tapping a card pushes to scenario detail (route added in slice 03).

Add `listScenarios({categoryId, level, difficulty})` to `SimulationRepository`. Create `ScenarioSummary` model (fromJson: id, title, description, requiredLevel, difficulty, estimatedMinutes, characterCount, categoryInfo). Create `simulationScenariosProvider` (AsyncNotifier with filter params).

## Acceptance criteria

- [ ] Scenario cards render below category grid in a 2-column grid
- [ ] Tapping a category card filters scenarios by that category; section header shows category name
- [ ] "See all" or re-tapping selected category clears filter; header reverts to "All Scenarios"
- [ ] Filter bottom sheet has Category, Level, Difficulty selectors; "Apply" applies all at once
- [ ] AppBar filter icon indicates active category filter
- [ ] Scenario card shows level badge (CEFR colors), title, description, difficulty badge (EASY=success, MEDIUM=warning, HARD=error), estimated time, character count
- [ ] `SimulationRepository.listScenarios()` calls `GET /simulations/scenarios` with query params
- [ ] `ScenarioSummary` model parses all fields including nullable `categoryInfo`
- [ ] `simulationScenariosProvider` refetches when filter params change
- [ ] Loading shimmer, error, and empty states work for scenario grid

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/01-bottom-nav-thuc-hanh-tab-category-grid.md`
