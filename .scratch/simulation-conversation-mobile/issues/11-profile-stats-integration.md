Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add simulation stats to the Profile screen: 2 new `_StatCard` items extending the existing 2x2 stat grid to 2x3.

New stat cards:
- "Scenarios Tried" — icon `forum_outlined`, value from `GET /stats` `scenariosAttempted`
- "Avg. Score" — icon `star_outline`, value from `GET /stats` `averageScore`

Use `VietnameseAccentTokens` for accent colors, matching the existing stat card pattern.

Add `getStats()` to `SimulationRepository`. Create `SimulationStats` model (fromJson: scenariosAttempted, averageScore). Create `simulationStatsProvider` (AsyncNotifier). Integrate into `_StatsSection` on `ProfileScreen` — add a 3rd row with the 2 new stat cards.

## Acceptance criteria

- [x] Profile stats section shows 2 new stat cards: "Scenarios Tried" + "Avg. Score"
- [x] "Scenarios Tried" card shows `forum_outlined` icon + scenariosAttempted value
- [x] "Avg. Score" card shows `star_outline` icon + averageScore value
- [x] Accent colors use `VietnameseAccentTokens` matching existing stat card pattern
- [x] Stat cards have shimmer loading and error states consistent with existing cards
- [x] Pull-to-refresh on profile also refreshes simulation stats
- [x] `SimulationRepository.getStats()` calls `GET /simulations/stats`
- [x] `SimulationStats` model parses from JSON
- [x] `simulationStatsProvider` fetches stats on build

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/01-bottom-nav-thuc-hanh-tab-category-grid.md`

## Implementation notes

**Files created:**
- `mobile/lib/features/simulation/domain/simulation_stats.dart` — SimulationStats model with fromJson/toJson (scenariosAttempted, averageScore)
- `mobile/test/features/simulation/domain/simulation_stats_test.dart` — Unit tests for SimulationStats.fromJson (5 tests)
- `mobile/test/features/simulation/data/simulation_stats_provider_test.dart` — Unit tests for SimulationStatsNotifier DataChangeBus subscription (2 tests)

**Files modified:**
- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `getStats()` method calling `GET /simulations/stats`
- `mobile/lib/features/simulation/data/simulation_providers.dart` — Added `SimulationStatsNotifier` (CachedRepository + DataChangeBusSubscriber, watchTags simulation) and `simulationStatsProvider`
- `mobile/lib/features/profile/presentation/screens/profile_screen.dart` — Added `_SimulationStatsSection` widget with shimmer loading/error/data states using `simulationStatsProvider`; added `_SimulationStatsSectionLoading` skeleton; added simulation stats to pull-to-refresh
- `mobile/test/features/simulation/data/simulation_repository_test.dart` — Added 3 tests for getStats (success, zero values, timeout)

**Files deleted:** none

**Design decisions:**
- `_SimulationStatsSection` is a separate section (with "Simulation" heading) rather than adding a 3rd row to the existing `_StatsSection`, because exercise stats and simulation stats come from different providers and may load/error independently
- Accent colors: `accent.toneHigh` (red) for "Scenarios Tried", `accent.toneMid` (amber) for "Avg. Score" — following the VietnameseAccentTokens pattern used by existing stat cards
- `SimulationStatsNotifier` uses `CachedRepository` + `DataChangeBusSubscriber` with `watchTags({'simulation'})` and `ttl: Duration.zero`, matching the `BookmarkStatsNotifier` pattern for always-fresh stats
