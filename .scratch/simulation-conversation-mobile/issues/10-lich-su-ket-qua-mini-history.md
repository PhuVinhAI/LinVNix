Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the **Lịch sử kết quả** screen and the mini history section on the scenario detail screen.

**Results history screen:** Route: `/practice/history` (outside shell, push). Accessible from AppBar history icon on tab landing. Shows list of result cards (`AppCard` outlined) newest-first: score, end reason, date, scenario title, character name. Tap card → push result detail screen. Optional filter by scenario (dropdown or filter bottom sheet). AppBar title: "Results History".

**Tab landing AppBar:** Add history icon button that pushes to `/practice/history`.

**Mini history on scenario detail:** At the bottom of scenario detail (above sticky "Start" button), if past results exist for this scenario, show a compact section listing past scores with dates. Tap a result → push result detail.

Add `listResults({String? scenarioId})` to `SimulationRepository`. Create `SimulationResultSummary` model (fromJson: id, totalScore, endReason, createdAt, scenarioTitle, characterName). Create `simulationResultsProvider` (AsyncNotifier with optional scenarioId filter).

## Acceptance criteria

- [x] AppBar history icon on tab landing pushes to `/practice/history`
- [x] Results history screen lists results newest-first with score, end reason, date, scenario title, character name
- [x] Tap a result card → push result detail screen
- [x] Scenario filter on history screen filters results by scenario
- [x] Mini history section on scenario detail shows past results (score + date) when they exist
- [x] Tapping a mini history result pushes to result detail
- [x] `SimulationRepository.listResults()` calls `GET /simulations/results` with optional scenarioId
- [x] `SimulationResultSummary` model parses from JSON
- [x] `simulationResultsProvider` refetches when scenarioId filter changes
- [x] Loading shimmer, error, and empty states work for both list and mini section

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/09-ket-qua-mo-phong-screen.md`

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/simulation_result_summary.dart` — `SimulationResultSummary` model with fromJson/toJson (id, totalScore, endReason, createdAt, scenarioTitle, characterName, scenarioId). Handles nested `scenario` and `chosenCharacter` objects from API.
- `mobile/lib/features/simulation/presentation/screens/results_history_screen.dart` — Full results history screen with: AppBar "Lịch sử hội thoại", scenario filter indicator (when arriving from scenario detail), ListView of result cards showing score/100, end reason badge, scenario title, character name, date. Loading shimmer, error with retry, empty state. `ConsumerStatefulWidget` with `_selectedScenarioId` state for filter switching.

### Files modified

- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `listResults({String? scenarioId})` method calling `GET /simulations/results` with optional `scenarioId` query parameter.
- `mobile/lib/features/simulation/data/simulation_providers.dart` — Added `simulationResultsProvider` as `FutureProvider.family<List<SimulationResultSummary>, String?>` — family parameter is the optional scenarioId, enabling both unfiltered list and per-scenario mini history. Refetches automatically when scenarioId changes.
- `mobile/lib/features/simulation/presentation/screens/practice_screen.dart` — Added history icon button (`Icons.history`) to AppBar actions, pushing to `/practice/history`.
- `mobile/lib/features/simulation/presentation/screens/scenario_detail_screen.dart` — Changed `_ScenarioDetailContent` from `StatelessWidget` to `ConsumerWidget`. Added mini history section between characters list and bottom padding: watches `simulationResultsProvider(detail.id)`, shows loading shimmer, hides on error/empty, displays up to 3 compact result cards with score + character name + date, "Xem tất cả" link pushes to `/practice/history?scenarioId=...`.
- `mobile/lib/core/router/app_router.dart` — Added `/practice/history` push route (outside shell) mapping to `ResultsHistoryScreen` with optional `?scenarioId=` query parameter.

### Files deleted

(none)
