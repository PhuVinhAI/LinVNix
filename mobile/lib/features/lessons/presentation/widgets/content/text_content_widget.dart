import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../domain/lesson_models.dart';
import 'content_shared.dart';

/// Văn bản — render kiểu trang đọc: bản dịch ở trên dạng eyebrow,
/// đoạn văn tiếng Việt là body chính, các đoạn paragraph cách đều,
/// các từ chìa khoá hiện thành chip ở dưới cùng.
class TextContentWidget extends StatelessWidget {
  const TextContentWidget({super.key, required this.content});

  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final payload = content.textPayload;

    // Fallback khi không có payload (legacy data) — dùng vietnameseText/translation.
    final paragraphs = payload?.paragraphs ?? const <TextParagraph>[];
    final body = payload?.body ?? content.vietnameseText;
    final translation = payload?.translation ?? content.translation;
    final keyTerms = payload?.keyTerms ?? const <TextKeyTerm>[];

    final autoParagraphs = paragraphs.isEmpty
        ? body
            .split(RegExp(r'\n\s*\n'))
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .map((s) => TextParagraph(vi: s))
            .toList(growable: false)
        : paragraphs;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.xl,
        AppSpacing.xxxl,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ContentTypeBadge(
            label: 'Văn bản',
            icon: Icons.article_outlined,
            color: c.foreground,
          ),
          const SizedBox(height: AppSpacing.lg),
          if (translation != null && translation.trim().isNotEmpty) ...[
            TranslationEyebrow(text: translation),
            const SizedBox(height: AppSpacing.md),
          ],
          if (autoParagraphs.isEmpty)
            Text(
              body,
              style: GoogleFonts.inter(
                fontSize: AppTypography.titleSmall,
                color: c.foreground,
                fontWeight: FontWeight.w500,
                height: 1.6,
              ),
            )
          else
            for (var i = 0; i < autoParagraphs.length; i++) ...[
              _ParagraphBlock(paragraph: autoParagraphs[i]),
              if (i < autoParagraphs.length - 1)
                const SizedBox(height: AppSpacing.lg),
            ],
          if (keyTerms.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xl),
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: c.muted,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: c.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome_outlined,
                          size: 16, color: c.primary),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Từ chìa khoá',
                        style: GoogleFonts.inter(
                          fontSize: AppTypography.caption,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                          color: c.mutedForeground,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: [
                      for (final t in keyTerms)
                        _KeyTermChip(term: t),
                    ],
                  ),
                ],
              ),
            ),
          ],
          if (content.notes != null && content.notes!.trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xl),
            Text(
              content.notes!,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodySmall,
                color: c.mutedForeground,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ParagraphBlock extends StatelessWidget {
  const _ParagraphBlock({required this.paragraph});
  final TextParagraph paragraph;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          paragraph.vi,
          style: GoogleFonts.inter(
            fontSize: AppTypography.titleSmall,
            color: c.foreground,
            fontWeight: FontWeight.w500,
            height: 1.6,
          ),
        ),
        if (paragraph.en != null && paragraph.en!.trim().isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xs),
          Text(
            paragraph.en!,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodySmall,
              color: c.mutedForeground,
              height: 1.5,
            ),
          ),
        ],
      ],
    );
  }
}

class _KeyTermChip extends StatelessWidget {
  const _KeyTermChip({required this.term});
  final TextKeyTerm term;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: c.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            term.term,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodyMedium,
              fontWeight: FontWeight.w700,
              color: c.foreground,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Container(
            width: 1,
            height: 16,
            color: c.border,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            term.meaning,
            style: GoogleFonts.inter(
              fontSize: AppTypography.bodySmall,
              color: c.mutedForeground,
            ),
          ),
        ],
      ),
    );
  }
}
