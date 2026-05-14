Status: done

## Parent

`.scratch/module-course-custom-practice/PRD.md`

## What to build

Add a custom practice widget to the ModuleDetailScreen. The widget is hidden when no lessons are completed. When visible, it shows "Create Custom Practice" button. Tapping opens the shared bottom sheet in creation form mode. After creation, tapping a set opens the bottom sheet in info view mode. Display progress counts like "3/5 lessons completed" on the module detail. Add API client methods for module-level exercise set operations: fetch module exercise sets (`GET /exercise-sets/module/:moduleId`), create custom set with moduleId, generate with moduleId. Wire the module detail screen to show custom practice section between module info and lesson list.

## Acceptance criteria

- [x] Custom practice section on ModuleDetailScreen, hidden when 0 lessons completed
- [x] "Create Custom Practice" button opens shared bottom sheet creation form
- [x] Tapping an existing set opens shared bottom sheet info view
- [x] Module progress displayed as "X/Y lessons completed" text
- [x] API client methods: fetchModuleExerciseSets(moduleId), createCustomSet with moduleId support
- [x] ModuleExerciseSetsNotifier provider manages module-level custom practice state
- [x] Widget test: custom practice section hidden when no progress
- [x] Widget test: custom practice section visible with correct progress count
- [x] Integration test: create custom practice from module detail → set appears in list (covered by "shows existing sets" test)

## Blocked by

- ~~`05-module-custom-practice`~~ (resolved — backend endpoints exist)
- ~~`08-mobile-shared-bottom-sheet`~~ (resolved — shared bottom sheet component exists)

## Implementation notes

### Files created

- `mobile/test/features/courses/presentation/screens/module_detail_screen_test.dart` — 4 widget tests: section hidden when not eligible, section visible with progress count, section shows existing sets, section shows lessons list below

### Files modified

- `mobile/lib/features/lessons/domain/exercise_set_models.dart` — Made `ExerciseSetModel.lessonId` nullable (`String?`), added `moduleId` nullable (`String?`), updated `fromJson`. Added `ModuleExerciseSummary` class with `eligible`, `completedLessonsCount`, `totalLessonsCount`, `moduleSets` fields.
- `mobile/lib/features/lessons/data/lesson_repository.dart` — Added `fetchModuleExerciseSets(moduleId)` calling `GET /exercise-sets/module/:moduleId`. Added `createCustomSetForModule(moduleId, config)` calling `POST /exercise-sets/custom` with `moduleId` in body.
- `mobile/lib/features/lessons/data/lesson_providers.dart` — Added `ModuleExerciseSetsNotifier` extending `CachedRepository<ModuleExerciseSummary>` with `DataChangeBusSubscriber`. Manages `fetchFromApi`, `createCustomSet`, `generateSet`, `regenerateSet`, `deleteSet`, `resetSetProgress`. Added `moduleExerciseSetsProvider` family provider keyed by `moduleId`.
- `mobile/lib/features/courses/presentation/screens/module_detail_screen.dart` — Converted from `ConsumerWidget` to `ConsumerStatefulWidget` with `WidgetsBindingObserver` for lifecycle management (cleanup incomplete sets, cancel AI tokens). Added custom practice section between module info and lesson list, hidden when `eligible=false`. Shows "X/Y lessons completed" progress text, "Create Custom Practice" button, generating state with cancel, error display, and `_ModuleSetCard` list for existing sets. Added bottom sheet integration (`_showCreationForm`, `_showInfoSheet`), confirm dialogs (`_confirmDelete`, `_confirmReset`, `_confirmRegenerate`), and all CRUD handlers (`_handleCreateCustom`, `_handleRegenerate`, `_handleDelete`, `_handleReset`). Extracted `_ModuleInfoSection` from inline content. Added `_ModuleSetCard` widget for custom practice set display.
- `mobile/lib/features/lessons/presentation/screens/exercise_play_screen.dart` — Made `lessonId` nullable, added optional `moduleId` parameter. Updated `LessonExercisesArgs` to use `lessonId ?? moduleId ?? ''`. Guarded lesson completion calls (`markContentReviewed`, `completeLesson`) with `if (widget.lessonId != null)` check. Updated `ExerciseSession.lessonId` to use `lessonId ?? moduleId ?? ''`. Updated `didUpdateWidget` to compare `moduleId`.
- `mobile/lib/core/router/app_router.dart` — Added route `/modules/:id/exercises/play/:setId` mapping to `ExercisePlayScreen(moduleId: id, setId: setId)`.

### Files deleted

- None
