Status: done

## Parent

PRD: `.scratch/architecture-deepening/PRD.md`

## What to build

Định nghĩa 3 port trên seam admin module:

- `UserStatsPort { getTotalUsers(), getDAU() }` — implement bởi UsersService
- `CourseStatsPort { getTopCoursesByEnrollment(limit) }` — implement bởi CourseContentService
- `ExerciseStatsPort { getExercisesWithHighestErrorRate(minAttempts, limit) }` — implement bởi ExercisesService

Mỗi port trả type DTO riêng (`UserStatsResult`, `CourseStatsResult`, `ExerciseStatsResult`), không phơi entity nội bộ. `AdminDashboardService` chỉ inject 3 port, không inject `Repository<>` từ module khác.

Viết Jest *.spec.ts cho `AdminDashboardService` — dùng in-memory port adapters.

## Acceptance criteria

- [x] 3 port interface tồn tại (`UserStatsPort`, `CourseStatsPort`, `ExerciseStatsPort`)
- [x] Mỗi port trả DTO riêng, không phơi entity
- [x] `AdminDashboardService` chỉ inject 3 port, không inject `Repository<>` chéo module
- [x] UsersService, CourseContentService, ExercisesService implement port tương ứng
- [x] Jest *.spec.ts cho AdminDashboardService pass (dùng in-memory port adapters)
- [x] Admin integration tests (`vocabulary-enhancements.test.ts` dashboard endpoint) vẫn pass
- [x] HTTP API contract không đổi

## Blocked by

- `10-course-content-absorb-crud.md`
