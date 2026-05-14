import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data_change_bus.dart';

abstract class CachedRepository<T> extends AsyncNotifier<T> {
  T? _cachedData;
  DateTime? _lastFetchedAt;

  Duration get ttl;

  Future<T> fetchFromApi();

  @override
  Future<T> build() async {
    final now = DateTime.now();
    if (_cachedData != null &&
        _lastFetchedAt != null &&
        now.difference(_lastFetchedAt!) < ttl) {
      return _cachedData!;
    }
    final data = await fetchFromApi();
    _cachedData = data;
    _lastFetchedAt = now;
    return data;
  }

  Future<void> mutate({
    required T optimisticData,
    required Future<T> Function() apiCall,
    required Set<String> emitTags,
  }) async {
    final snapshot = _cachedData;

    _cachedData = optimisticData;
    _lastFetchedAt = DateTime.now();
    state = AsyncData(optimisticData);

    try {
      final result = await apiCall();
      _cachedData = result;
      _lastFetchedAt = DateTime.now();
      state = AsyncData(result);
      ref.read(dataChangeBusProvider.notifier).emit(emitTags);
    } catch (e) {
      if (snapshot != null) {
        _cachedData = snapshot;
        _lastFetchedAt = DateTime.now();
        state = AsyncData(snapshot);
      }
      rethrow;
    }
  }

  void forceExpire() {
    _lastFetchedAt = null;
  }

  void refresh() {
    ref.invalidateSelf();
  }
}

mixin CachedNotifierMixin<T> on AsyncNotifier<T> {
  T? _cachedData;
  DateTime? _lastFetchedAt;

  Future<T> fetchCached(Future<T> Function() fetcher, Duration ttl) async {
    final now = DateTime.now();
    if (_cachedData != null &&
        _lastFetchedAt != null &&
        now.difference(_lastFetchedAt!) < ttl) {
      return _cachedData!;
    }
    final data = await fetcher();
    _cachedData = data;
    _lastFetchedAt = now;
    return data;
  }

  Future<void> mutateCached({
    required T optimisticData,
    required Future<T> Function() apiCall,
    required Set<String> emitTags,
  }) async {
    final snapshot = _cachedData;

    _cachedData = optimisticData;
    _lastFetchedAt = DateTime.now();
    state = AsyncData(optimisticData);

    try {
      final result = await apiCall();
      _cachedData = result;
      _lastFetchedAt = DateTime.now();
      state = AsyncData(result);
      ref.read(dataChangeBusProvider.notifier).emit(emitTags);
    } catch (e) {
      if (snapshot != null) {
        _cachedData = snapshot;
        _lastFetchedAt = DateTime.now();
        state = AsyncData(snapshot);
      }
      rethrow;
    }
  }

  void forceExpire() {
    _lastFetchedAt = null;
  }

  void refresh() {
    ref.invalidateSelf();
  }
}
