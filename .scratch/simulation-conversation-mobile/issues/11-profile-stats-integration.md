Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add simulation stats to the Profile screen: 2 new `_StatCard` items extending the existing 2x2 stat grid to 2x3.

New stat cards:
- "Tình huống đã thử" — icon `forum_outlined`, value from `GET /stats` `scenariosAttempted`
- "Điểm TB" — icon `star_outline`, value from `GET /stats` `averageScore`

Use `VietnameseAccentTokens` for accent colors, matching the existing stat card pattern.

Add `getStats()` to `SimulationRepository`. Create `SimulationStats` model (fromJson: scenariosAttempted, averageScore). Create `simulationStatsProvider` (AsyncNotifier). Integrate into `_StatsSection` on `ProfileScreen` — add a 3rd row with the 2 new stat cards.

## Acceptance criteria

- [ ] Profile stats section shows 2 new stat cards: "Tình huống đã thử" + "Điểm TB"
- [ ] "Tình huống đã thử" card shows `forum_outlined` icon + scenariosAttempted value
- [ ] "Điểm TB" card shows `star_outline` icon + averageScore value
- [ ] Accent colors use `VietnameseAccentTokens` matching existing stat card pattern
- [ ] Stat cards have shimmer loading and error states consistent with existing cards
- [ ] Pull-to-refresh on profile also refreshes simulation stats
- [ ] `SimulationRepository.getStats()` calls `GET /simulations/stats`
- [ ] `SimulationStats` model parses from JSON
- [ ] `simulationStatsProvider` fetches stats on build

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/01-bottom-nav-thuc-hanh-tab-category-grid.md`
