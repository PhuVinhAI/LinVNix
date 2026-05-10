Status: done

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Replace the empty Flutter counter template with a full project scaffold. Configure all dependencies (riverpod, go_router, dio, freezed, json_serializable, drift, flutter_secure_storage, shared_preferences, connectivity_plus, flutter_local_notifications, google_sign_in, local_auth, just_audio, chewie, cached_network_image, flutter_dotenv). Set up feature-first directory structure (`lib/features/<feature>/data|domain|presentation/`, `lib/core/`). Create the Material 3 theme with `ColorScheme.fromSeed()` using a brand seed color, a custom `ThemeExtension` for Vietnamese cultural accent tokens, Be Vietnam Pro font bundled and applied to Vietnamese content text, and dark mode support. Set up go_router with an auth redirect guard (unauthenticated → `/login`, authenticated → `/home`), bottom navigation shell with 4 tabs (Home `/`, Courses `/courses`, Review `/review`, Profile `/profile`), and nested route placeholders. Configure Dio with base URL from `--dart-define` / `.env` fallback, the three interceptors (AuthInterceptor, TokenRefreshInterceptor, ResponseUnwrapInterceptor), and domain exception mapping. Set up build_runner for freezed + json_serializable + drift + riverpod_generator. Create a `.env.example` with `API_URL` and `GOOGLE_CLIENT_ID`. The app should launch, show the bottom nav shell, and navigate between empty tab placeholders with correct theming and font.

## Acceptance criteria

- [x] `flutter analyze` passes with zero errors
- [x] `dart run build_runner build` succeeds generating all code
- [x] App launches on iOS simulator and Android emulator showing bottom nav with 4 tabs
- [x] Tapping each tab navigates to its placeholder screen
- [x] Be Vietnam Pro font renders on Vietnamese text widgets
- [x] Dark mode toggles correctly via system setting
- [x] Auth redirect guard redirects to `/login` when no token is stored
- [x] Dio client sends requests to configured base URL with `/api/v1` prefix
- [x] All PRD-specified packages are in pubspec.yaml and resolve

## Blocked by

None - can start immediately

## Implementation notes

- Used `google_fonts` package for Be Vietnam Pro (runtime loading) instead of bundled TTF files due to download constraints during development. Can be switched to bundled assets later.
- Riverpod 3.x (latest) with `Notifier` pattern instead of deprecated `StateNotifier`
- go_router 17.x with `ShellRoute` for bottom navigation
- Dio 5.x with 3 interceptors as specified
- Material 3 with `ColorScheme.fromSeed()` for both light/dark themes
- 3 widget tests covering: auth redirect, bottom navigation, tab navigation
