import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/providers.dart';
import '../data/vocabulary_repository.dart';
import '../data/review_repository.dart';
import '../domain/review_models.dart';

final vocabularyRepositoryProvider = Provider<VocabularyRepository>((ref) {
  return VocabularyRepository(ref.watch(dioProvider));
});

final reviewRepositoryProvider = Provider<ReviewRepository>((ref) {
  return ReviewRepository(ref.watch(dioProvider));
});

final dueReviewCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.watch(vocabularyRepositoryProvider);
  final items = await repo.getDueForReview();
  return items.length;
});

final dueReviewItemsProvider = FutureProvider<List<DueReviewItem>>((ref) async {
  final repo = ref.watch(vocabularyRepositoryProvider);
  return repo.getDueForReview();
});

final myVocabulariesProvider = FutureProvider<List<UserVocabulary>>((ref) async {
  final repo = ref.watch(vocabularyRepositoryProvider);
  return repo.getMyVocabularies();
});
