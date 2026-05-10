import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/continue_card.dart';
import '../widgets/due_review_card.dart';
import '../../data/home_providers.dart';
import '../../../review/data/review_providers.dart';
import '../../../courses/data/courses_providers.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _refreshOnFocus();
  }

  void _refreshOnFocus() {
    ref.invalidate(continueLearningProvider);
    ref.invalidate(dueReviewCountProvider);
  }

  Future<void> _onRefresh() async {
    ref.invalidate(continueLearningProvider);
    ref.invalidate(dueReviewCountProvider);
    ref.invalidate(userProgressProvider);
    await Future.wait([
      ref.read(continueLearningProvider.future),
      ref.read(dueReviewCountProvider.future),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            ContinueCard(),
            SizedBox(height: 16),
            DueReviewCard(),
          ],
        ),
      ),
    );
  }
}
