Status: `completed`

## What to build

Create the DataChangeBus — a Riverpod-native tagged event bus that enables cross-provider mutation propagation without manual `ref.invalidate()` calls from UI code. This is the foundational infrastructure that all subsequent slices depend on.

The DataChangeBus is a `StateNotifierProvider` that emits `DataChanged` events carrying a `Set<String>` of tags. Providers subscribe by filtering tags in their `build()` method. Events are emitted **only after API success + reconcile** (not on optimistic write) to prevent ephemeral providers from refetching on failed mutations.

Also set up the code generation pipeline (build_runner, analysis_options config for riverpod_lint) since subsequent slices will use `@riverpod` and `@freezed` for new code.

### Key design decisions (from PRD)

- Event shape: `DataChanged(tags: Set<String>)` — use `@freezed`
- Provider: `StateNotifierProvider<DataChangeBus, DataChanged?>` — use `@riverpod`
- Tag vocabulary: `'bookmark'`, `'vocabulary-$id'`, `'progress'`, `'lesson-$lessonId'`, `'exercise'`, `'exercise-set'`, `'auth'`
- Tag subscription utility: helper that lets providers watch specific tags and auto-invalidate when matching events arrive
- Extensible tag system: adding new providers or mutations doesn't require creating new event types

## Acceptance criteria

- [x] `DataChanged` freezed model with `tags` field (`Set<String>`)
- [x] `DataChangeBus` notifier with `emit(tags)` method, exposed via `@riverpod` provider
- [x] Tag subscription utility that any AsyncNotifier can use to auto-invalidate on matching events
- [x] Unit tests: emit event with tags → only matching subscribers invalidate
- [x] Unit tests: emit event with no matching tags → no subscriber reacts
- [x] Unit tests: multiple emissions → all processed
- [x] build_runner pipeline configured and running without errors
- [x] All generated files (`.g.dart`, `.freezed.dart`) compile cleanly

## Blocked by

None — can start immediately

## Implementation notes

### Files created

- `mobile/lib/core/sync/data_changed.dart` — Freezed model `DataChanged` với field `tags: Set<String>`. Dùng `@freezed` annotation; generated file: `data_changed.freezed.dart`.
- `mobile/lib/core/sync/data_change_bus.dart` — `DataChangeBus` extends `_$DataChangeBus` (generated Notifier base) với `@Riverpod(keepAlive: true)`. Cung cấp method `emit(Set<String> tags)` để cập nhật state. Generated file: `data_change_bus.g.dart`.
- `mobile/lib/core/sync/tag_subscription.dart` — Chứa:
  - `DataChangeBusSubscriber<T>` mixin: dùng `ref.listen(dataChangeBusProvider, ...)` và gọi `ref.invalidateSelf()` khi tags giao nhau.
  - `RefTagSubscription` extension trên `Ref`: `watchDataChangeTags(Set<String> tags, VoidCallback onMatch)` để bất kỳ provider nào cũng có thể subscribe.
- `mobile/lib/core/sync/sync.dart` — Barrel file export cả 3 file trên.
- `mobile/test/core/sync/data_change_bus_test.dart` — 8 unit tests cover:
  - Initial state null
  - Emit cập nhật state
  - Emit overwrite previous state
  - Matching tag trigger rebuild
  - Non-matching tag không trigger rebuild
  - Multiple emissions đều processed
  - `RefTagSubscription` calls `onMatch` khi tags intersect
  - `RefTagSubscription` không call `onMatch` khi tags không intersect

### Files modified

- `mobile/lib/core/sync/data_changed.dart` — Đổi `class` thành `abstract class` để tương thích với freezed 3.x generated mixin.

### Files deleted

- Không có file nào bị xóa.

### Pipeline notes

- `build_runner` đã được cấu hình sẵn trong `pubspec.yaml` (`build_runner`, `freezed`, `riverpod_generator`, `riverpod_lint`). Không cần thay đổi config thêm.
- `flutter analyze` pass với 0 lỗi từ code mới (các warnings còn lại là pre-existing).
- `flutter test` pass 124/124 unit tests (widget tests pre-existing fail không liên quan đến thay đổi này).
- Generated code compile cleanly.
