import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/lesson_models.dart';
import '../../../bookmarks/data/bookmark_providers.dart';
import '../../../bookmarks/presentation/widgets/bookmark_icon_button.dart';

class VocabularyStepWidget extends ConsumerStatefulWidget {
  const VocabularyStepWidget({
    super.key,
    required this.vocabularies,
    required this.lessonId,
  });
  final List<LessonVocabulary> vocabularies;
  final String lessonId;

  @override
  ConsumerState<VocabularyStepWidget> createState() =>
      _VocabularyStepWidgetState();
}

class _VocabularyStepWidgetState extends ConsumerState<VocabularyStepWidget> {
  final Set<String> _pendingToggleIds = {};
  late final Set<String> _bookmarkedIds;

  @override
  void initState() {
    super.initState();
    _bookmarkedIds = widget.vocabularies
        .where((v) => v.isBookmarked)
        .map((v) => v.id)
        .toSet();
  }

  Future<void> _toggleBookmark(String vocabularyId) async {
    if (_pendingToggleIds.contains(vocabularyId)) return;

    final wasBookmarked = _bookmarkedIds.contains(vocabularyId);
    setState(() {
      _pendingToggleIds.add(vocabularyId);
      if (wasBookmarked) {
        _bookmarkedIds.remove(vocabularyId);
      } else {
        _bookmarkedIds.add(vocabularyId);
      }
    });

    try {
      final repo = ref.read(bookmarkRepositoryProvider);
      final isNowBookmarked = await repo.toggleBookmark(vocabularyId);
      if (mounted) {
        setState(() {
          if (isNowBookmarked) {
            _bookmarkedIds.add(vocabularyId);
          } else {
            _bookmarkedIds.remove(vocabularyId);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          if (wasBookmarked) {
            _bookmarkedIds.add(vocabularyId);
          } else {
            _bookmarkedIds.remove(vocabularyId);
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _pendingToggleIds.remove(vocabularyId));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.vocabularies.isEmpty) {
      return const Center(child: Text('No vocabulary for this lesson'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: widget.vocabularies.length,
      itemBuilder: (context, index) {
        final vocab = widget.vocabularies[index];
        return _VocabularyCard(
          vocabulary: vocab,
          isBookmarked: _bookmarkedIds.contains(vocab.id),
          isPending: _pendingToggleIds.contains(vocab.id),
          onToggle: _toggleBookmark,
        );
      },
    );
  }
}

class _VocabularyCard extends StatelessWidget {
  const _VocabularyCard({
    required this.vocabulary,
    required this.isBookmarked,
    required this.isPending,
    required this.onToggle,
  });
  final LessonVocabulary vocabulary;
  final bool isBookmarked;
  final bool isPending;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final vocab = vocabulary;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        vocab.word,
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (vocab.phonetic != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          vocab.phonetic!,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                isPending
                    ? const SizedBox(
                        width: 48,
                        height: 48,
                        child: Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                      )
                    : BookmarkIconButton(
                        vocabularyId: vocab.id,
                        isBookmarked: isBookmarked,
                        onToggle: onToggle,
                      ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              vocab.translation,
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                if (vocab.partOfSpeech != null)
                  Chip(
                    label: Text(vocab.partOfSpeech!),
                    visualDensity: VisualDensity.compact,
                    labelStyle: theme.textTheme.labelSmall,
                  ),
                if (vocab.classifier != null)
                  Chip(
                    label: Text('CL: ${vocab.classifier}'),
                    visualDensity: VisualDensity.compact,
                    labelStyle: theme.textTheme.labelSmall,
                  ),
              ],
            ),
            if (vocab.dialectVariants != null &&
                vocab.dialectVariants!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Dialect variants:',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                children: vocab.dialectVariants!.entries.map((e) {
                  return Chip(
                    label: Text('${e.key}: ${e.value}'),
                    visualDensity: VisualDensity.compact,
                    labelStyle: theme.textTheme.labelSmall,
                  );
                }).toList(),
              ),
            ],
            if (vocab.exampleSentence != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vocab.exampleSentence!,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (vocab.exampleTranslation != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        vocab.exampleTranslation!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
