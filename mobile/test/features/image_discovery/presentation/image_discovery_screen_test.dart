import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:linvnix/core/theme/app_theme.dart';
import 'package:linvnix/features/image_discovery/application/image_discovery_notifier.dart';
import 'package:linvnix/features/image_discovery/data/image_analysis_api.dart';
import 'package:linvnix/features/image_discovery/data/image_analysis_providers.dart';
import 'package:linvnix/features/image_discovery/domain/image_analysis_models.dart';
import 'package:linvnix/features/image_discovery/presentation/screens/image_discovery_screen.dart';

final _pngBytes = base64Decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8'
  '/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
);

void main() {
  testWidgets(
    'sends the selected image and renders AI markdown with vocabulary cards',
    (tester) async {
      final api = _FakeImageAnalysisApi();
      final container = ProviderContainer(
        overrides: [imageAnalysisApiProvider.overrideWithValue(api)],
      );
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ImageDiscoveryScreen(),
          ),
        ),
      );

      await container
          .read(imageDiscoveryProvider.notifier)
          .setImage(
            XFile.fromData(_pngBytes, name: 'photo.png', mimeType: 'image/png'),
          );
      await tester.pump();

      await tester.enterText(find.byType(TextField), 'What does this say?');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pump();
      await tester.pumpAndSettle();

      expect(api.capturedPrompt, 'What does this say?');
      expect(api.capturedImages.single.mimeType, 'image/png');
      expect(api.capturedImages.single.base64, base64Encode(_pngBytes));
      expect(find.text('cấm đỗ xe'), findsOneWidget);
      expect(find.text('no parking'), findsOneWidget);
    },
  );

  testWidgets('shows an error message when analysis fails', (tester) async {
    final api = _FakeImageAnalysisApi(shouldFail: true);
    final container = ProviderContainer(
      overrides: [imageAnalysisApiProvider.overrideWithValue(api)],
    );
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp(
          theme: AppTheme.light(),
          home: const ImageDiscoveryScreen(),
        ),
      ),
    );

    await container
        .read(imageDiscoveryProvider.notifier)
        .setImage(
          XFile.fromData(_pngBytes, name: 'photo.png', mimeType: 'image/png'),
        );
    await tester.pump();

    await tester.enterText(find.byType(TextField), 'Analyze this');
    await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
    await tester.pump();
    await tester.pumpAndSettle();

    expect(
      find.text('Unable to analyze image. Please try again.'),
      findsOneWidget,
    );
  });
}

class _FakeImageAnalysisApi extends ImageAnalysisApi {
  _FakeImageAnalysisApi({this.shouldFail = false}) : super(Dio());

  final bool shouldFail;
  List<ImageAnalysisRequestImage> capturedImages = const [];
  String? capturedPrompt;

  @override
  Future<ImageAnalysisResponse> analyze({
    required List<ImageAnalysisRequestImage> images,
    required String prompt,
  }) async {
    capturedImages = images;
    capturedPrompt = prompt;
    if (shouldFail) {
      throw Exception('analysis failed');
    }
    return const ImageAnalysisResponse(
      text: '**cấm đỗ xe** means no parking.',
      vocabularies: [
        ImageAnalysisVocabulary(
          word: 'cấm đỗ xe',
          translation: 'no parking',
          partOfSpeech: 'phrase',
        ),
      ],
    );
  }
}
