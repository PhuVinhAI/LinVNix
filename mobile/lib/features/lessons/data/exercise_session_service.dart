import 'package:hive/hive.dart';
import '../domain/exercise_session.dart';

class ExerciseSessionService {
  ExerciseSessionService(this._box);

  final Box<Map<dynamic, dynamic>> _box;

  Future<void> save(ExerciseSession session) async {
    final map = session.toMap();
    await _box.put(session.setId, map);
  }

  Future<ExerciseSession?> load(String setId) async {
    final raw = _box.get(setId);
    if (raw == null) return null;
    return ExerciseSession.fromMap(raw);
  }

  Future<void> delete(String setId) async {
    await _box.delete(setId);
  }
}
