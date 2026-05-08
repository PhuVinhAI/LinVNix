Status: ready-for-agent

## Parent

PRD: `.scratch/architecture-deepening/PRD.md`

## What to build

Hấp thụ 4 service CRUD nông vào `CourseContentService`. Xóa `UnitsService`, `LessonsService`, `ContentsService`, `GrammarService` (mỗi cái 34 dòng pass-through). Xóa repository nông tương ứng (`ExercisesRepository`, `GrammarRepository`, `ContentsRepository` — pass-through, không query giá trị).

`CourseContentService` sở hữu toàn bộ CRUD: `createUnit`, `updateUnit`, `deleteUnit`, `createLesson`, `updateLesson`, `deleteLesson`, `createContent`, `updateContent`, `deleteContent`, `createGrammarRule`, `updateGrammarRule`, `deleteGrammarRule`.

4 controller ủy quyền cả read lẫn write cho `CourseContentService`. Repository có query giá trị (eager-load CoursesRepository, UnitsRepository, LessonsRepository, search VocabulariesRepository) giữ nguyên và được `CourseContentService` dùng nội bộ.

Cập nhật Jest *.spec.ts cho CourseContentService — thêm test CRUD operations.

## Acceptance criteria

- [ ] `UnitsService`, `LessonsService`, `ContentsService`, `GrammarService` bị xóa
- [ ] Repository pass-through bị nội bộ hóa
- [ ] 4 controller ủy quyền toàn bộ cho `CourseContentService`
- [ ] CRUD operations hoạt động đúng qua `CourseContentService`
- [ ] Jest *.spec.ts cho CourseContentService CRUD pass
- [ ] Integration tests vẫn pass
- [ ] HTTP API contract không đổi

## Blocked by

- `09-course-content-structure.md`
