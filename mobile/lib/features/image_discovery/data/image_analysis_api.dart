import 'package:dio/dio.dart';

import '../domain/image_analysis_models.dart';

class ImageAnalysisApi {
  ImageAnalysisApi(this._dio);

  final Dio _dio;

  Future<ImageAnalysisResponse> analyze({
    required List<ImageAnalysisRequestImage> images,
    required String prompt,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/image-analysis/analyze',
      data: {
        'images': images.map((image) => image.toJson()).toList(),
        'prompt': prompt,
      },
    );

    return ImageAnalysisResponse.fromJson(response.data!);
  }
}
