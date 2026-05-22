Status: done

## Parent

.scratch/image-discovery/PRD.md

## What to build

Khám phá ảnh — minimal end-to-end slice: Học viên taps camera FAB in bottom nav, takes one photo, asks AI a question, gets a structured markdown response with inline vocabulary cards.

**Backend**: Extend GenaiService — add `attachments?: AiAttachment[]` to `AiChatMessage` where `AiAttachment = { type: 'image', mimeType: string, data: string }`. Modify `mapMessagesToContents()` to include `{ inlineData: { mimeType, data } }` parts alongside `{ text }` when attachments present. New `image-analysis` module with stateless `POST /api/v1/image-analysis/analyze` endpoint (single image, no chatHistory yet). Uses `chatStructured()` with `Type.*` JSON schema + Zod post-validation (following ExerciseGenerationService / SimulationAiService pattern). Response: `{ text: string, vocabularies: [] }`. Reuse `Permission.AI_CHAT`. New prompt template `image-discovery.yaml`.

**Mobile**: Modify `AppNavBar` to 5 positions — center item is a protruding circular FAB, tapping pushes to `/camera` (top-level GoRoute outside ShellRoute, no bottom nav). `ImageDiscoveryScreen` with: camera image picker, chat messages area, floating text input above keyboard, loading indicator, error state, AI markdown responses, session resets on screen dispose. Local Riverpod `NotifierProvider` (autodisposed) holds images + messages + loading.

## Acceptance criteria

- [x] GenaiService `chatStructured()` includes `inlineData` parts when attachments present; text-only calls still work
- [x] Unit test verifies multimodal content mapping + backward compatibility
- [x] `POST /api/v1/image-analysis/analyze` accepts `{ images: [{ base64, mimeType }], prompt }` (max 1 image in this slice)
- [x] Returns structured `{ text, vocabularies }` with Zod-validated shape
- [x] Validates prompt non-empty, mimeType valid; returns error on AI failure
- [x] Prompt template `image-discovery.yaml` instructs AI to act as Vietnamese tutor, respond in user's native language, extract vocabulary
- [x] Bottom nav shows center FAB; tapping pushes to `/camera` route
- [x] `/camera` route is top-level GoRoute (no ShellRoute, no bottom nav)
- [x] ImageDiscoveryScreen: camera capture → send to AI → display markdown response
- [x] Loading indicator while AI processes; error message on failure
- [x] Floating input stays above keyboard; session resets on leave
- [x] Unit tests for ImageAnalysis controller + service; widget test for bottom nav FAB

## Implementation notes

### Files created

- `backend/src/infrastructure/genai/prompts/image-discovery.yaml` — Adds the structured Vietnamese tutor prompt for image-based analysis.
- `backend/src/modules/image-analysis/dto/analyze-image.dto.ts` — Defines request DTOs and supported image MIME types for the one-image slice.
- `backend/src/modules/image-analysis/application/image-analysis.service.ts` — Implements validation, prompt rendering, multimodal `chatStructured()` call, and Zod response validation.
- `backend/src/modules/image-analysis/application/image-analysis.service.spec.ts` — Covers service success, validation, schema parsing, and AI failure behavior.
- `backend/src/modules/image-analysis/presentation/image-analysis.controller.ts` — Adds `POST /image-analysis/analyze` with `AI_CHAT` permission.
- `backend/src/modules/image-analysis/presentation/image-analysis.controller.spec.ts` — Covers controller delegation and user profile forwarding.
- `backend/src/modules/image-analysis/image-analysis.module.ts` — Wires the image analysis controller and service.
- `mobile/lib/features/image_discovery/domain/image_analysis_models.dart` — Adds request/response models for image analysis.
- `mobile/lib/features/image_discovery/data/image_analysis_api.dart` — Adds the Dio API client for `/image-analysis/analyze`.
- `mobile/lib/features/image_discovery/data/image_analysis_providers.dart` — Provides the image analysis API through Riverpod.
- `mobile/lib/features/image_discovery/application/image_discovery_notifier.dart` — Adds local auto-disposed state for image selection, prompt sending, loading, and errors.
- `mobile/lib/features/image_discovery/presentation/screens/image_discovery_screen.dart` — Adds the camera screen with image preview, markdown chat response, vocabulary cards, quick actions, and floating input.
- `mobile/test/core/theme/widgets/app_nav_bar_test.dart` — Adds widget coverage for the center camera FAB.
- `mobile/test/features/image_discovery/presentation/image_discovery_screen_test.dart` — Adds widget coverage for image send/render and error state.

### Files modified

- `backend/src/app.module.ts` — Registers `ImageAnalysisModule`.
- `backend/src/infrastructure/genai/genai.service.ts` — Adds image attachments and maps them to Models API `inlineData` parts.
- `backend/src/infrastructure/genai/genai.service.spec.ts` — Adds multimodal structured chat and text-only compatibility coverage.
- `mobile/pubspec.yaml` — Adds `image_picker`.
- `mobile/pubspec.lock` — Locks the new image picker dependency graph.
- `mobile/linux/flutter/generated_plugin_registrant.cc` — Registers image picker Linux plugins generated by `flutter pub get`.
- `mobile/linux/flutter/generated_plugins.cmake` — Adds image picker Linux plugin metadata generated by `flutter pub get`.
- `mobile/macos/Flutter/GeneratedPluginRegistrant.swift` — Registers image picker macOS plugin generated by `flutter pub get`.
- `mobile/windows/flutter/generated_plugin_registrant.cc` — Registers image picker Windows plugins generated by `flutter pub get`.
- `mobile/windows/flutter/generated_plugins.cmake` — Adds image picker Windows plugin metadata generated by `flutter pub get`.
- `mobile/lib/core/theme/widgets/app_nav_bar.dart` — Adds the protruding center camera FAB while keeping four tab destinations.
- `mobile/lib/core/presentation/shell_screen.dart` — Wires the center FAB to `context.push('/camera')`.
- `mobile/lib/core/router/app_router.dart` — Adds top-level `/camera` route outside the shell route.
- `mobile/lib/features/assistant/presentation/assistant_visibility.dart` — Hides the assistant surface on `/camera`.
- `mobile/lib/features/assistant/presentation/global_assistant_shell.dart` — Avoids reading Riverpod `ref` during dispose and removes both router listeners.
- `mobile/lib/core/sync/data_change_bus.dart` — Uses a monotonic emit counter so repeated logical tags always notify subscribers.
- `mobile/test/features/bookmarks/presentation/widgets/bookmark_icon_button_test.dart` — Adds app theme setup needed by the existing widget test.
- `mobile/test/widget_test.dart` — Isolates app shell tests from network providers and updates assertions for the custom nav bar.
- `.scratch/image-discovery/issues/02-kham-pha-anh-chup-1-anh-chat-ai.md` — Marks the slice done and records implementation notes.

### Files deleted

- None.

## Blocked by

None — can start immediately
