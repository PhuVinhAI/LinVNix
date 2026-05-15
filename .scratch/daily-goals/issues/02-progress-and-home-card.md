Status: done

## Parent

`.scratch/daily-goals/PRD.md`

## What to build

Học viên thấy "Tiến trình hôm nay" card trên home screen với progress từng mục tiêu (bài tập hoàn thành, phút truy cập app, bài học hoàn thành). Backend tính aggregation on-demand: đếm UserExerciseResult theo attemptedAt trong ngày VN, đếm UserProgress COMPLETED theo completedAt trong ngày VN, nhận studyMinutes sync từ mobile. Mobile triển khai AppSessionTimer (WidgetsBindingObserver) đếm phút foreground, sync lên backend khi pause. Home card hiển thị progress per-goal + tự refresh qua DataChangeBus.

## Acceptance criteria

- [x] `DailyGoalProgress` entity extends `BaseEntity`, có `userId`, `date` (DATE, VN timezone), `exercisesCompleted`, `studyMinutes`, `lessonsCompleted`, unique constraint `(userId, date)`
- [x] `GET /api/v1/daily-goals/progress/today` trả về progress hôm nay cho tất cả active goals + `allGoalsMet` boolean
- [x] Aggregation logic: `exercisesCompleted` = count UserExerciseResult attemptedAt trong ngày VN; `lessonsCompleted` = count UserProgress COMPLETED trong ngày VN
- [x] `PATCH /api/v1/daily-goals/progress/study-minutes` nhận `{ studyMinutes: number }` — upsert, mobile sync
- [x] `allGoalsMet` computed bằng so sánh mỗi active goal targetValue với progress field tương ứng
- [x] Backend unit tests cho DailyGoalProgressService: aggregation logic, allGoalsMet computation, study-minutes sync
- [x] Mobile: `AppSessionTimer` — WidgetsBindingObserver ở app root, start/resume khi foreground, pause khi background, reset khi đổi ngày VN
- [x] Mobile: AppSessionTimer sync accumulated minutes lên backend khi app pause
- [x] Mobile: `appSessionMinutesProvider` expose int phút hôm nay
- [x] Mobile: DailyGoalProgressCard chèn vào home screen giữa ContinueCard và Courses section
- [x] Card hiển thị: per-goal progress bar/ring với label (vd "8/10 bài tập")
- [x] Progress provider watch DataChangeBus tags `{'daily-goal', 'exercise', 'progress'}` — tự refresh khi data thay đổi
- [x] Lint + typecheck + unit test pass

## Blocked by

- `.scratch/daily-goals/issues/01-daily-goal-crud.md`

## Implementation notes

### Files created

- `backend/src/modules/daily-goals/domain/daily-goal-progress.entity.ts` — DailyGoalProgress entity extends BaseEntity, unique (userId, date), columns: exercisesCompleted, studyMinutes, lessonsCompleted
- `backend/src/modules/daily-goals/application/daily-goal-progress.repository.ts` — TypeORM repository với findByUserIdAndDate, upsert, create
- `backend/src/modules/daily-goals/application/daily-goal-progress.service.ts` — Aggregation logic (VN timezone date range), allGoalsMet computation, studyMinutes sync, getProgressForGoalType
- `backend/src/modules/daily-goals/application/daily-goal-progress.service.spec.ts` — 12 unit tests covering aggregation, allGoalsMet, study-minutes sync, goal type mapping, VN date range
- `backend/src/modules/daily-goals/dto/sync-study-minutes.dto.ts` — SyncStudyMinutesDto (studyMinutes >= 0)
- `backend/src/modules/daily-goals/dto/daily-goal-progress-response.dto.ts` — DailyGoalProgressResponseDto + GoalProgressDto (per-goal target vs actual + met boolean)
- `backend/src/modules/daily-goals/presentation/daily-goal-progress.controller.ts` — GET /progress/today + PATCH /progress/study-minutes, JwtAuthGuard
- `mobile/lib/features/daily_goals/domain/daily_goal_progress_models.dart` — GoalProgress (goalType, targetValue, currentValue, met, progress fraction, label) + DailyGoalProgress (date, exercisesCompleted, studyMinutes, lessonsCompleted, allGoalsMet, goals list)
- `mobile/lib/features/daily_goals/data/daily_goal_progress_repository.dart` — Dio repository: getTodayProgress(), syncStudyMinutes()
- `mobile/lib/features/daily_goals/data/daily_goal_progress_providers.dart` — DailyGoalProgressNotifier (CachedRepository + DataChangeBusSubscriber with tags {'daily-goal', 'exercise', 'progress'}), syncStudyMinutes() method
- `mobile/lib/features/daily_goals/data/app_session_timer.dart` — AppSessionTimer class (foreground time tracking, VN date reset, sync on pause), appSessionTimerProvider, appSessionMinutesProvider
- `mobile/lib/features/daily_goals/presentation/widgets/daily_goal_progress_card.dart` — DailyGoalProgressCard: "Tiến trình hôm nay" card with per-goal AppProgress bar + label, allGoalsMet badge, shimmer loading

### Files modified

- `backend/src/modules/daily-goals/daily-goals.module.ts` — Added DailyGoalProgress entity, DailyGoalProgressRepository, DailyGoalProgressService, DailyGoalProgressController; imported ExercisesModule and ProgressModule (forwardRef)
- `backend/src/modules/exercises/application/repositories/user-exercise-results.repository.ts` — Added countByUserIdAndDateRange() method for exercise aggregation
- `backend/src/modules/progress/application/progress.repository.ts` — Added countCompletedByUserIdAndDateRange() method for lesson completion aggregation
- `mobile/lib/features/home/presentation/screens/home_screen.dart` — Added DailyGoalProgressCard import and inserted between ContinueCard and Courses section
- `mobile/lib/core/presentation/shell_screen.dart` — Changed from StatelessWidget to ConsumerStatefulWidget with WidgetsBindingObserver; integrated AppSessionTimer lifecycle (onAppResumed/onAppPaused)

### Files deleted

None
