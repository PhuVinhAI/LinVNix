import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../storage/secure_storage_service.dart';

class TokenRefreshInterceptor extends Interceptor {
  TokenRefreshInterceptor(this._dio, this._storage, {this.onAuthFailure});
  final Dio _dio;
  final SecureStorageService _storage;
  VoidCallback? onAuthFailure;

  bool _isRefreshing = false;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    if (_isRefreshing) {
      return handler.next(err);
    }

    _isRefreshing = true;

    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken == null) {
        await _storage.clearTokens();
        onAuthFailure?.call();
        return handler.next(err);
      }

      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data;
      if (data == null) {
        await _storage.clearTokens();
        onAuthFailure?.call();
        return handler.next(err);
      }

      final newAccessToken = data['access_token'] as String;
      final newRefreshToken = data['refresh_token'] as String;
      await _storage.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      // Retry original request with new token
      final requestOptions = err.requestOptions;
      requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

      final retryResponse = await _dio.fetch(requestOptions);
      handler.resolve(retryResponse);
    } catch (_) {
      await _storage.clearTokens();
      onAuthFailure?.call();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }
}
