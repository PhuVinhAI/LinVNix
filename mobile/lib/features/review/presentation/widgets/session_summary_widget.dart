import 'package:flutter/material.dart';
import '../../domain/review_models.dart';

class SessionSummaryWidget extends StatelessWidget {
  const SessionSummaryWidget({
    super.key,
    required this.summary,
    required this.onFinish,
  });

  final SessionSummary summary;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Session Complete!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 24),
            _buildStat('Total Reviewed', summary.totalReviewed, Icons.book),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildRatingStat('Again', summary.againCount, Colors.red),
                _buildRatingStat('Hard', summary.hardCount, Colors.orange),
                _buildRatingStat('Good', summary.goodCount, Colors.green),
                _buildRatingStat('Easy', summary.easyCount, Colors.blue),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Duration: ${_formatDuration(summary.duration)}',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onFinish,
                child: const Text('Done'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, int value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 24),
        const SizedBox(width: 8),
        Text(
          '$label: $value',
          style: const TextStyle(fontSize: 18),
        ),
      ],
    );
  }

  Widget _buildRatingStat(String label, int count, Color color) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color,
          ),
        ),
      ],
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    if (minutes > 0) {
      return '$minutes min $seconds sec';
    }
    return '$seconds sec';
  }
}
