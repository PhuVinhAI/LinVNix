import 'package:flutter/material.dart';

class BookmarkIconButton extends StatelessWidget {
  const BookmarkIconButton({
    super.key,
    required this.vocabularyId,
    required this.isBookmarked,
    required this.onToggle,
  });

  final String vocabularyId;
  final bool isBookmarked;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return IconButton(
      onPressed: () => onToggle(vocabularyId),
      icon: Icon(
        isBookmarked ? Icons.bookmark : Icons.bookmark_border,
        color: isBookmarked ? theme.colorScheme.primary : null,
      ),
    );
  }
}
