Status: ready-for-agent

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

- [ ] Result screen shows total score prominently (0-100)
- [ ] Each scoring criterion shows name, progress bar, score/maxScore, and comment
- [ ] AI summary renders as text block
- [ ] "Play Again" pushes to character selection with previous character pre-selected
- [ ] "Review Conversation" pushes to chat screen in `isHistory: true` mode
- [ ] TOO_MANY_ERRORS end reason: shows study suggestion, no "Play Again" button
- [ ] INAPPROPRIATE/ABUSIVE end reason: shows warning, no "Play Again" button
- [ ] `SimulationRepository.getResult()` calls `GET /simulations/results/:id`
- [ ] `SimulationResultDetail` and `CriteriaScore` models parse from JSON
- [ ] `simulationResultDetailProvider` fetches by ID, shimmer/error states work

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/07-session-lifecycle-pause-cancel-completed.md`
