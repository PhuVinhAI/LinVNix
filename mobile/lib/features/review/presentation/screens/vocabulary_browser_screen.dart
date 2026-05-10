import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/review_providers.dart';
import '../../data/vocabulary_repository.dart';
import '../../domain/review_models.dart';

final vocabularyBrowserProvider = AsyncNotifierProvider<VocabularyBrowserNotifier, List<UserVocabulary>>(
  VocabularyBrowserNotifier.new,
);

class VocabularyBrowserNotifier extends AsyncNotifier<List<UserVocabulary>> {
  int _page = 1;
  bool _hasMore = true;
  static const _limit = 20;

  @override
  Future<List<UserVocabulary>> build() async {
    return _loadPage(1);
  }

  Future<List<UserVocabulary>> _loadPage(int page) async {
    final repo = ref.read(vocabularyRepositoryProvider);
    return repo.getMyVocabularies(page: page, limit: _limit);
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;

    final current = state.value ?? [];
    state = AsyncValue.data(current);

    try {
      final newItems = await _loadPage(_page + 1);
      _page++;
      _hasMore = newItems.length >= _limit;
      state = AsyncValue.data([...current, ...newItems]);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> refresh() async {
    _page = 1;
    _hasMore = true;
    ref.invalidateSelf();
  }
}

class VocabularyBrowserScreen extends ConsumerStatefulWidget {
  const VocabularyBrowserScreen({super.key});

  @override
  ConsumerState<VocabularyBrowserScreen> createState() =>
      _VocabularyBrowserScreenState();
}

class _VocabularyBrowserScreenState
    extends ConsumerState<VocabularyBrowserScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(vocabularyBrowserProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vocabularyBrowserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Vocabulary'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: VocabularySearchDelegate(ref),
              );
            },
          ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(AsyncValue<List<UserVocabulary>> state) {
    return state.when(
      data: (vocabularies) {
        if (vocabularies.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.book, size: 64, color: Colors.grey[400]),
                const SizedBox(height: 16),
                Text(
                  'No vocabulary yet',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Start learning to add vocabulary here',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[500],
                      ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () =>
              ref.read(vocabularyBrowserProvider.notifier).refresh(),
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(8),
            itemCount: vocabularies.length + 1,
            itemBuilder: (context, index) {
              if (index == vocabularies.length) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(),
                  ),
                );
              }

              final item = vocabularies[index];
              return _VocabularyTile(item: item);
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(error.toString(), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  ref.read(vocabularyBrowserProvider.notifier).refresh(),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

class _VocabularyTile extends StatelessWidget {
  const _VocabularyTile({required this.item});

  final UserVocabulary item;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: ListTile(
        title: Text(
          item.vocabulary.word,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(item.vocabulary.translation),
        trailing: _buildMasteryChip(item.masteryLevel),
        onTap: () {
          _showDetail(context, item);
        },
      ),
    );
  }

  Widget _buildMasteryChip(MasteryLevel level) {
    Color color;
    String text;

    switch (level) {
      case MasteryLevel.newWord:
        color = Colors.grey;
        text = 'New';
      case MasteryLevel.learning:
        color = Colors.orange;
        text = 'Learning';
      case MasteryLevel.familiar:
        color = Colors.blue;
        text = 'Familiar';
      case MasteryLevel.mastered:
        color = Colors.green;
        text = 'Mastered';
    }

    return Chip(
      label: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: color.withOpacity(0.1),
      side: BorderSide(color: color),
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  void _showDetail(BuildContext context, UserVocabulary item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _VocabularyDetailSheet(item: item),
    );
  }
}

class _VocabularyDetailSheet extends StatelessWidget {
  const _VocabularyDetailSheet({required this.item});

  final UserVocabulary item;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                item.vocabulary.word,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              if (item.vocabulary.phonetic != null) ...[
                const SizedBox(height: 8),
                Text(
                  '/${item.vocabulary.phonetic}/',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
              const SizedBox(height: 16),
              Text(
                item.vocabulary.translation,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              if (item.vocabulary.partOfSpeech != null) ...[
                const SizedBox(height: 8),
                Chip(
                  label: Text(item.vocabulary.partOfSpeech!),
                  backgroundColor: Colors.blue[100],
                ),
              ],
              if (item.vocabulary.classifier != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Classifier: ${item.vocabulary.classifier}',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
              if (item.vocabulary.exampleSentence != null) ...[
                const SizedBox(height: 16),
                Text(
                  'Example:',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.vocabulary.exampleSentence!,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                ),
                if (item.vocabulary.exampleTranslation != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.vocabulary.exampleTranslation!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ],
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                'Progress',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              _buildProgressRow('Review Count', '${item.reviewCount}'),
              _buildProgressRow(
                'Next Review',
                item.nextReviewDate != null
                    ? _formatDate(item.nextReviewDate!)
                    : 'Not scheduled',
              ),
              if (item.stability != null)
                _buildProgressRow(
                  'Stability',
                  '${item.stability!.toStringAsFixed(1)}',
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProgressRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class VocabularySearchDelegate extends SearchDelegate<String> {
  VocabularySearchDelegate(this.ref);

  final WidgetRef ref;

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, '');
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (query.length < 2) {
      return const Center(
        child: Text('Please enter at least 2 characters'),
      );
    }

    return FutureBuilder<List<Vocabulary>>(
      future: ref
          .read(vocabularyRepositoryProvider)
          .searchVocabularies(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Text('Error: ${snapshot.error}'),
          );
        }

        final results = snapshot.data ?? [];

        if (results.isEmpty) {
          return const Center(
            child: Text('No results found'),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: results.length,
          itemBuilder: (context, index) {
            final vocab = results[index];
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              child: ListTile(
                title: Text(
                  vocab.word,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(vocab.translation),
                trailing: vocab.partOfSpeech != null
                    ? Chip(
                        label: Text(
                          vocab.partOfSpeech!,
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: Colors.blue[100],
                        padding: EdgeInsets.zero,
                        materialTapTargetSize:
                            MaterialTapTargetSize.shrinkWrap,
                      )
                    : null,
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return const Center(
      child: Text('Search for Vietnamese words'),
    );
  }
}
