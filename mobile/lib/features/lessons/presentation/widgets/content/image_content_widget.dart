import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../../core/network/media_url.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../domain/lesson_models.dart';
import 'content_shared.dart';

/// Hình ảnh — ảnh được dành cho không gian to nhất, caption hiện ngay dưới,
/// bản dịch là dòng phụ, nguồn (nếu có) là dòng cuối nhỏ italic.
class ImageContentWidget extends StatelessWidget {
  const ImageContentWidget({super.key, required this.content});

  final LessonContent content;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final payload = content.imagePayload;

    // Fallback cho legacy data — không nên xảy ra sau migration.
    final url = payload?.url ?? '';
    final caption = payload?.caption ?? content.vietnameseText;
    final captionEn = payload?.captionEn ?? content.translation;
    final source = payload?.source;
    final altText = payload?.altText ?? caption;
    final ratio = payload?.ratio;

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
            label: 'Hình ảnh',
            icon: Icons.image_outlined,
            color: c.foreground,
          ),
          const SizedBox(height: AppSpacing.lg),
          if (url.isNotEmpty)
            _ImageFrame(url: url, ratio: ratio, altText: altText)
          else
            _MissingImage(),
          const SizedBox(height: AppSpacing.lg),
          if (caption.trim().isNotEmpty)
            Text(
              caption,
              style: GoogleFonts.inter(
                fontSize: AppTypography.titleSmall,
                fontWeight: FontWeight.w600,
                color: c.foreground,
                height: 1.45,
              ),
            ),
          if (captionEn != null && captionEn.trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              captionEn,
              style: GoogleFonts.inter(
                fontSize: AppTypography.bodyMedium,
                color: c.mutedForeground,
                fontStyle: FontStyle.italic,
                height: 1.5,
              ),
            ),
          ],
          if (source != null && source.trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Icon(Icons.info_outline,
                    size: 12, color: c.mutedForeground),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    source,
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.caption,
                      color: c.mutedForeground,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _ImageFrame extends StatelessWidget {
  const _ImageFrame({
    required this.url,
    required this.altText,
    this.ratio,
  });

  final String url;
  final String altText;
  final double? ratio;

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);

    final image = CachedNetworkImage(
      imageUrl: resolveMediaUrl(url),
      placeholder: (_, _) => Shimmer.fromColors(
        baseColor: c.muted,
        highlightColor: c.card,
        child: Container(color: c.card),
      ),
      errorWidget: (_, _, _) => Container(
        color: c.muted,
        child: Icon(Icons.broken_image,
            size: 48, color: c.mutedForeground),
      ),
      fit: ratio == null ? BoxFit.contain : BoxFit.cover,
    );

    final clipped = ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Semantics(label: altText, image: true, child: image),
    );

    if (ratio != null) {
      return AspectRatio(aspectRatio: ratio!, child: clipped);
    }

    // Auto — giới hạn chiều cao để không chiếm cả màn hình.
    return ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 360),
      child: clipped,
    );
  }
}

class _MissingImage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: c.muted,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: c.border),
      ),
      child: Center(
        child: Icon(Icons.image_not_supported_outlined,
            size: 48, color: c.mutedForeground),
      ),
    );
  }
}
