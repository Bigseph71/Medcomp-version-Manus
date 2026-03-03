import 'package:flutter/material.dart';

/// MedCom Application Theme
/// WCAG 2.1 AA compliant with Senior Mode support
class AppTheme {
  AppTheme._();

  // ─── Brand Colors ────────────────────────────────────────────────────────

  static const Color primaryColor = Color(0xFF1565C0);      // Medical blue
  static const Color primaryLight = Color(0xFF5E92F3);
  static const Color primaryDark = Color(0xFF003C8F);
  static const Color secondaryColor = Color(0xFF00897B);     // Teal
  static const Color accentColor = Color(0xFF26A69A);

  // Severity Colors (Drug Interactions)
  static const Color severityGreen = Color(0xFF2E7D32);
  static const Color severityYellow = Color(0xFFF9A825);
  static const Color severityRed = Color(0xFFC62828);

  // Alive Confirmation
  static const Color aliveConfirmed = Color(0xFF2E7D32);
  static const Color alivePending = Color(0xFFF57F17);
  static const Color aliveMissed = Color(0xFFC62828);

  // Neutral
  static const Color backgroundLight = Color(0xFFF5F5F5);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E1E1E);

  // ─── Light Theme ─────────────────────────────────────────────────────────

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      surface: surfaceLight,
      error: severityRed,
    ),
    scaffoldBackgroundColor: backgroundLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: const BorderSide(color: primaryColor),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF212121)),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: Color(0xFF212121)),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF212121)),
      titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF212121)),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Color(0xFF424242)),
      bodyLarge: TextStyle(fontSize: 16, color: Color(0xFF424242)),
      bodyMedium: TextStyle(fontSize: 14, color: Color(0xFF616161)),
      labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: primaryColor,
      unselectedItemColor: Color(0xFF9E9E9E),
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
    ),
  );

  // ─── Dark Theme ──────────────────────────────────────────────────────────

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: primaryLight,
      secondary: accentColor,
      surface: surfaceDark,
      error: Color(0xFFEF5350),
    ),
    scaffoldBackgroundColor: backgroundDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceDark,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: surfaceDark,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryLight,
        foregroundColor: Colors.black,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
  );

  // ─── Senior Mode Theme Overrides ─────────────────────────────────────────

  static ThemeData seniorModeTheme(ThemeData baseTheme) {
    return baseTheme.copyWith(
      textTheme: baseTheme.textTheme.copyWith(
        headlineLarge: baseTheme.textTheme.headlineLarge?.copyWith(fontSize: 36),
        headlineMedium: baseTheme.textTheme.headlineMedium?.copyWith(fontSize: 30),
        headlineSmall: baseTheme.textTheme.headlineSmall?.copyWith(fontSize: 26),
        titleLarge: baseTheme.textTheme.titleLarge?.copyWith(fontSize: 24),
        titleMedium: baseTheme.textTheme.titleMedium?.copyWith(fontSize: 20),
        bodyLarge: baseTheme.textTheme.bodyLarge?.copyWith(fontSize: 20),
        bodyMedium: baseTheme.textTheme.bodyMedium?.copyWith(fontSize: 18),
        labelLarge: baseTheme.textTheme.labelLarge?.copyWith(fontSize: 18),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 72),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
      ),
      iconTheme: const IconThemeData(size: 32),
    );
  }
}
