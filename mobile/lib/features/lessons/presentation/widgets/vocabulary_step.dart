import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/lesson_models.dart';
import '../../data/lesson_providers.dart';

class VocabularyStepWidget extends ConsumerStatefulWidget {
  const VocabularyStepWidget({
    super.key,
    required this.vocabularies,
    required this.lessonId,
    required this.learnedVocabIds,
    required this.onVocabLearned,
  });
  final List<LessonVocabulary> vocabularies;
  final String lessonId;
  final Set<String> learnedVocabIds;
  final ValueChanged<String> onVocabLearned;

  @override
  ConsumerState<VocabularyStepWidget> createState() =>
      _VocabularyStepWidgetState();
}

class _VocabularyStepWidgetState extends ConsumerState<VocabularyStepWidget> {
  final Set<String> _pendingVocabIds = {};

  Future<void> _learnWord(String vocabularyId) async {
    if (widget.learnedVocabIds.contains(vocabularyId) ||
        _pendingVocabIds.contains(vocabularyId)) return;

    setState(() => _pendingVocabIds.add(vocabularyId));

    try {
      final repo = ref.read(lessonRepositoryProvider);
      await repo.learnVocabulary(vocabularyId);
      widget.onVocabLearned(vocabularyId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _pendingVocabIds.remove(vocabularyId));
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
          learned: widget.learnedVocabIds.contains(vocab.id),
          onLearn: () => _learnWord(vocab.id),
        );
      },
    );
  }
}

class _VocabularyCard extends StatelessWidget {
  const _VocabularyCard({
    required this.vocabulary,
    required this.learned,
    required this.onLearn,
  });
  final LessonVocabulary vocabulary;
  final bool learned;
  final VoidCallback onLearn;

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
                FilledButton.tonal(
                  onPressed: learned ? null : onLearn,
                  child: Text(learned ? 'Learned' : 'Learn'),
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
