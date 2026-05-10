import 'package:flutter/material.dart';
import '../../domain/review_models.dart';

class RatingButtons extends StatelessWidget {
  const RatingButtons({
    super.key,
    required this.onRating,
    this.enabled = true,
  });

  final ValueChanged<Rating> onRating;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _RatingButton(
          rating: Rating.again,
          color: Colors.red,
          icon: Icons.replay,
          onPressed: enabled ? () => onRating(Rating.again) : null,
        ),
        _RatingButton(
          rating: Rating.hard,
          color: Colors.orange,
          icon: Icons.sentiment_dissatisfied,
          onPressed: enabled ? () => onRating(Rating.hard) : null,
        ),
        _RatingButton(
          rating: Rating.good,
          color: Colors.green,
          icon: Icons.sentiment_satisfied,
          onPressed: enabled ? () => onRating(Rating.good) : null,
        ),
        _RatingButton(
          rating: Rating.easy,
          color: Colors.blue,
          icon: Icons.sentiment_very_satisfied,
          onPressed: enabled ? () => onRating(Rating.easy) : null,
        ),
      ],
    );
  }
}

class _RatingButton extends StatelessWidget {
  const _RatingButton({
    required this.rating,
    required this.color,
    required this.icon,
    this.onPressed,
  });

  final Rating rating;
  final Color color;
  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            foregroundColor: Colors.white,
            shape: const CircleBorder(),
            padding: const EdgeInsets.all(16),
          ),
          child: Icon(icon, size: 28),
        ),
        const SizedBox(height: 4),
        Text(
          rating.displayName,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
