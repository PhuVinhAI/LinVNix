# PRD: Sâu hóa kiến trúc Backend LinVNix

Status: ready-for-agent

## Problem Statement

Backend LinVNix hiện có nhiều module nông — interface phức tạp ngang implementation, caller phải hiểu chi tiết nội bộ để sử dụng. Dẫn đến: (1) logic phân tán, sửa một hành vi phải đụng nhiều file; (2) seam không đáng tin cậy vì có đường truy cập dữ liệu song song (SQL thô); (3) test chỉ ở mức API integration, không test được logic nghiệp vụ độc lập; (4) module chết (TokenService) và module stub (RbacService.hasPermission luôn trả false) làm phức tạp codebase không mang lại giá trị.

## Solution

Sâu hóa 6 cụm module theo thứ tự ưu tiên, mỗi cụm chuyển từ nhiều module nông thành ít module sâu với interface nói ngôn ngữ miền (Khóa học, Bài học, Từ vựng, Ôn tập, Chấm đáp án) thay vì ngôn ngữ hạ tầng (Repository, Card, any). Đồng thời thiết lập cơ sở test đơn vị (Jest *.spec.ts) cho từng module sâu mới.

## User Stories

### Module Ôn tập Từ vựng ( ưu tiên 1)

1. Là developer, tôi muốn gọi `reviewVocabulary(userId, vocabularyId, rating)` và nhận về `{ nextReviewAt, masteryLevel }`, để không cần hiểu 8 trường FSRS Card
2. Là developer, tôi muốn logic map Card↔UserVocabulary gom tại một chỗ, để đổi schema FSRS chỉ sửa một module
3. Là developer, tôi muốn tính mastery level gom tại một chỗ (hiện nhân đôi giữa UserVocabulariesService và SpacedRepetitionService), để tránh hai tính toán cùng mục đích trả kết quả khác nhau
4. Là developer, tôi muốn test ôn tập từ vựng bằng cách assert `nextReviewAt` và `masteryLevel`, để test sống sót qua refactor nội bộ FSRS
5. Là developer, tôi muốn interface module ôn tập từ vựng không phơi bày type `Card`, để caller không phụ thuộc vào chi tiết thuật toán

### Module Vòng đời Token (ưu tiên 2)

6. Là developer, tôi muốn AuthService ủy quyền tạo/xác thực token cho một module Token Lifecycle riêng, để hiểu "đặt lại mật khẩu hoạt động thế nào?" chỉ cần đọc một module
7. Là developer, tôi muốn xóa TokenService chết (không ai gọi), để giảm nhầm lẫn cho người mới đọc code
8. Là developer, tôi muốn AuthService không inject trực tiếp 4 Repository<>, để tuân theo pattern repository dùng mọi nơi
9. Là developer, tôi muốn test vòng đời token (tạo → xác thực → hết hạn → dọn dẹp) độc lập, để không cần khởi tạo AuthService + JWT + Users + Email + Config + Logging
10. Là developer, tôi muốn AuthService giảm từ 534 dòng xuống dưới 200, để dễ duy trì và đọc

### Module Nội dung Khóa học (ưu tiên 3)

11. Là developer, tôi muốn lấy cấu trúc khóa học (Course → Units → Lessons) trong một method `getCourseStructure(courseId)`, để không cần gọi 4 service riêng lẻ
12. Là developer, tôi muốn xóa 4 service CRUD nông (UnitsService, LessonsService, ContentsService, GrammarService — mỗi cái 34 dòng pass-through), để giảm mã lặp không mang giá trị
13. Là developer, tôi muốn NotFoundException xử lý gom tại module Nội dung Khóa học, để logic không nhân đôi ở service + controller
14. Là developer, tôi muốn thêm bài học / nội dung qua một interface duy nhất, để không cần biết 4 controller khác nhau

### Module Chấm đáp án (ưu tiên 4)

15. Là developer, tôi muốn `assessAnswer()` trả `AssessmentResult { isCorrect, similarity?, partialCredit?, feedback? }` thay vì chỉ boolean, để UI hiển thị phản hồi chi tiết cho người học
16. Là developer, tôi muốn thêm loại bài tập mới bằng cách thêm một CheckerAdapter, không sửa switch trong ExerciseCheckerService, để đạt locality
17. Là developer, tôi muốn shim tương thích ngược (old format → new format) gom tại seam, không rải trong mỗi `check*` method, để khi hoàn tất migration chỉ xóa shim một chỗ
18. Là developer, tôi muốn test chấm đáp án cho từng loại bài tập độc lập, để thêm loại mới không ảnh hưởng test cũ
19. Là developer, tôi muốn interface chấm đáp án không nhận `| any`, để hệ thống type thực sự bảo vệ

### Khử SQL thô trong ProgressTransactionService (ưu tiên 5)

20. Là developer, tôi muốn mọi truy cập dữ liệu đi qua repository, để đổi schema bắt được lúc compile
21. Là developer, tôi muốn `completeLessonWithTransaction` gọi `UserExerciseResultsRepository.upsertResult()` và `UserVocabulariesRepository.updateMastery()` thay vì SQL thô, để seam repository đáng tin cậy
22. Là developer, tôi muốn bỏ hack `(this as any).queryRunner`, để @Transactional() hoạt động type-safe
23. Là developer, tôi muốn test transaction rollback mà không cần dự đoán bằng console.log, để đảm bảo tính nguyên tử

### Ghép nối chéo Admin (ưu tiên 6)

24. Là developer, tôi muốn AdminDashboardService không inject Repository từ module khác, để đổi schema entity không ảnh hưởng admin module
25. Là developer, tôi muốn truy vấn thống kê (totalUsers, DAU, topCourses, errorRate) định nghĩa nơi dữ liệu sống, để locality đúng chỗ
26. Là developer, tôi muốn test admin dashboard bằng adapter in-memory, để không cần entity graph đầy đủ

### Test đơn vị ( xuyên suốt)

27. Là developer, tôi muốn viết Jest unit test (*.spec.ts) cho từng module sâu mới, để bắt lỗi nghiệp vụ sớm không cần chạy server
28. Là developer, tôi muốn test chỉ assert hành vi quan sát được qua interface, để test sống sót qua refactor nội bộ
29. Là developer, tôi muốn xóa test cũ trên module nông khi test qua interface module sâu mới tồn tại, để tránh test trùng lặp bảo trì phí
30. Là developer, tôi muốn không mock repository nội bộ của module sâu, vì interface module sâu là mặt test, để test thực sự xác nhận hành vi kết hợp

## Implementation Decisions

### ID-1: Module Ôn tập Từ vựng — seam mới

Tạo module `VocabularyReview` với interface:

- `addVocabulary(userId, vocabularyId) → { id, nextReviewAt, masteryLevel }` — khởi tạo FSRS card nội bộ, caller chỉ thấy kết quả miền
- `reviewVocabulary(userId, vocabularyId, rating) → { id, nextReviewAt, masteryLevel, stability?, difficulty? }` — tính lịch ôn tiếp, caller thấy `nextReviewAt` + `masteryLevel` mặc định; `stability`/`difficulty` tùy chọn cho admin
- `getDueForReview(userId) → VocabularyDueForReview[]` — wrapper giữ nguyên
- `batchReview(userId, reviews[]) → VocabularyReviewResult[]` — wrapper giữ nguyên, sửa `console.error` → ném `LoggingService`

Mastery level tính tại một chỗ duy nhất bên trong module. Gộp `SpacedRepetitionService.getMasteryLevel()` (trả string) và `UserVocabulariesService.getMasteryLevel()` (trả enum) thành một implementation trả `MasteryLevel` enum.

`FSRSService` giữ nguyên — là module sâu đã (thuật toán thuần, không I/O, dependency category: in-process). `SpacedRepetitionService` gộp vào VocabularyReview module nội bộ, không còn inject từ bên ngoài.

Type `Card` không xuất hiện trong interface công khai của VocabularyReview.

### ID-2: Module Vòng đời Token — seam mới

Tạo module `TokenLifecycle` với interface:

- `createVerificationToken(userId) → { token, expiresAt }` — tạo token ngẫu nhiên 32 bytes, hết hạn 24h
- `verifyEmailToken(token) → { userId, email }` — tìm token chưa dùng, kiểm tra hết hạn, đánh dấu đã dùng
- `createPasswordResetToken(userId) → { token, expiresAt }` — xóa token cũ chưa dùng, tạo mới 32 bytes, hết hạn 1h
- `verifyPasswordResetToken(token) → { userId, email }` — tìm token chưa dùng, kiểm tra hết hạn, đánh dấu đã dùng
- `cleanupExpired() → { verificationTokensRemoved, passwordResetTokensRemoved, refreshTokensRemoved }`

AuthService inject `TokenLifecycle` thay vì 3 `Repository<>` token. Module nội bộ sở hữu 3 entity token và repository của chúng. `TokenService` chết bị xóa.

AuthService vẫn sở hữu refresh token (vì nó gắn liền với phiên đăng nhập, không phải vòng đời token một lần). Nhưng refresh token repository được bọc qua interface `RefreshTokenStore` nội bộ AuthService.

### ID-3: Module Nội dung Khóa học — gộp module nông

Gộp `UnitsService`, `LessonsService`, `ContentsService`, `GrammarService` thành `CourseContentService` trong module `courses`. Interface:

- `getCourseStructure(courseId) → { course, units: UnitWithLessons[] }` — trả cây đầy đủ
- `getUnitDetail(unitId) → UnitWithLessons` — trả unit + lessons
- `getLessonDetail(lessonId) → LessonWithContents` — trả lesson + contents + grammar
- CRUD riêng lẻ giữ cho admin: `createUnit`, `updateUnit`, `deleteUnit`, `createLesson`, `updateLesson`, `deleteLesson`, `createContent`, `updateContent`, `deleteContent`, `createGrammarRule`, `updateGrammarRule`, `deleteGrammarRule`

Các endpoint HTTP giữ nguyên (không đổi API contract). Chỉ nội bộ gom logic vào một service thay vì bốn.

4 repository nông gộp nội bộ vào `CourseContentService`. Repository có query giá trị (eager-load, search) giữ nguyên; repository pass-through bị nội bộ hóa.

4 controller giữ riêng (không gộp controller — mỗi resource vẫn có route riêng), nhưng controller ủy quyền cho `CourseContentService` thay vì service riêng lẻ.

### ID-4: Module Chấm đáp án — registry thay switch

Tạo `AnswerAssessment` module với interface:

- `assessAnswer(exerciseType, userAnswer, correctAnswer) → AssessmentResult`
- `AssessmentResult = { isCorrect: boolean, similarity?: number, partialCredit?: number, feedback?: string }`

Mỗi loại bài tập implement `CheckerAdapter` interface:

- `check(userAnswer, correctAnswer) → AssessmentResult`
- Registry: `Map<ExerciseType, CheckerAdapter>` — thêm loại mới = thêm entry map, không sửa switch

Shim tương thích ngược (old format → new format) gom vào `AnswerNormalizer` nội bộ, gọi trước khi delegate đến `CheckerAdapter`. Khi migration hoàn tất, xóa `AnswerNormalizer`.

Interface công khai chỉ nhận `ExerciseAnswer` (không `| any`). `AnswerNormalizer` nội bộ cast `any → ExerciseAnswer` nếu cần.

### ID-5: Khử SQL thô

Thêm method vào repository hiện có:

- `UserExerciseResultsRepository.upsertResult(userId, exerciseId, score, isCorrect)` — dùng TypeORM `save()` với `upsert` conflict handling
- `UserVocabulariesRepository.updateMastery(userId, vocabularyId, masteryLevel)` — dùng TypeORM `update()`

`ProgressTransactionService.completeLessonWithTransaction` gọi method repository mới qua `EntityManager` trong transaction, không viết SQL thô.

Hack `(this as any).queryRunner` được thay bằng pattern đúng: inject `DataSource` dưới tên `this.dataSource`, `@Transactional()` gắn `queryRunner` vào `this.dataSource` thông qua ALS hoặc chuẩn hóa theo NestJS best practice.

### ID-6: AdminDashboardService — port truy vấn

Định nghĩa 3 port trên seam admin module:

- `UserStatsPort { getTotalUsers(), getDAU() }` — implement bởi UsersService
- `CourseStatsPort { getTopCoursesByEnrollment(limit) }` — implement bởi CoursesService (hoặc CourseContentService sau ID-3)
- `ExerciseStatsPort { getExercisesWithHighestErrorRate(minAttempts, limit) }` — implement bởi ExercisesService

Mỗi port trả type DTO riêng (`UserStatsResult`, `CourseStatsResult`, `ExerciseStatsResult`), không phơi entity nội bộ.

`AdminDashboardService` chỉ inject 3 port, không inject `Repository<>` từ module khác.

### ID-7: Thứ tự thực hiện

Thực hiện theo thứ tự: ID-1 → ID-5 → ID-2 → ID-4 → ID-3 → ID-6.

Lý do: ID-1 và ID-5 liên quan mật thiết (vocabulary review và transaction); ID-2 độc lập; ID-4 độc lập; ID-3 là gộp lớn nhất, làm sau khi pattern sâu hóa đã quen; ID-6 phụ thuộc kết quả ID-3 (CourseContentService).

## Testing Decisions

### T1: Nguyên tắc chung — test qua interface, không test chi tiết nội bộ

Test chỉ assert hành vi quan sát được qua interface công khai của module sâu. Không assert trên nội bộ (Card.stability, state ordinal, private method). Nếu test phải đổi khi refactor nội bộ, test đang test sai chỗ.

### T2: Module nào được test

| Module | Loại test | Ghi chú |
|--------|-----------|---------|
| VocabularyReview | Jest *.spec.ts | Test `addVocabulary`, `reviewVocabulary`, `batchReview` — dùng in-memory adapter cho repository |
| TokenLifecycle | Jest *.spec.ts | Test tạo → xác thực → hết hạn → dọn dẹp — dùng in-memory repository adapter |
| AnswerAssessment | Jest *.spec.ts | Test `assessAnswer` cho từng loại bài tập — module thuần logic, không cần mock |
| FSRSService | Giữ nguyên test bun hiện có | Đã được test tốt; không đổi |
| CourseContentService | Jest *.spec.ts | Test `getCourseStructure`, CRUD — dùng in-memory adapter |
| ProgressTransactionService | Jest *.spec.ts | Test transaction rollback — dùng test DataSource thực (PGLite hoặc SQLite in-memory) |
| AdminDashboardService | Jest *.spec.ts | Test dùng port in-memory adapter |

### T3: Chiến lược mock — thay thế, không xếp lớp

Không mock repository nội bộ của module sâu. Module sâu là đơn vị test. Nếu module cần DB, dùng test DB in-memory (SQLite/PGLite) hoặc in-memory repository adapter — cùng seam, implementation khác.

Khi test module sâu mới tồn tại, xóa test cũ trên module nông đã gộp. Test cũ trên module nông = test chi tiết nội bộ, không mang giá trị sau khi gộp.

### T4: Prior art

- `exercise-options.spec.ts` — test type guard thuần, pattern đúng cho domain types
- `fsrs.test.ts` (bun) — test thuật toán thuần, pattern đúng cho FSRSService
- Integration tests trong `scripts/test/suites/` — test HTTP API contract, giữ nguyên

## Out of Scope

- Thêm loại bài tập mới (chỉ cấu trúc hóa registry, không thêm exercise type)
- Thay đổi API contract HTTP (endpoint, request/response shape giữ nguyên)
- Thay đổi schema database (entity, cột, quan hệ giữ nguyên)
- Sửa RbacService.hasPermission stub (vấn đề riêng, không liên quan sâu hóa kiến trúc)
- Sửa dialect test có assertion bị comment out (bug riêng)
- Di chuyển integration tests từ bun sang Jest
- Thiết lập CI/CD coverage reporting
- Frontend (admin/mobile) refactor

## Further Notes

- FSRS parameters hiện hardcoded trong FSRSService. Khi cần cá nhân hóa (per-user weights), thêm ConfigService injection — nhưng module sâu VocabularyReview ẩn chi tiết này khỏi caller.
- `batchReview` trong UserVocabulariesService hiện nuốt lỗi bằng `console.error`. Khi gộp vào VocabularyReview, đổi sang `LoggingService` và trả kết quả riêng cho từng item (thành công/thất bại), không nuốt.
- Thứ tự ID-1→ID-5 có thể chạy song song nếu 2 developer khác nhau phụ trách, vì chúng chạm nhau nhẹ (cùng đụng UserVocabulary entity nhưng qua seam khác nhau).
