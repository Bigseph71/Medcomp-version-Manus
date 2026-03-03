import 'api_service.dart';
import 'secure_storage_service.dart';

/// Authentication Service — manages login, register, token lifecycle
class AuthService {
  final ApiService apiService;
  final SecureStorageService storage;

  bool _isAuthenticated = false;
  Map<String, dynamic>? _currentUser;

  AuthService({required this.apiService, required this.storage});

  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get currentUser => _currentUser;

  /// Register a new user
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
    String? dateOfBirth,
    required bool gdprConsent,
    required bool dataProcessingConsent,
  }) async {
    final response = await apiService.post('/auth/register', data: {
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'dateOfBirth': dateOfBirth,
      'gdprConsent': gdprConsent,
      'dataProcessingConsent': dataProcessingConsent,
    });

    final data = response.data;
    await _handleAuthResponse(data);
    return data;
  }

  /// Login with email and password
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await apiService.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    final data = response.data;
    await _handleAuthResponse(data);
    return data;
  }

  /// Refresh access token
  Future<void> refreshToken() async {
    final refreshToken = await storage.read('refresh_token');
    if (refreshToken == null) throw Exception('No refresh token');

    final response = await apiService.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });

    final data = response.data;
    await _handleAuthResponse(data);
  }

  /// Logout
  Future<void> logout() async {
    _isAuthenticated = false;
    _currentUser = null;
    apiService.clearToken();
    await storage.deleteAll();
  }

  /// Check if user is already logged in (from stored token)
  Future<bool> checkAuthStatus() async {
    final token = await storage.read('access_token');
    if (token == null) return false;

    apiService.setToken(token);
    try {
      final response = await apiService.get('/auth/profile');
      _currentUser = response.data;
      _isAuthenticated = true;
      return true;
    } catch (e) {
      // Try refresh
      try {
        await refreshToken();
        return true;
      } catch (_) {
        await logout();
        return false;
      }
    }
  }

  /// Get user profile
  Future<Map<String, dynamic>> getProfile() async {
    final response = await apiService.get('/auth/profile');
    _currentUser = response.data;
    return response.data;
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await apiService.put('/auth/profile', data: data);
    _currentUser = response.data;
    return response.data;
  }

  /// Export user data (GDPR)
  Future<Map<String, dynamic>> exportData() async {
    final response = await apiService.get('/auth/export');
    return response.data;
  }

  /// Delete account (GDPR)
  Future<void> deleteAccount() async {
    await apiService.delete('/auth/account');
    await logout();
  }

  // ─── Private Helpers ───────────────────────────────────────────────────

  Future<void> _handleAuthResponse(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;

    await storage.write('access_token', accessToken);
    await storage.write('refresh_token', refreshToken);

    apiService.setToken(accessToken);
    _currentUser = data['user'];
    _isAuthenticated = true;
  }
}
