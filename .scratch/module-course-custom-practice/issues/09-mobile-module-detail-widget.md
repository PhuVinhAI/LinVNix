Status: ready-for-agent

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Add a custom practice widget to the ModuleDetailScreen. The widget is hidden when no lessons are completed. When visible, it shows "Create Custom Practice" button. Tapping opens the shared bottom sheet in creation form mode. After creation, tapping a set opens the bottom sheet in info view mode. Display progress counts like "3/5 lessons completed" on the module detail. Add API client methods for module-level exercise set operations: fetch module exercise sets (`GET /exercise-sets/module/:moduleId`), create custom set with moduleId, generate with moduleId. Wire the module detail screen to show custom practice section between module info and lesson list.

## Acceptance criteria

- [ ] Custom practice section on ModuleDetailScreen, hidden when 0 lessons completed
- [ ] "Create Custom Practice" button opens shared bottom sheet creation form
- [ ] Tapping an existing set opens shared bottom sheet info view
- [ ] Module progress displayed as "X/Y lessons completed" text
- [ ] API client methods: fetchModuleExerciseSets(moduleId), createCustomSet with moduleId support
- [ ] ModuleExerciseSetsNotifier provider manages module-level custom practice state
- [ ] Widget test: custom practice section hidden when no progress
- [ ] Widget test: custom practice section visible with correct progress count
- [ ] Integration test: create custom practice from module detail → set appears in list

## Blocked by

- `05-module-custom-practice` (backend module custom practice endpoints must exist)
- `08-mobile-shared-bottom-sheet` (shared bottom sheet component must exist)
