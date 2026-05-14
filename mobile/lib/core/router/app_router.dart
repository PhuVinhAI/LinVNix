import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_state_provider.dart';
import '../presentation/splash_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/email_verification_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/reset_password_otp_screen.dart';
import '../../features/auth/presentation/screens/reset_password_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/courses/presentation/screens/courses_screen.dart';
import '../../features/courses/presentation/screens/course_detail_screen.dart';
import '../../features/courses/presentation/screens/module_detail_screen.dart';
import '../../features/bookmarks/presentation/screens/bookmarks_screen.dart';
import '../../features/bookmarks/presentation/screens/flashcard_screen.dart';
import '../../features/lessons/presentation/screens/lesson_wizard_screen.dart';
import '../../features/lessons/presentation/screens/exercise_hub_screen.dart';
import '../../features/lessons/presentation/screens/exercise_play_screen.dart';
import '../presentation/shell_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

class _RouterListenable extends ChangeNotifier {
  _RouterListenable(Ref ref) {
    ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
}

final _routerListenableProvider = Provider<_RouterListenable>((ref) {
  return _RouterListenable(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = ref.watch(_routerListenableProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: listenable,
    redirect: (context, state) {
      final authState = ref.read(authStateProvider);
      final location = state.matchedLocation;

      if (location == '/splash') {
        if (!authState.isInitialized) return null;
        if (!authState.isAuthenticated) return '/login';
        return '/';
      }

      if (!authState.isInitialized) return '/splash';

      final isAuthRoute = location == '/login' ||
          location == '/register' ||
          location == '/forgot-password' ||
          location == '/reset-password' ||
          location == '/reset-password-otp';

      final isPublicRoute = location == '/verify-email' ||
          location.startsWith('/courses') ||
          location.startsWith('/modules');

      if (isPublicRoute) return null;

      if (!authState.isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      if (authState.isAuthenticated && isAuthRoute) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'];
          return EmailVerificationScreen(email: email);
        },
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password-otp',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return ResetPasswordOtpScreen(email: email);
        },
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final token = state.uri.queryParameters['token'];
          return ResetPasswordScreen(token: token);
        },
      ),
      GoRoute(
        path: '/courses/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CourseDetailScreen(courseId: id);
        },
      ),
      GoRoute(
        path: '/modules/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ModuleDetailScreen(moduleId: id);
        },
      ),
      GoRoute(
        path: '/bookmarks',
        builder: (context, state) => const BookmarksScreen(),
      ),
      GoRoute(
        path: '/bookmarks/flashcard',
        builder: (context, state) => const FlashcardScreen(),
      ),
      GoRoute(
        path: '/lessons/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return LessonWizardScreen(lessonId: id);
        },
      ),
      GoRoute(
        path: '/lessons/:id/exercises',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ExerciseHubScreen(lessonId: id);
        },
      ),
      GoRoute(
        path: '/lessons/:id/exercises/play/:setId',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final setId = state.pathParameters['setId']!;
          return ExercisePlayScreen(lessonId: id, setId: setId);
        },
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/courses',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: CoursesScreen(),
            ),
          ),
        ],
      ),
    ],
  );
});