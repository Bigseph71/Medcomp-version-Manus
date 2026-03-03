import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Local Notification Service — manages push notifications and reminders
class LocalNotificationService {
  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  /// Schedule a dose reminder notification
  Future<void> scheduleDoseReminder({
    required int id,
    required String medicationName,
    required String dosage,
    required DateTime scheduledTime,
  }) async {
    await _plugin.zonedSchedule(
      id,
      'Rappel de médicament',
      '$medicationName — $dosage',
      _convertToTZDateTime(scheduledTime),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'dose_reminders',
          'Rappels de médicaments',
          channelDescription: 'Notifications pour les rappels de prise de médicaments',
          importance: Importance.high,
          priority: Priority.high,
          enableVibration: true,
          playSound: true,
          actions: [
            AndroidNotificationAction('taken', 'Pris ✓', showsUserInterface: true),
            AndroidNotificationAction('snooze', 'Reporter', showsUserInterface: true),
          ],
        ),
        iOS: DarwinNotificationDetails(
          categoryIdentifier: 'dose_reminder',
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  /// Schedule alive confirmation reminder
  Future<void> scheduleAliveReminder({
    required int id,
    required DateTime scheduledTime,
  }) async {
    await _plugin.zonedSchedule(
      id,
      'Confirmation de bien-être',
      'Appuyez pour confirmer que vous allez bien',
      _convertToTZDateTime(scheduledTime),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'alive_confirmation',
          'Confirmation de vie',
          channelDescription: 'Rappels de confirmation de bien-être',
          importance: Importance.max,
          priority: Priority.max,
          enableVibration: true,
          playSound: true,
          fullScreenIntent: true,
          actions: [
            AndroidNotificationAction('confirm', 'Je vais bien ✓', showsUserInterface: true),
          ],
        ),
        iOS: DarwinNotificationDetails(
          categoryIdentifier: 'alive_confirmation',
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
          interruptionLevel: InterruptionLevel.timeSensitive,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  /// Cancel a specific notification
  Future<void> cancel(int id) => _plugin.cancel(id);

  /// Cancel all notifications
  Future<void> cancelAll() => _plugin.cancelAll();

  // ─── Private ───────────────────────────────────────────────────────────

  void _onNotificationTapped(NotificationResponse response) {
    // Handle notification tap — route to appropriate screen
    final payload = response.payload;
    final actionId = response.actionId;

    // This would be handled by the app's navigation system
    // e.g., navigate to pillbox screen for dose reminders
    // or alive confirmation screen for alive checks
  }

  /// Convert DateTime to TZDateTime (simplified — in production use timezone package)
  dynamic _convertToTZDateTime(DateTime dateTime) {
    // In production, use: tz.TZDateTime.from(dateTime, tz.local)
    return dateTime;
  }
}
