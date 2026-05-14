Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Create a shared custom practice bottom sheet component for Flutter that works across all three levels (lesson, module, course). Two modes: (1) creation form — config fields (questionCount slider 1-30, exerciseType chips, focusArea selector) + userPrompt textarea (max 500 chars) + Create button; (2) info view — AI-generated title, description, config summary, progress stats, action buttons (Start/Continue, Regenerate, Reset Progress, Delete). Upgrade the existing lesson-level custom practice UI in ExerciseHubScreen to use this shared component and display AI-generated title/description instead of hardcoded "Custom Practice". Update mobile domain models to include description and userPrompt fields on ExerciseSetModel. Update LessonRepository to pass userPrompt when creating/generating/regenerating.

## Acceptance criteria

- [ ] Shared bottom sheet widget with two modes: creation form and info view
- [ ] Creation form: questionCount slider (1-30), exerciseType chips, focusArea selector, userPrompt textarea (max 500 chars), Create button
- [ ] Info view: AI-generated title, description, config summary, progress stats, action buttons (Start/Continue, Regenerate, Reset, Delete)
- [ ] ExerciseSetModel updated with nullable description and userPrompt fields
- [ ] Lesson-level ExerciseHubScreen uses shared bottom sheet component
- [ ] Lesson custom practice sets display AI-generated title and description instead of "Custom Practice"
- [ ] LessonRepository.createCustomSet() accepts optional userPrompt
- [ ] LessonRepository.generateSet() and regenerateExercises() accept optional userPrompt override
- [ ] Lesson-level creation form pre-fills userPrompt if stored on the set (for regeneration)
- [ ] Widget test: bottom sheet creation form renders correctly with all fields
- [ ] Widget test: info view displays title, description, stats, and action buttons

## Blocked by

- `04-lesson-custom-practice-upgrade` (backend must support userPrompt + AI title/description)
