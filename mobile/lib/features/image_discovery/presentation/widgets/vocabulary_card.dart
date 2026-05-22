import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/widgets/widgets.dart';
import '../../domain/image_analysis_models.dart';

class VocabularyCard extends StatefulWidget {
  const VocabularyCard({
    super.key,
    required this.vocabulary,
    required this.onAdd,
  });

  final ImageAnalysisVocabulary vocabulary;
  final Future<void> Function(ImageAnalysisVocabulary vocabulary) onAdd;

  @override
  State<VocabularyCard> createState() => _VocabularyCardState();
}

class _VocabularyCardState extends State<VocabularyCard> {
  bool _isAdding = false;
  bool _isAdded = false;

  Future<void> _handleAdd() async {
    if (_isAdding || _isAdded) return;

    setState(() => _isAdding = true);
    try {
      await widget.onAdd(widget.vocabulary);
      if (!mounted) return;
      setState(() => _isAdded = true);
    } catch (_) {
      // The caller owns user-facing error state; keep the card retryable.
    } finally {
      if (mounted) {
        setState(() => _isAdding = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final theme = Theme.of(context);
    final vocabulary = widget.vocabulary;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: c.border),
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.auto_awesome, size: 18, color: c.primary),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vocabulary.word,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      vocabulary.translation,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: c.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (vocabulary.phonetic != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(
              '/${vocabulary.phonetic}/',
              style: theme.textTheme.bodySmall?.copyWith(
                color: c.mutedForeground,
              ),
            ),
          ],
          if (vocabulary.partOfSpeech != null ||
              vocabulary.classifier != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.xs,
              children: [
                if (vocabulary.partOfSpeech != null)
                  AppChip(
                    label: vocabulary.partOfSpeech!,
                    fontSize: AppTypography.caption,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 4,
                    ),
                  ),
                if (vocabulary.classifier != null)
                  AppChip(
                    label: 'CL: ${vocabulary.classifier}',
                    fontSize: AppTypography.caption,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 4,
                    ),
                  ),
              ],
            ),
          ],
          if (vocabulary.exampleSentence != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              vocabulary.exampleSentence!,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontStyle: FontStyle.italic,
              ),
            ),
            if (vocabulary.exampleTranslation != null)
              Text(
                vocabulary.exampleTranslation!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: c.mutedForeground,
                ),
              ),
          ],
          const SizedBox(height: AppSpacing.md),
          Align(
            alignment: Alignment.centerRight,
            child: AppButton(
              label: _isAdded ? 'Đã thêm' : '＋ Thêm',
              icon: Icon(_isAdded ? Icons.check : Icons.add),
              variant: _isAdded
                  ? AppButtonVariant.secondary
                  : AppButtonVariant.primary,
              isLoading: _isAdding,
              onPressed: _isAdded || _isAdding
                  ? null
                  : () => unawaited(_handleAdd()),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: 8,
              ),
              fontSize: AppTypography.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
