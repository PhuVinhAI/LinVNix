Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the **Tình huống** detail screen pushed from scenario card tap. Shows description, scoring criteria list, character list (playable + NPC), and a sticky "Start" button at the bottom that pushes to character selection.

Route: `/practice/scenarios/:id` (outside shell, normal push transition).

Sections:
- Description text (bodyMedium/c.foreground)
- "Scoring Criteria" section: `AppListItem` items — name, description, trailing = weight % `AppBadge`
- "Characters" section: `AppListItem` items — leading: `AppAvatar` (use `avatarKey` or initial letter fallback), title: name, subtitle: role. Non-playable characters dimmed + "NPC" `AppBadge`

Sticky bottom: `AppButton.primary(fullWidth, "Start")` → push `/practice/scenarios/:id/select-character`.

Add `getScenario(String id)` to `SimulationRepository`. Create models: `ScenarioDetail` (summary fields + scoringCriteria[], characters[]), `ScenarioCharacter` (fromJson: id, name, role, personality, speechStyle, avatarKey, isPlayable, orderIndex), `ScoringCriterion` (fromJson: name, description, weight). Create `scenarioDetailProvider` (Family AsyncNotifier, fetches by scenario ID).

## Acceptance criteria

- [x] Tapping a scenario card pushes to `/practice/scenarios/:id` detail screen
- [x] Detail screen shows description, scoring criteria (name + description + weight %), characters (avatar + name + role)
- [x] Non-playable characters are dimmed with "NPC" badge
- [x] Character avatar renders `avatarKey` asset if present, otherwise initial letter fallback
- [x] Sticky "Start" button pushes to character selection route
- [x] `SimulationRepository.getScenario()` calls `GET /simulations/scenarios/:id`
- [x] `ScenarioDetail`, `ScenarioCharacter`, `ScoringCriterion` models parse from JSON
- [x] `scenarioDetailProvider` fetches by ID, shimmer/error/empty states work
- [x] AppBar shows back button + scenario title

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/02-tinh-huong-grid-filtering.md`

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/scoring_criterion.dart` — `ScoringCriterion` model with `name`, `description`, `weight` fields and `fromJson`/`toJson`
- `mobile/lib/features/simulation/domain/scenario_character.dart` — `ScenarioCharacter` model with `id`, `name`, `role`, `personality`, `speechStyle`, `avatarKey` (nullable), `isPlayable`, `orderIndex` fields and `fromJson`/`toJson`
- `mobile/lib/features/simulation/domain/scenario_detail.dart` — `ScenarioDetail` model combining summary fields (`id`, `title`, `description`, `requiredLevel`, `difficulty`, `estimatedMinutes`, `characterCount`, `categoryInfo`) with `scoringCriteria[]` and `characters[]` arrays; `fromJson` handles both `categoryInfo` and `category` JSON keys from different endpoints
- `mobile/lib/features/simulation/presentation/screens/scenario_detail_screen.dart` — `ScenarioDetailScreen` (ConsumerWidget) with three-state AsyncValue (shimmer loading / error with retry / data content); content uses `CustomScrollView` + `SliverAppBar` showing scenario title; sections for info badges, description, "Tiêu chí chấm điểm" scoring criteria list with `AppListItem` + weight `%` `AppBadge`, "Nhân vật" character list with `AppAvatar` (initial letter fallback) + `AppListItem` + NPC dimming + "NPC" `AppBadge`; sticky bottom `AppButton.primary` "Bắt đầu" pushes to `/practice/scenarios/:id/select-character`

### Files modified

- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `getScenario(String id)` method calling `GET /simulations/scenarios/$id`
- `mobile/lib/features/simulation/data/simulation_providers.dart` — Added `scenarioDetailProvider` as `FutureProvider.family<ScenarioDetail, String>` fetching by ID; imported `ScenarioDetail` model
- `mobile/lib/core/router/app_router.dart` — Added `GoRoute` for `/practice/scenarios/:id` → `ScenarioDetailScreen`; imported `ScenarioDetailScreen`
- `mobile/lib/features/simulation/presentation/screens/practice_screen.dart` — Changed `_ScenarioCard.onTap` from `() {}` to `() => context.push('/practice/scenarios/${scenario.id}')`; added `go_router` import

### Files deleted

None.
