Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the **Lịch sử kết quả** screen and the mini history section on the scenario detail screen.

**Results history screen:** Route: `/practice/history` (outside shell, push). Accessible from AppBar history icon on tab landing. Shows list of result cards (`AppCard` outlined) newest-first: score, end reason, date, scenario title, character name. Tap card → push result detail screen. Optional filter by scenario (dropdown or filter bottom sheet).

**Tab landing AppBar:** Add history icon button that pushes to `/practice/history`.

**Mini history on scenario detail:** At the bottom of scenario detail (above sticky "Bắt đầu" button), if past results exist for this scenario, show a compact section listing past scores with dates. Tap a result → push result detail.

Add `listResults({String? scenarioId})` to `SimulationRepository`. Create `SimulationResultSummary` model (fromJson: id, totalScore, endReason, createdAt, scenarioTitle, characterName). Create `simulationResultsProvider` (AsyncNotifier with optional scenarioId filter).

## Acceptance criteria

- [ ] AppBar history icon on tab landing pushes to `/practice/history`
- [ ] Results history screen lists results newest-first with score, end reason, date, scenario title, character name
- [ ] Tap a result card → push result detail screen
- [ ] Scenario filter on history screen filters results by scenario
- [ ] Mini history section on scenario detail shows past results (score + date) when they exist
- [ ] Tapping a mini history result pushes to result detail
- [ ] `SimulationRepository.listResults()` calls `GET /simulations/results` with optional scenarioId
- [ ] `SimulationResultSummary` model parses from JSON
- [ ] `simulationResultsProvider` refetches when scenarioId filter changes
- [ ] Loading shimmer, error, and empty states work for both list and mini section

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/09-ket-qua-mo-phong-screen.md`
