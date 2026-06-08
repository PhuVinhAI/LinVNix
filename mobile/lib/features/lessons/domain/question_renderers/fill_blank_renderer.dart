import 'package:linvnix/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../question_models.dart';
import '../question_renderer.dart';
import '../question_theme_helper.dart';

class FillBlankRenderer extends QuestionRenderer {
  const FillBlankRenderer();

  @override
  QuestionType get type => QuestionType.fillBlank;

  @override
  bool get showsQuestion => false;

  @override
  bool validateAnswer(Question question, dynamic answer) {
    if (answer is! List<String>) return false;
    final options = question.options as FillBlankOptions;
    final blankCount = _countBlanks(options.sentence, options.blanks);
    if (answer.length != blankCount) return false;
    return answer.every((a) => a.trim().isNotEmpty);
  }

  @override
  Map<String, dynamic> buildAnswerPayload(dynamic answer) {
    return {'answers': answer as List<String>};
  }

  @override
  Widget buildQuestion(Question question, BuildContext context) =>
      const SizedBox.shrink();

  @override
  Widget buildInput(
    Question question,
    BuildContext context,
    dynamic currentAnswer,
    ValueChanged<dynamic> onAnswerChanged,
  ) {
    final options = question.options as FillBlankOptions;
    final segments = _parseSentence(options.sentence);
    final blankCount = segments.whereType<_BlankSegment>().length;
    final fallbackBlanks =
        blankCount > 0 ? blankCount : (options.blanks > 0 ? options.blanks : 1);
    final answers = (currentAnswer is List<String>)
        ? currentAnswer
        : List<String>.filled(fallbackBlanks, '');

    return _FillBlankInput(
      segments: segments.isEmpty
          ? List<_Segment>.generate(
              fallbackBlanks * 2 + 1,
              (i) => i.isEven ? const _TextSegment('') : const _BlankSegment(),
            )
          : segments,
      answers: answers,
      onAnswerChanged: onAnswerChanged,
    );
  }

  static int _countBlanks(String sentence, int fallback) {
    final matches = RegExp(r'_{3,}').allMatches(sentence).length;
    return matches > 0 ? matches : fallback;
  }
}

/// One token in the rendered sentence: either literal text or a blank to fill.
sealed class _Segment {
  const _Segment();
}

class _TextSegment extends _Segment {
  const _TextSegment(this.text);
  final String text;
}

class _BlankSegment extends _Segment {
  const _BlankSegment();
}

List<_Segment> _parseSentence(String sentence) {
  if (sentence.isEmpty) return const <_Segment>[];
  final result = <_Segment>[];
  final regex = RegExp(r'_{3,}');
  int cursor = 0;
  for (final match in regex.allMatches(sentence)) {
    if (match.start > cursor) {
      result.add(_TextSegment(sentence.substring(cursor, match.start)));
    }
    result.add(const _BlankSegment());
    cursor = match.end;
  }
  if (cursor < sentence.length) {
    result.add(_TextSegment(sentence.substring(cursor)));
  }
  return result;
}

class _FillBlankInput extends StatefulWidget {
  const _FillBlankInput({
    required this.segments,
    required this.answers,
    required this.onAnswerChanged,
  });

  final List<_Segment> segments;
  final List<String> answers;
  final ValueChanged<dynamic> onAnswerChanged;

  @override
  State<_FillBlankInput> createState() => _FillBlankInputState();
}

class _FillBlankInputState extends State<_FillBlankInput> {
  late int _blankCount;
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _blankCount = widget.segments.whereType<_BlankSegment>().length;
    _controllers = List.generate(
      _blankCount,
      (i) => TextEditingController(
        text: i < widget.answers.length ? widget.answers[i] : '',
      ),
    );
    _focusNodes = List.generate(_blankCount, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(covariant _FillBlankInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    final newCount = widget.segments.whereType<_BlankSegment>().length;
    if (newCount != _blankCount) {
      for (final c in _controllers) {
        c.dispose();
      }
      for (final f in _focusNodes) {
        f.dispose();
      }
      _blankCount = newCount;
      _controllers = List.generate(
        _blankCount,
        (i) => TextEditingController(
          text: i < widget.answers.length ? widget.answers[i] : '',
        ),
      );
      _focusNodes = List.generate(_blankCount, (_) => FocusNode());
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onChanged() {
    final updated = _controllers.map((c) => c.text).toList();
    widget.onAnswerChanged(updated);
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final visuals = getQuestionVisuals(context, QuestionType.fillBlank);

    int blankIndex = 0;
    final widgets = <Widget>[];
    for (final seg in widget.segments) {
      switch (seg) {
        case _TextSegment(:final text):
          // Split text on spaces but keep them as separators so the wrap can
          // break naturally between words.
          final parts = text.split(RegExp(r'(\s+)'));
          for (final part in parts) {
            if (part.isEmpty) continue;
            widgets.add(
              Text(
                part,
                style: GoogleFonts.inter(
                  fontSize: AppTypography.titleSmall,
                  fontWeight: FontWeight.w600,
                  color: c.foreground,
                  height: 1.8,
                ),
              ),
            );
          }
        case _BlankSegment():
          final i = blankIndex;
          widgets.add(
            _InlineBlankField(
              controller: _controllers[i],
              focusNode: _focusNodes[i],
              accent: visuals.accent,
              fillColor: c.muted,
              onChanged: (_) => _onChanged(),
              isLast: i == _blankCount - 1,
              onSubmitted: () {
                if (i < _blankCount - 1) {
                  _focusNodes[i + 1].requestFocus();
                }
              },
            ),
          );
          blankIndex++;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Count hint shown only when there's more than one blank — for a
        // single blank the parent header pill already says "Fill in the Blank".
        if (_blankCount > 1) ...[
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm + 2,
            ),
            decoration: BoxDecoration(
              color: visuals.surface,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: visuals.accent.withValues(alpha: 0.20),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.edit_note_rounded,
                  size: 20,
                  color: visuals.accent,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    S.of(context).fillBlanksCountParam(_blankCount),
                    style: GoogleFonts.inter(
                      fontSize: AppTypography.bodyMedium,
                      color: visuals.accent,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
        ],

        // Sentence with inline blanks
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: c.card,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: c.border, width: 1),
          ),
          child: Wrap(
            spacing: 6,
            runSpacing: 10,
            alignment: WrapAlignment.start,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: widgets,
          ),
        ),
      ],
    );
  }
}

class _InlineBlankField extends StatefulWidget {
  const _InlineBlankField({
    required this.controller,
    required this.focusNode,
    required this.accent,
    required this.fillColor,
    required this.onChanged,
    required this.isLast,
    required this.onSubmitted,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final Color accent;
  final Color fillColor;
  final ValueChanged<String> onChanged;
  final bool isLast;
  final VoidCallback onSubmitted;

  @override
  State<_InlineBlankField> createState() => _InlineBlankFieldState();
}

class _InlineBlankFieldState extends State<_InlineBlankField> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_handleTextChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_handleTextChanged);
    super.dispose();
  }

  void _handleTextChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = AppTheme.colors(context);
    final isFilled = widget.controller.text.trim().isNotEmpty;
    // Width grows with content; min keeps it tappable, max prevents overflow.
    final textLen = widget.controller.text.length;
    final width = (textLen * 14.0 + 56).clamp(96.0, 220.0);

    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: width, minWidth: 96),
      child: SizedBox(
        height: 42,
        child: TextField(
          controller: widget.controller,
          focusNode: widget.focusNode,
          onChanged: widget.onChanged,
          textInputAction:
              widget.isLast ? TextInputAction.done : TextInputAction.next,
          onSubmitted: (_) => widget.onSubmitted(),
          textAlign: TextAlign.center,
          textAlignVertical: TextAlignVertical.center,
          style: GoogleFonts.inter(
            fontSize: AppTypography.titleSmall,
            fontWeight: FontWeight.w700,
            color: isFilled ? widget.accent : c.foreground,
            height: 1.8,
          ),
          decoration: InputDecoration(
            hintText: '____',
            hintStyle: GoogleFonts.inter(
              fontSize: AppTypography.titleSmall,
              fontWeight: FontWeight.w600,
              color: c.mutedForeground.withValues(alpha: 0.5),
              height: 1.8,
            ),
            filled: true,
            fillColor: isFilled
                ? widget.accent.withValues(alpha: 0.08)
                : widget.fillColor,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: 0,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: BorderSide(
                color: widget.accent.withValues(alpha: 0.40),
                width: 1.5,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: BorderSide(
                color: isFilled
                    ? widget.accent
                    : widget.accent.withValues(alpha: 0.40),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
              borderSide: BorderSide(color: widget.accent, width: 2),
            ),
          ),
        ),
      ),
    );
  }
}

// Hint to avoid an unused-import warning when S is only referenced indirectly.
// ignore: unused_element
String _typeAnswerHint(BuildContext context) => S.of(context).typeAnswerHint;
