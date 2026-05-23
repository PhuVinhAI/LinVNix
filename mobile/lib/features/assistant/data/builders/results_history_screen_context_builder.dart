import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../simulation/data/simulation_providers.dart';
import '../../domain/screen_context.dart';
import '../route_match.dart';
import 'course_context_summaries.dart';
import 'simulation_context_summaries.dart';

/// `ScreenContext` builder for `/practice/history`. Pulls the learner's
/// conversation history (optionally filtered by scenario via query param)
/// so the assistant can answer "Which scenario did I do worst on?" without
/// an extra tool call.
ScreenContext resultsHistoryScreenContextBuilder(Ref ref, RouteMatch match) {
  final scenarioId = match.queryParameters['scenarioId'];
  final hasFilter = scenarioId != null && scenarioId.isNotEmpty;
  final resultsAsync = ref.watch(simulationResultsProvider(scenarioId));
  final status = asyncLoadStatus(resultsAsync);

  final data = <String, dynamic>{
    'screenType': 'resultsHistory',
    'status': status,
    'filteredByScenario': hasFilter,
    if (hasFilter) 'scenarioId': scenarioId,
  };

  if (status == 'error') {
    data['error'] = shortAsyncError(resultsAsync.error);
    data['resultCount'] = 0;
    data['results'] = const <Map<String, dynamic>>[];
  } else if (status == 'loading') {
    data['resultCount'] = 0;
    data['results'] = const <Map<String, dynamic>>[];
  } else {
    final results = resultsAsync.requireValue;
    data['resultCount'] = results.length;
    data['results'] = results
        .take(20)
        .map(simulationResultSummaryContextSummary)
        .toList(growable: false);
    if (results.isNotEmpty) {
      final totals = results.map((r) => r.totalScore).toList();
      final avg =
          totals.fold<double>(0, (a, b) => a + b) / totals.length;
      data['averageScore'] = double.parse(avg.toStringAsFixed(1));
      data['bestScore'] = totals.reduce((a, b) => a > b ? a : b);
      data['worstScore'] = totals.reduce((a, b) => a < b ? a : b);
    }
  }

  return ScreenContext(
    route: match.location,
    displayName: hasFilter ? 'History · scenario' : 'Conversation history',
    barPlaceholder: 'Ask about your history?',
    data: data,
  );
}
