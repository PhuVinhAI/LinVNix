Status: ready-for-agent

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

- [ ] Tapping a scenario card pushes to `/practice/scenarios/:id` detail screen
- [ ] Detail screen shows description, scoring criteria (name + description + weight %), characters (avatar + name + role)
- [ ] Non-playable characters are dimmed with "NPC" badge
- [ ] Character avatar renders `avatarKey` asset if present, otherwise initial letter fallback
- [ ] Sticky "Start" button pushes to character selection route
- [ ] `SimulationRepository.getScenario()` calls `GET /simulations/scenarios/:id`
- [ ] `ScenarioDetail`, `ScenarioCharacter`, `ScoringCriterion` models parse from JSON
- [ ] `scenarioDetailProvider` fetches by ID, shimmer/error/empty states work
- [ ] AppBar shows back button + scenario title

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/02-tinh-huong-grid-filtering.md`
