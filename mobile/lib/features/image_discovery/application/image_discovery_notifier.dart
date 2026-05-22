import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../data/image_analysis_providers.dart';
import '../domain/image_analysis_models.dart';

const _unsetError = Object();

final imagePickerProvider = Provider<ImagePicker>((ref) => ImagePicker());

final imageDiscoveryProvider =
    NotifierProvider.autoDispose<ImageDiscoveryNotifier, ImageDiscoveryState>(
      ImageDiscoveryNotifier.new,
    );

class ImageDiscoveryImage {
  const ImageDiscoveryImage({
    required this.id,
    required this.bytes,
    required this.base64,
    required this.mimeType,
  });

  final String id;
  final Uint8List bytes;
  final String base64;
  final String mimeType;

  ImageAnalysisRequestImage toRequestImage() {
    return ImageAnalysisRequestImage(base64: base64, mimeType: mimeType);
  }
}

enum ImageDiscoveryMessageRole { user, assistant }

class ImageDiscoveryMessage {
  const ImageDiscoveryMessage({
    required this.id,
    required this.role,
    required this.text,
    this.vocabularies = const [],
  });

  final String id;
  final ImageDiscoveryMessageRole role;
  final String text;
  final List<ImageAnalysisVocabulary> vocabularies;

  bool get isUser => role == ImageDiscoveryMessageRole.user;
}

class ImageDiscoveryState {
  const ImageDiscoveryState({
    this.images = const [],
    this.messages = const [],
    this.isLoading = false,
    this.error,
  });

  final List<ImageDiscoveryImage> images;
  final List<ImageDiscoveryMessage> messages;
  final bool isLoading;
  final String? error;

  bool get hasImage => images.isNotEmpty;

  ImageDiscoveryState copyWith({
    List<ImageDiscoveryImage>? images,
    List<ImageDiscoveryMessage>? messages,
    bool? isLoading,
    Object? error = _unsetError,
  }) {
    return ImageDiscoveryState(
      images: images ?? this.images,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: identical(error, _unsetError) ? this.error : error as String?,
    );
  }
}

class ImageDiscoveryNotifier extends Notifier<ImageDiscoveryState> {
  @override
  ImageDiscoveryState build() => const ImageDiscoveryState();

  Future<void> pickImage(ImageSource source) async {
    try {
      final picker = ref.read(imagePickerProvider);
      final file = await picker.pickImage(source: source);
      if (file == null) return;
      await setImage(file);
    } catch (_) {
      state = state.copyWith(error: 'Unable to load image');
    }
  }

  Future<void> setImage(XFile file) async {
    final bytes = await file.readAsBytes();
    state = ImageDiscoveryState(
      images: [
        ImageDiscoveryImage(
          id: DateTime.now().microsecondsSinceEpoch.toString(),
          bytes: bytes,
          base64: base64Encode(bytes),
          mimeType: _inferMimeType(file),
        ),
      ],
    );
  }

  void removeImage(String id) {
    state = state.copyWith(
      images: state.images.where((image) => image.id != id).toList(),
      messages: [],
      error: null,
    );
  }

  Future<void> sendPrompt(String prompt) async {
    final trimmed = prompt.trim();
    if (trimmed.isEmpty || state.isLoading) return;
    if (!state.hasImage) {
      state = state.copyWith(error: 'Add a photo first');
      return;
    }

    final image = state.images.first;
    final userMessage = ImageDiscoveryMessage(
      id: 'user-${DateTime.now().microsecondsSinceEpoch}',
      role: ImageDiscoveryMessageRole.user,
      text: trimmed,
    );

    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    );

    try {
      final api = ref.read(imageAnalysisApiProvider);
      final response = await api.analyze(
        images: [image.toRequestImage()],
        prompt: trimmed,
      );
      final assistantMessage = ImageDiscoveryMessage(
        id: 'assistant-${DateTime.now().microsecondsSinceEpoch}',
        role: ImageDiscoveryMessageRole.assistant,
        text: response.text,
        vocabularies: response.vocabularies,
      );
      state = state.copyWith(
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        error: null,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Unable to analyze image. Please try again.',
      );
    }
  }

  String _inferMimeType(XFile file) {
    final explicit = file.mimeType?.toLowerCase();
    if (explicit != null && explicit.startsWith('image/')) {
      return explicit == 'image/jpg' ? 'image/jpeg' : explicit;
    }

    final sourceName = '${file.name} ${file.path}'.toLowerCase();
    if (sourceName.contains('.png')) return 'image/png';
    if (sourceName.contains('.webp')) return 'image/webp';
    if (sourceName.contains('.heic')) return 'image/heic';
    if (sourceName.contains('.heif')) return 'image/heif';
    return 'image/jpeg';
  }
}
