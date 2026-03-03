/// Application configuration constants
class AppConfig {
  AppConfig._();

  // API Configuration
  static const String apiBaseUrl = 'https://api.medcom.health/api/v1';
  static const String apiVersion = 'v1';
  static const Duration apiTimeout = Duration(seconds: 30);

  // App Info
  static const String appName = 'MedCom';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';

  // Alive Confirmation Defaults
  static const int defaultCheckIntervalHours = 24;
  static const int defaultGracePeriodMinutes = 60;
  static const int defaultEscalationDelayMinutes = 30;
  static const int lowBatteryThreshold = 15;

  // Pillbox Defaults
  static const int defaultSnoozeMinutes = 15;
  static const int defaultMaxSnoozeCount = 3;
  static const int doseScheduleAheadDays = 7;

  // UI Configuration
  static const double seniorModeFontScale = 1.4;
  static const double seniorModeButtonMinHeight = 72.0;
  static const double seniorModeIconSize = 48.0;

  // Security
  static const int maxLoginAttempts = 5;
  static const Duration lockDuration = Duration(minutes: 30);
  static const Duration tokenRefreshThreshold = Duration(minutes: 5);

  // Cache
  static const Duration cacheExpiration = Duration(hours: 24);
  static const String drugCacheBox = 'drug_cache';
  static const String medicationCacheBox = 'medication_cache';
  static const String settingsCacheBox = 'settings_cache';

  // Disclaimer
  static const String medicalDisclaimer =
      'This tool does not replace professional medical advice. '
      'Always consult a licensed healthcare provider.';
}
