Status: done

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Build the **Kết quả mô phỏng** screen. Route: `/practice/results/:id` (outside shell, push). Accessible from: chat completed state "View Results" button, results history tap.

Screen layout:
- Top: total score display (large styled number 0-100, or `AppProgress` circular)
- Middle: criteria list — each item: criterion name + `AppProgress` linear bar + score/maxScore + comment text
- Bottom: AI summary text block (bodyMedium) + action buttons
- Actions: "Play Again" (`AppButton.primary` → push character selection with previous character pre-selected) + "Review Conversation" (`AppButton.outline` → push chat history with `isHistory: true`)
- For non-COMPLETED end reasons: context-appropriate messaging. TOO_MANY_ERRORS → study suggestion ("Review the lesson before trying again"), no replay. INAPPROPRIATE/ABUSIVE → warning, no replay button.

Add `getResult(String id)` to `SimulationRepository`. Create models: `SimulationResultDetail` (fromJson: summary fields + criteriaScores[], aiSummary, totalMessages), `CriteriaScore` (fromJson: name, score, maxScore, comment). Create `simulationResultDetailProvider` (Family AsyncNotifier).

## Acceptance criteria

- [x] Result screen shows total score prominently (0-100)
- [x] Each scoring criterion shows name, progress bar, score/maxScore, and comment
- [x] AI summary renders as text block
- [x] "Play Again" pushes to character selection with previous character pre-selected
- [x] "Review Conversation" pushes to chat screen in `isHistory: true` mode
- [x] TOO_MANY_ERRORS end reason: shows study suggestion, no "Play Again" button
- [x] INAPPROPRIATE/ABUSIVE end reason: shows warning, no "Play Again" button
- [x] `SimulationRepository.getResult()` calls `GET /simulations/results/:id`
- [x] `SimulationResultDetail` and `CriteriaScore` models parse from JSON
- [x] `simulationResultDetailProvider` fetches by ID, shimmer/error states work

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/07-session-lifecycle-pause-cancel-completed.md`

## Implementation notes

### Files created

- `mobile/lib/features/simulation/domain/simulation_result_detail.dart` — `SimulationResultDetail` and `CriteriaScore` domain models with `fromJson`/`toJson`. Includes computed getters: `isCompleted`, `isTooManyErrors`, `isInappropriate`, `canReplay`. Parses nested `scenario.title` and `chosenCharacter.name` from backend `ResultDetail` response shape.
- `mobile/lib/features/simulation/presentation/screens/simulation_result_screen.dart` — Full result screen with ConsumerWidget pattern (loading shimmer / error retry / data content). Layout: `AppProgress` circular (120px) with score number for total score, criteria list with `AppProgress` linear bars + score color coding (green ≥71, amber ≥41, red <41), AI summary in muted container, end-reason messaging cards for TOO_MANY_ERRORS/INAPPROPRIATE/ABUSIVE. Bottom action buttons: "Chơi lại" (primary, only for COMPLETED) + "Xem lại hội thoại" (outline, always shown).

### Files modified

- `mobile/lib/features/simulation/data/simulation_repository.dart` — Added `getResult(String id)` method calling `GET /simulations/results/:id`, returning `SimulationResultDetail`.
- `mobile/lib/features/simulation/data/simulation_providers.dart` — Added `simulationResultDetailProvider` (FutureProvider.family<SimulationResultDetail, String>), and import for the new model.
- `mobile/lib/features/simulation/presentation/screens/character_selection_screen.dart` — Added `preselectedCharacterId` optional constructor param, initialized `_selectedCharacterId` in `initState` to support "Play Again" pre-selection flow.
- `mobile/lib/core/router/app_router.dart` — Added route `/practice/results/:id` → `SimulationResultScreen`. Added `characterId` query parameter handling for `/practice/scenarios/:id/select-character` route. Added import for `SimulationResultScreen`.

### Files deleted

(none)
