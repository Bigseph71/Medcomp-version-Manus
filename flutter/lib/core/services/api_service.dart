import 'package:dio/dio.dart';
import '../models/api_response.dart';

/// Core API Service — handles all HTTP communication with the backend
class ApiService {
  late final Dio _dio;
  String? _accessToken;

  ApiService({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Request interceptor for auth token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_accessToken != null) {
          options.headers['Authorization'] = 'Bearer $_accessToken';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired — attempt refresh
          // In production, implement token refresh logic here
        }
        return handler.next(error);
      },
    ));
  }

  void setToken(String token) => _accessToken = token;
  void clearToken() => _accessToken = null;

  // ─── Generic HTTP Methods ──────────────────────────────────────────────

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(String path, {dynamic data}) =>
      _dio.post(path, data: data);

  Future<Response> put(String path, {dynamic data}) =>
      _dio.put(path, data: data);

  Future<Response> delete(String path) =>
      _dio.delete(path);

  Future<Response> patch(String path, {dynamic data}) =>
      _dio.patch(path, data: data);
}
