/// Generic API response wrapper
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? true,
      data: fromJsonT != null && json['data'] != null
          ? fromJsonT(json['data'])
          : json['data'],
      message: json['message'],
      statusCode: json['statusCode'],
      errors: json['errors'],
    );
  }
}

/// Paginated response
class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;

  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  bool get hasMore => page * limit < total;
  int get totalPages => (total / limit).ceil();
}
