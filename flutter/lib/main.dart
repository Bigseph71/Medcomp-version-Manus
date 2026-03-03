import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'config/app_config.dart';
import 'config/router.dart';
import 'core/theme/app_theme.dart';
import 'core/services/auth_service.dart';
import 'core/services/api_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/secure_storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for offline-first storage
  await Hive.initFlutter();

  // Lock orientation for senior accessibility
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize services
  final secureStorage = SecureStorageService();
  final apiService = ApiService(baseUrl: AppConfig.apiBaseUrl);
  final authService = AuthService(apiService: apiService, storage: secureStorage);
  final notificationService = LocalNotificationService();

  await notificationService.initialize();

  runApp(
    MedComApp(
      authService: authService,
      apiService: apiService,
      notificationService: notificationService,
    ),
  );
}

class MedComApp extends StatelessWidget {
  final AuthService authService;
  final ApiService apiService;
  final LocalNotificationService notificationService;

  const MedComApp({
    super.key,
    required this.authService,
    required this.apiService,
    required this.notificationService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authService),
        RepositoryProvider.value(value: apiService),
        RepositoryProvider.value(value: notificationService),
      ],
      child: MaterialApp.router(
        title: 'MedCom',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: AppRouter.router,
        locale: const Locale('fr', 'FR'),
        supportedLocales: const [
          Locale('fr', 'FR'),
          Locale('en', 'US'),
          Locale('de', 'DE'),
          Locale('es', 'ES'),
        ],
      ),
    );
  }
}
