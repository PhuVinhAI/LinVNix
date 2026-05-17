import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/app_router.dart';
import '../data/route_match.dart' as assistant;
import '../data/screen_context_provider.dart';
import '../application/assistant_bar_visible_provider.dart';
import 'assistant_visibility.dart';
import 'widgets/assistant_bar.dart';

/// Wraps the entire router output and renders the persistent assistant
/// surface (`AssistantBar` + sheet) below the route content.
///
/// V2: The bar is also suppressed when the learner has opted out via the
/// profile toggle (`assistantBarVisibleProvider == false`). When hidden,
/// the bar leaves no visual trace and there is no alternative entry point.
///
/// Stream-safe: toggling the preference off while a Full screen is open
/// does NOT force-close it — the bar simply won't reappear once the
/// learner returns to collapsed state.
class GlobalAssistantShell extends ConsumerStatefulWidget {
  const GlobalAssistantShell({super.key, required this.child});

  final Widget child;

  @override
  ConsumerState<GlobalAssistantShell> createState() =>
      _GlobalAssistantShellState();
}

class _GlobalAssistantShellState extends ConsumerState<GlobalAssistantShell> {
  late final GoRouter _router;

  bool _listening = false;

  @override
  void initState() {
    super.initState();
    _router = ref.read(routerProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _router.routeInformationProvider.addListener(_scheduleRouteSync);
      _listening = true;
      _handleRouteChange();
    });
  }

  @override
  void dispose() {
    if (_listening) {
      _router.routeInformationProvider.removeListener(_scheduleRouteSync);
    }
    super.dispose();
  }

  void _scheduleRouteSync() {
    Future.microtask(_handleRouteChange);
  }

  void _handleRouteChange() {
    if (!mounted) return;
    final RouteMatchList config;
    try {
      config = _router.routerDelegate.currentConfiguration;
    } catch (_) {
      return;
    }
    final fullPath = config.fullPath;
    final location = config.uri.toString();
    if (location.isEmpty) return;
    final pathParameters = config.pathParameters;
    final queryParameters = config.uri.queryParameters;

    final next = assistant.RouteMatch(
      routePattern: fullPath.isEmpty ? location : fullPath,
      location: location,
      pathParameters: Map<String, String>.from(pathParameters),
      queryParameters: Map<String, String>.from(queryParameters),
    );

    final current = ref.read(currentRouteMatchProvider);
    if (current != next) {
      ref.read(currentRouteMatchProvider.notifier).update(next);
    }
  }

  @override
  Widget build(BuildContext context) {
    final match = ref.watch(currentRouteMatchProvider);

    // Gate 1: route-based visibility (auth / onboarding screens hide the bar)
    final routeVisible = isAssistantBarVisible(match?.location);

    // Gate 2: learner preference (opt-out toggle in profile settings)
    final preferenceVisible = ref.watch(assistantBarVisibleProvider);

    // Both gates must be true for the bar to render.
    final showBar = routeVisible && preferenceVisible;

    if (!showBar) {
      return widget.child;
    }

    final mq = MediaQuery.of(context);
    return Column(
      mainAxisSize: MainAxisSize.max,
      children: [
        Expanded(
          child: MediaQuery(
            data: mq.copyWith(
              padding: mq.padding.copyWith(bottom: 0),
              viewPadding: mq.viewPadding.copyWith(bottom: 0),
            ),
            child: widget.child,
          ),
        ),
        const AssistantBar(),
      ],
    );
  }
}
