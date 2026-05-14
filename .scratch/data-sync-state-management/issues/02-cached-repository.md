Status: `completed`

## What to build

Create the abstract `CachedRepository<T>` — a generic base class that encapsulates TTL-based cache-first reads, optimistic writes, API reconciliation, and failure revert. Every entity-specific provider in subsequent slices will extend this class instead of writing boilerplate.

### Key design decisions (from PRD)

- **TTL per entity type**: configurable duration — rarely-changing data (courses: 30min) re-fetches less often than volatile data (progress: 1min)
- **Cache-first read**: if `lastFetchedAt + ttl > now` → return cached data; if expired → fetch from API
- **Fresh provider (no data)**: always fetches from API
- **`mutate()` method**: saves snapshot → optimistic state update → API call → on success: reconcile with API response + emit DataChangeBus event → on failure: restore snapshot + show error
- **`fetchFromApi()`**: abstract method, implemented per entity
- **`build()`**: returns current state, checks TTL, calls `fetchFromApi()` if expired
- **DataChangeBus integration**: `mutate()` calls `emit()` on the bus after successful reconcile
- When a mutation occurs (optimistic + reconcile), state updates immediately regardless of TTL. TTL only controls automatic re-fetch on screen open.

### TTL reference table

| Entity | TTL |
|---|---|
| Course, CourseModule | 30 minutes |
| LessonDetail | 10 minutes |
| LessonVocabulary | 5 minutes |
| BookmarkWithVocabulary | 2 minutes |
| UserProgress | 1 minute |
| ExerciseSet / TierProgress | 1 minute |
| ExerciseStats, ContinueLearning, BookmarkStats, LessonTierSummary | No TTL (ephemeral) |

## Acceptance criteria

- [x] Abstract `CachedRepository<T>` class with configurable TTL per entity
- [x] `fetchFromApi()` abstract method for entity-specific implementation
- [x] `build()` method with TTL check and cache-first logic
- [x] `mutate()` method implementing optimistic write → API → reconcile/revert pattern
- [x] `mutate()` emits DataChangeBus event only after API success (not on optimistic write)
- [x] `mutate()` restores previous state snapshot on API failure
- [x] Unit test: fresh provider → always fetches from API
- [x] Unit test: data within TTL → returns cached, no API call
- [x] Unit test: data past TTL → refetches from API
- [x] Unit test: optimistic write → state updates immediately
- [x] Unit test: API success → state reconciled with response
- [x] Unit test: API failure → state reverted to snapshot, error available

## Blocked by

- Issue 01 (DataChangeBus + Event Infrastructure) — `mutate()` needs DataChangeBus.emit()

## Implementation notes

### Files created

- `mobile/lib/core/sync/cached_repository.dart` — Abstract class `CachedRepository<T>` extends `AsyncNotifier<T>`. Cung cấp:
  - `Duration get ttl` (abstract) cho subclass định nghĩa.
  - `Future<T> fetchFromApi()` (abstract) cho entity-specific API call.
  - `Future<T> build()` — cache-first logic: trả `_cachedData` nếu còn trong TTL, ngược lại gọi `fetchFromApi()` và lưu cache + timestamp.
  - `Future<void> mutate({required T optimisticData, required Future<T> Function() apiCall, required Set<String> emitTags})` — lưu snapshot, optimistic update state, gọi API, reconcile + emit DataChangeBus nếu success, revert snapshot nếu failure.
  - `void forceExpire()` — helper để test invalidate TTL.
- `mobile/test/core/sync/cached_repository_test.dart` — 6 unit tests cover:
  - Fresh provider luôn gọi `fetchFromApi()`
  - Data trong TTL trả cached, không gọi API
  - Data quá TTL refetch từ API
  - Optimistic write cập nhật state ngay lập tức
  - API success → state reconcile + emit DataChangeBus event
  - API failure → state revert về snapshot, error rethrow cho caller

### Files modified

- `mobile/lib/core/sync/sync.dart` — Thêm export `cached_repository.dart`.

### Files deleted

- Không có file nào bị xóa.

### Pipeline notes

- `flutter analyze` pass với 0 lỗi từ code mới.
- `flutter test test/core/sync/` pass 14/14 (8 tests từ issue 01 + 6 tests mới).
- Không sinh thêm file `.g.dart` hay `.freezed.dart` vì `CachedRepository` là abstract class thuần, không dùng code generation.
