import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/sync/sync.dart';
import '../../../core/providers/providers.dart';
import '../data/simulation_repository.dart';
import '../domain/scenario_category.dart';

final simulationRepositoryProvider = Provider<SimulationRepository>((ref) {
  return SimulationRepository(ref.watch(dioProvider));
});

class SimulationCategoriesNotifier
    extends CachedRepository<List<ScenarioCategory>> {
  @override
  Duration get ttl => const Duration(minutes: 30);

  @override
  Future<List<ScenarioCategory>> fetchFromApi() async {
    final repo = ref.read(simulationRepositoryProvider);
    return repo.listCategories();
  }
}

final simulationCategoriesProvider =
    AsyncNotifierProvider<SimulationCategoriesNotifier, List<ScenarioCategory>>(
  SimulationCategoriesNotifier.new,
);
