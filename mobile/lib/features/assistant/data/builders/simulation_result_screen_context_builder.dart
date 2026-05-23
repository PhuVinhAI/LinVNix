import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../simulation/data/simulation_providers.dart';
import '../../../simulation/domain/simulation_result_detail.dart';
import '../../domain/screen_context.dart';
import '../route_match.dart';
import 'course_context_summaries.dart';
import 'simulation_context_summaries.dart';

/// `ScreenContext` builder for `/practice/results/:id`. Pulls the full result
/// (total score, per-criterion breakdown, AI summary, end reason) so the
/// assistant can answer "Why did I lose points on grammar?" without an
/// extra `get_simulation_result` tool call.
ScreenContext simulationResultScreenContextBuilder(
  Ref ref,
  RouteMatch match,
) {
  final resultId = match.pathParameters['id'] ?? '';
  final resultAsync = resultId.isEmpty
      ? const AsyncValue<SimulationResultDetail>.loading()
      : ref.watch(simulationResultDetailProvider(resultId));
  final status = asyncLoadStatus(resultAsync);

  final data = <String, dynamic>{
    'screenType': 'simulationResult',
    'resultId': resultId,
    'status': status,
  };

  if (status == 'error') {
    data['error'] = shortAsyncError(resultAsync.error);
  } else if (status == 'data') {
    final result = resultAsync.requireValue;
    data['sessionId'] = result.sessionId;
    data['scenarioId'] = result.scenarioId;
    data['chosenCharacterId'] = result.chosenCharacterId;
    data['totalScore'] = result.totalScore;
    data['endReason'] = result.endReason;
    data['isCompleted'] = result.isCompleted;
    data['isTooManyErrors'] = result.isTooManyErrors;
    data['isInappropriate'] = result.isInappropriate;
    data['canReplay'] = result.canReplay;
    data['totalMessages'] = result.totalMessages;
    if (result.scenarioTitle != null) {
      data['scenarioTitle'] = result.scenarioTitle;
    }
    if (result.characterName != null) {
      data['characterName'] = result.characterName;
    }
    if (result.aiSummary != null && result.aiSummary!.isNotEmpty) {
      data['aiSummary'] = result.aiSummary;
    }
    if (result.createdAt != null) {
      data['createdAt'] = result.createdAt;
    }
    data['criteriaScores'] = result.criteriaScores
        .map(criteriaScoreContextSummary)
        .toList(growable: false);
  }

  final scenarioTitle =
      resultAsync.whenOrNull(data: (r) => r.scenarioTitle);

  return ScreenContext(
    route: match.location,
    displayName:
        scenarioTitle != null ? 'Result · $scenarioTitle' : 'Simulation result',
    barPlaceholder: 'Ask about this result?',
    data: data,
  );
}
