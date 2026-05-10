import 'package:flutter/material.dart';
import '../../domain/review_models.dart';

class FlashcardWidget extends StatefulWidget {
  const FlashcardWidget({
    super.key,
    required this.vocabulary,
    required this.onFlip,
    this.onAudioPlay,
  });

  final Vocabulary vocabulary;
  final VoidCallback onFlip;
  final VoidCallback? onAudioPlay;

  @override
  State<FlashcardWidget> createState() => _FlashcardWidgetState();
}

class _FlashcardWidgetState extends State<FlashcardWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _flip() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() {
      _isFront = !_isFront;
    });
    widget.onFlip();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flip,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final angle = _controller.value * 3.14159;
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(angle),
            child: angle < 3.14159 / 2
                ? _buildFront()
                : Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()..rotateY(3.14159),
                    child: _buildBack(),
                  ),
          );
        },
      ),
    );
  }

  Widget _buildFront() {
    return Card(
      elevation: 8,
      child: Container(
        width: double.infinity,
        height: 300,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              widget.vocabulary.word,
              style: Theme.of(context).textTheme.headlineLarge,
              textAlign: TextAlign.center,
            ),
            if (widget.vocabulary.phonetic != null) ...[
              const SizedBox(height: 8),
              Text(
                '/${widget.vocabulary.phonetic}/',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            if (widget.vocabulary.audioUrl != null) ...[
              const SizedBox(height: 16),
              IconButton(
                icon: const Icon(Icons.volume_up, size: 32),
                onPressed: widget.onAudioPlay,
              ),
            ],
            const SizedBox(height: 24),
            Text(
              'Tap to flip',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[500],
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBack() {
    return Card(
      elevation: 8,
      child: Container(
        width: double.infinity,
        height: 300,
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.vocabulary.translation,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              if (widget.vocabulary.partOfSpeech != null) ...[
                const SizedBox(height: 8),
                Chip(
                  label: Text(widget.vocabulary.partOfSpeech!),
                  backgroundColor: Colors.blue[100],
                ),
              ],
              if (widget.vocabulary.classifier != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Classifier: ${widget.vocabulary.classifier}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              if (widget.vocabulary.exampleSentence != null) ...[
                const SizedBox(height: 16),
                Text(
                  'Example:',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.vocabulary.exampleSentence!,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                ),
                if (widget.vocabulary.exampleTranslation != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    widget.vocabulary.exampleTranslation!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}
