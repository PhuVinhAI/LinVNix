# PRD: LinVNix Mobile App

Status: ready-for-agent

## Problem Statement

The LinVNix backend has a fully-built Vietnamese language learning API (courses, lessons, vocabulary, grammar, exercises, FSRS-based spaced repetition, progress tracking) but there is no mobile app for learners. The current `mobile/` directory is an empty Flutter counter template. Learners need a native iOS/Android experience to study Vietnamese on the go, review vocabulary with spaced repetition, complete exercises, and track their progress — the core use case for a language learning platform.

## Solution

Build a complete Flutter mobile app that consumes the existing backend API, delivering a focused learner experience with four primary tabs: Home (continue learning + due reviews), Courses (browse and study), Review (FSRS-based vocabulary flashcard review), and Profile (settings + stats). The app will support email/password and Google Sign-In authentication, step-by-step lesson wizards with 6 exercise types, Anki-style vocabulary review with offline support, and biometric unlock.

## User Stories

### Authentication & Onboarding

1. As a new user, I want to register with email and password, so that I can create an account
2. As a new user, I want to verify my email address, so that my account is confirmed
3. As a returning user, I want to log in with email and password, so that I can access my learning data
4. As a user, I want to log in with Google Sign-In, so that I can authenticate without entering credentials
5. As a user, I want to unlock the app with biometrics (Face ID/fingerprint), so that I don't have to re-enter my password
6. As a new user, I want a multi-step onboarding wizard that asks my level (A1-C2) and dialect preference, so that the app shows me relevant content
7. As a user, I want to reset my password via email, so that I can recover my account
8. As a user, I want to log out, so that my account is secure on shared devices
9. As a user, I want my session to persist across app restarts, so that I don't have to log in every time
10. As a user, I want my access token to refresh automatically when it expires, so that I don't get logged out mid-session

### Home Tab

11. As a learner, I want to see a "Continue learning" card on the home screen, so that I can resume my last lesson with one tap
12. As a learner, I want to see a "Due reviews" card showing how many vocabulary items are due, so that I know I need to review
13. As a learner, I want the continue card to show my current course and lesson name, so that I know where I left off
14. As a learner, I want tapping the continue card to take me directly into my active lesson, so that I can study immediately
15. As a learner, I want tapping the due reviews card to take me into a review session, so that I can review overdue vocabulary

### Courses Tab

16. As a learner, I want to browse all available courses, so that I can find content at my level
17. As a learner, I want to see course level (A1-C2), estimated hours, and thumbnail, so that I can choose the right course
18. As a learner, I want to tap a course to see its modules, so that I can understand the course structure
19. As a learner, I want to see module descriptions, topics, and estimated hours, so that I can pick a relevant module
20. As a learner, I want to tap a module to see its lessons, so that I can choose what to study
21. As a learner, I want to see lesson type icons, estimated duration, and my progress status, so that I know what each lesson contains
22. As a learner, I want to see which lessons I've completed, which are in progress, and which are not started, so that I can track my advancement

### Lesson Experience

23. As a learner, I want to start a lesson with a step-by-step wizard, so that I'm guided through the content
24. As a learner, I want to read Vietnamese text with phonetic transcription, so that I can learn pronunciation
25. As a learner, I want to listen to audio for vocabulary and dialogue content, so that I can hear correct pronunciation
26. As a learner, I want to adjust audio playback speed (0.5x-2.0x), so that I can slow down difficult passages
27. As a learner, I want to watch video content in lessons, so that I can see visual context
28. As a learner, I want to see vocabulary words with translation, phonetic, part of speech, and classifier, so that I understand each word
29. As a learner, I want to see dialect variants for vocabulary (Northern/Central/Southern), so that I learn the pronunciation relevant to me
30. As a learner, I want to see grammar rules with structure, explanation, and examples (Vietnamese + English), so that I understand sentence patterns
31. As a learner, I want to add a vocabulary word to my learning list, so that I can review it later
32. As a learner, I want to resume an in-progress lesson at the exercise section, so that I don't have to re-read content I've already seen
33. As a learner, I want to complete a lesson and see my score, so that I know how well I performed
34. As a learner, I want to see a progress bar during the lesson wizard, so that I know how far along I am

### Exercises

35. As a learner, I want to answer multiple choice exercises by tapping options, so that I can test my recognition
36. As a learner, I want to fill in blank exercises by typing answers, so that I can test my recall
37. As a learner, I want to match pairs in matching exercises, so that I can test my associations
38. As a learner, I want to reorder items in ordering exercises, so that I can test my understanding of sequence
39. As a learner, I want to type translations in translation exercises, so that I can test my production skills
40. As a learner, I want to transcribe audio in listening exercises, so that I can test my comprehension
41. As a learner, I want a countdown timer per exercise, so that I'm challenged to answer within the time limit
42. As a learner, I want to see whether my answer is correct or incorrect immediately, so that I get instant feedback
43. As a learner, I want to see the correct answer and explanation when I answer incorrectly, so that I learn from my mistakes
44. As a learner, I want to see my score after completing an exercise, so that I track my performance
45. As a learner, I want to see my overall exercise statistics, so that I understand my strengths and weaknesses

### Vocabulary Review

46. As a learner, I want to review vocabulary due for spaced repetition, so that I don't forget what I've learned
47. As a learner, I want to flip a flashcard to see the translation and example sentence, so that I can test my recall
48. As a learner, I want to rate my recall with 4 buttons (Again/Hard/Good/Easy), so that the FSRS algorithm schedules my next review accurately
49. As a learner, I want to see my mastery level per vocabulary word (learning/familiar/mastered), so that I know my progress
50. As a learner, I want to review vocabulary offline, so that I can study without internet (e.g. on a plane)
51. As a learner, I want offline reviews to sync automatically when I'm back online, so that the server's FSRS state stays up to date
52. As a learner, I want to browse all vocabulary words I've learned, so that I can review my word collection
53. As a learner, I want to search vocabulary, so that I can look up a specific word
54. As a learner, I want to see an offline indicator when I'm not connected, so that I know which features are limited
55. As a learner, I want due vocabulary reviews to be prefetched when connectivity drops, so that I can review even if I go offline shortly after

### Profile Tab

56. As a learner, I want to view and edit my profile (name, avatar, native language), so that my information is up to date
57. As a learner, I want to change my preferred dialect, so that vocabulary displays the correct regional variant
58. As a learner, I want to change my current level, so that I get course recommendations at the right difficulty
59. As a learner, I want to see basic stats (lessons completed, words learned, exercises done), so that I feel a sense of progress
60. As a learner, I want to see my exercise statistics (accuracy, time), so that I understand my performance trends

### Navigation & UX

61. As a learner, I want bottom navigation tabs (Home/Courses/Review/Profile), so that I can quickly switch between main sections
62. As a learner, I want deep links to open specific lessons or review sessions, so that notifications can take me to the right place
63. As a learner, I want Vietnamese text rendered in Be Vietnam Pro font, so that diacritical marks are clear and readable
64. As a learner, I want dark mode support, so that I can study at night without eye strain
65. As a learner, I want smooth infinite scroll for long lists, so that browsing is seamless
66. As a learner, I want images to load with caching and placeholders, so that the UI doesn't jump or show broken images
67. As a learner, I want error states with retry buttons on screens that fail to load, so that I can recover from network issues
68. As a learner, I want a snackbar notification for global errors (network lost, session expired), so that I'm aware of system issues

## Implementation Decisions

### Platform & Identity

- Target iOS 14+ and Android API 26+ (Android 8)
- Package name: `com.linvnix.app`, display name: "LinVNix"
- No web target; Flutter web is out of scope

### Architecture

- Feature-first directory structure with shared `core/` for cross-cutting infrastructure
- Each feature under `lib/features/<feature>/` contains `data/`, `domain/`, `presentation/`
- `lib/core/` contains: API client, auth infrastructure, storage, connectivity, theme, router, exceptions
- Repository pattern with Riverpod AsyncNotifier providers as the state layer
- UI watches providers via `ref.watch()` → `AsyncValue.when(loading, error, data)`

### State Management & Code Generation

- Riverpod 2.x with `@riverpod` codegen (riverpod_generator)
- Build runner must run for: freezed, json_serializable, drift, riverpod_generator
- All providers use `AsyncNotifier` pattern; auto-dispose by default

### HTTP & API Integration

- Dio HTTP client with custom interceptors:
  - **AuthInterceptor**: attaches `Authorization: Bearer <access_token>` to every request
  - **TokenRefreshInterceptor**: on 401, calls `POST /auth/refresh` with stored refresh token, rotates tokens, retries original request
  - **ResponseUnwrapInterceptor**: extracts `response.data['data']` from `{ data: T }` wrapper; skips unwrap for paginated responses (preserves `meta`)
- Base URL from `--dart-define` (compile-time) with `.env` file fallback via `flutter_dotenv`
- API prefix: `/api/v1`; all responses wrapped in `{ data: T }` by backend TransformInterceptor
- Backend `PaginatedResult<T>` shape: `{ data: [], meta: { total, page, limit, totalPages } }`
- Error mapping: DioException → domain exceptions (AuthException, NetworkException, ServerException, ValidationException)

### Authentication

- Email/password login via `POST /auth/login`
- Registration via `POST /auth/register` (email, password, fullName, nativeLanguage, currentLevel)
- Email verification via `POST /auth/verify-email`
- Password reset via `POST /auth/forgot-password` + `POST /auth/reset-password`
- Token refresh via `POST /auth/refresh` (token rotation — old refresh token revoked)
- Logout via `POST /auth/logout` (revokes refresh token)
- **Google Sign-In**: `google_sign_in` package obtains `idToken` → sent to **new backend endpoint** `POST /auth/google/token` → backend verifies with Google, finds/creates user, returns JWT tokens
- **Biometric unlock**: `local_auth` package. After successful login, email+password stored in `flutter_secure_storage` (encrypted via Keychain/Keystore). Biometric prompt → retrieve stored credentials → auto-login
- Access tokens: 15m expiry. Refresh tokens: 7d expiry
- Tokens stored in `flutter_secure_storage`

### Backend Modification Required

- Add `POST /auth/google/token` endpoint accepting `{ idToken: string }` in AuthController
- Validates `idToken` with Google OAuth2 client, extracts profile (email, name, googleId)
- Same user find/create logic as existing `GoogleStrategy.validate()`
- Returns same shape as `/auth/login`: `{ data: { user, access_token, refresh_token } }`

### Onboarding

- Multi-step wizard after registration:
  - Step 1: "What's your current level?" — select from A1-C2
  - Step 2: "Which dialect do you prefer?" — select Standard/Northern/Central/Southern
  - Step 3: "Set your daily goal" — optional review target
- Data sent via `UpdateUserDto` (`PATCH /users/me`)
- Steps are skippable; defaults applied from registration

### Navigation

- go_router with auth redirect guard: unauthenticated → `/login`, authenticated → `/home`
- Bottom navigation: Home (`/`), Courses (`/courses`), Review (`/review`), Profile (`/profile`)
- Nested routes: `/courses/:id` (course detail), `/modules/:id` (module detail), `/lessons/:id` (lesson wizard), `/review/session` (review session)
- Deep link support via go_router route definitions

### Lesson Wizard

- Step-by-step flow per lesson: Content steps → Vocabulary step → Grammar step → Exercise steps
- Each step is a widget managed by a `PageController` with progress indicator
- Content types (text, audio, image, video, dialogue) rendered by shared content widgets:
  - text: VietnameseText + translation + phonetic
  - audio: audio player bar + speed control chip
  - image: cached_network_image
  - video: chewie player
  - dialogue: Vietnamese dialogue + translation + audio playback
- **Smart resume**: when `UserProgress.status = IN_PROGRESS`, show "Continue from exercises?" dialog → skip content/vocab/grammar steps, jump to first exercise
- Lesson completion: `POST /progress/lesson/:id/start` → exercises → `POST /progress/lesson/:id/complete` with score

### Exercise System

- Strategy pattern: abstract `ExerciseRenderer` with 6 implementations
- Each renderer implements: `buildQuestion(options)`, `buildInput()`, `validateAnswer()`, `submitAnswer()`
- 6 exercise types and their UI:
  - **multiple_choice**: options as selectable chips, single selection
  - **fill_blank**: TextField(s) for each blank, supports accepted answers
  - **matching**: drag/tap to pair left items with right items
  - **ordering**: reorderable list via long-press + drag
  - **translation**: text input field, supports accepted translations
  - **listening**: audio player + text input for transcription
- Timer per exercise: `EXERCISE_TIME_LIMITS` constants (60s-180s by type)
- Shared widgets: QuestionHeader, TimerBar, SubmitButton, ExplanationPanel
- Answer submission: `POST /exercises/:id/submit` → returns `{ isCorrect, correctAnswer, explanation, score }`
- Exercise options/answer use freezed discriminated union matching backend's JSONB schema:

```
MultipleChoiceOptions: { choices: string[] }
FillBlankOptions: { blanks: { hint?, acceptedAnswers?[] }[] }
MatchingOptions: { pairs: { left, right }[] }
OrderingOptions: { items: string[] }
TranslationOptions: { acceptedTranslations?: string[] }
ListeningOptions: { audioUrl, mode: 'exact' | 'keywords' }

MultipleChoiceAnswer: { selectedChoice: string }
FillBlankAnswer: { answers: string[] }
MatchingAnswer: { matches: { left, right }[] }
OrderingAnswer: { orderedItems: string[] }
TranslationAnswer: { translation: string }
ListeningAnswer: { transcript: string }
```

### Vocabulary Review

- Anki-style flashcard review with 4 rating buttons: Again(1), Hard(2), Good(3), Easy(4)
- Front of card: Vietnamese word + phonetic + audio button
- Back of card: translation + example sentence + example translation + part of speech + classifier
- FSRS algorithm runs server-side; mobile sends rating, receives updated scheduling
- Mastery level displayed per word: learning (stability < 21), familiar (21-99), mastered (100+)
- Review endpoints:
  - `GET /vocabularies/due-review` — fetch due items
  - `POST /vocabularies/:id/review` — single review with `{ rating: 1-4 }`
  - `POST /vocabularies/review/batch` — batch review with `{ reviews: [{ vocabularyId, rating }] }`

### Offline Vocabulary Review

- Online-first architecture with selective offline for review only
- When connectivity drops (detected via `connectivity_plus` stream), prefetch due reviews into Drift SQLite
- Drift tables:
  - `vocabularies` — word, translation, phonetic, partOfSpeech, exampleSentence, exampleTranslation, audioUrl, classifier, difficultyLevel
  - `user_vocabularies` — vocabularyId, masteryLevel, reviewCount, correctCount, nextReviewAt, stability, difficulty, state, reps, lapses
  - `review_queue` — pending offline reviews (vocabularyId, rating, reviewedAt)
- During offline: review from local cache, enqueue results in `review_queue`
- When connectivity restored: flush queue via `POST /vocabularies/review/batch`
- Connectivity state exposed via Riverpod `ConnectivityProvider`

### Local Notifications

- `flutter_local_notifications` for review reminders
- After each review session, schedule next reminder based on earliest `nextReviewAt`
- `NotificationService` interface for future FCM swap

### Typography & Theme

- Material 3 with `ColorScheme.fromSeed()` using brand seed color
- Custom `ThemeExtension` for brand-specific tokens (Vietnamese cultural accent colors, gradient definitions)
- Dark mode supported automatically via Material 3
- Vietnamese content text uses **Be Vietnam Pro** font (bundled)
- UI text uses system font (Roboto/SF Pro)

### Data Layer

- Repository pattern: abstract `Repository` + `RepositoryImpl` per feature
- Riverpod `AsyncNotifier` providers call repositories, expose `AsyncValue<Model>`
- `flutter_secure_storage` for: JWT tokens, email+password (biometric)
- `shared_preferences` for: user preferences (onboarding completed, notification settings)
- Drift for: offline vocabulary cache + review queue

### Pagination

- Courses (6 items): load all at once
- Vocabularies, exercises, search results: infinite scroll via `ScrollController` + Riverpod `keepPreviousData`
- Backend `PaginatedResult<T>` parsed with `data` + `meta` intact (skip response unwrap interceptor)

### Image Handling

- `cached_network_image` for course thumbnails, vocabulary images, lesson content images
- Shimmer placeholder during loading, fallback icon on error

### Audio/Video

- `just_audio` for vocabulary pronunciation, dialogue audio, listening exercises
- `chewie` (wrapping `video_player`) for video lesson content
- Speed control: cycle chip button with presets [0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x]

### Environment & Config

- Compile-time via `--dart-define=API_URL=...`
- Local dev fallback via `.env` file (gitignored) loaded by `flutter_dotenv`
- Key config values: API_URL, GOOGLE_CLIENT_ID (for google_sign_in)

### UI Language

- English UI only for MVP
- Vietnamese content displayed with proper diacritical rendering via Be Vietnam Pro

## Testing Decisions

### What makes a good test

- Test external behavior (inputs → outputs), not implementation details
- Mock at repository boundaries — repositories are the seam between data layer and domain
- Use Riverpod's `ProviderContainer` overrides for provider tests
- For Drift: use in-memory database for test isolation
- No need to test framework code (Dio, just_audio, etc.) — test our integration with them

### Modules to be tested (deep modules 1-5)

1. **AuthInfrastructure** — token storage/retrieval, refresh rotation flow, biometric credential storage, auto-logout on refresh failure
2. **ReviewEngine** — prefetch logic, offline queue management, FSRS rating→mastery mapping, batch sync ordering, conflict handling when sync fails
3. **ExerciseRenderer** — each of 6 renderers: correct answer validation, incorrect answer detection, options parsing, answer construction per type
4. **ApiClient** — response unwrapping, pagination parsing, error→domain exception mapping, 401→refresh→retry flow
5. **LocalCache** — Drift CRUD, due review queries, queue enqueue/dequeue, connectivity-aware read routing

### Prior art

- Backend unit tests use jest with mock repositories — same pattern applied to Flutter repositories with mock Dio
- Backend integration tests use real DB — equivalent to Drift in-memory DB tests

## Out of Scope

- Web platform (Flutter web)
- Apple Sign-In (add when submitting to App Store)
- Analytics/crash reporting (Firebase or otherwise)
- Streak/gamification system
- Achievement/badge system
- Push notifications from server (FCM)
- Full offline-first support (only vocabulary review is offline)
- Internationalization of UI (l10n)
- Admin features (handled by Electron admin app)
- WebSocket/real-time features (backend is REST-only)
- Social features (leaderboards, friends)
- In-app purchases / monetization
- Course/lesson/vocabulary/grammar/exercise CRUD (admin-only, handled by admin app)
- Content creation or editing

## Further Notes

### Backend dependency

The mobile app requires one backend addition: `POST /auth/google/token` endpoint. This endpoint accepts a Google `idToken` obtained client-side via `google_sign_in`, validates it server-side with Google, and returns the same JWT token pair as the existing login flow. The user find/create logic reuses the existing `GoogleStrategy.validate()` pattern.

### Build runner dependency

Four code generators must run together: `freezed`, `json_serializable`, `drift`, `riverpod_generator`. All use `build_runner`. A single `build_runner watch` session handles all generation.

### Dialect-aware vocabulary

The backend's `/vocabularies/lesson/:lessonId` endpoint already applies dialect preference when the user is authenticated (via `OptionalJwtAuthGuard`). The mobile app must send the JWT token on vocabulary requests to get dialect-appropriate variants. The `preferredDialect` is stored on the User entity and applied server-side.

### FSRS is server-authoritative

The FSRS algorithm (scheduling, stability, difficulty) runs on the backend. The mobile app only sends ratings and receives scheduling results. The local Drift cache is a read copy for offline use; it must sync with server state when online. Conflicts are resolved by accepting server state as authoritative.

### Package summary

| Purpose | Package |
|---------|---------|
| State management | riverpod, riverpod_annotation, riverpod_generator |
| Routing | go_router |
| HTTP | dio |
| JSON models | freezed, freezed_annotation, json_serializable, json_annotation |
| Local DB | drift, drift_flutter |
| Secure storage | flutter_secure_storage |
| Preferences | shared_preferences |
| Connectivity | connectivity_plus |
| Notifications | flutter_local_notifications |
| Google Sign-In | google_sign_in |
| Biometric | local_auth |
| Audio | just_audio |
| Video | chewie, video_player |
| Images | cached_network_image |
| Font | Be Vietnam Pro (bundled asset) |
| Env | flutter_dotenv |
| Code gen | build_runner, freezed, json_serializable, drift, riverpod_generator |
