import 'package:go_router/go_router.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/pillbox/screens/pillbox_screen.dart';
import '../features/pillbox/screens/add_medication_screen.dart';
import '../features/pillbox/screens/medication_detail_screen.dart';
import '../features/drug_interaction/screens/interaction_check_screen.dart';
import '../features/drug_interaction/screens/interaction_result_screen.dart';
import '../features/alive_confirmation/screens/alive_home_screen.dart';
import '../features/alive_confirmation/screens/alive_history_screen.dart';
import '../features/alive_confirmation/screens/emergency_contacts_screen.dart';
import '../features/caregiver/screens/caregiver_dashboard_screen.dart';
import '../features/settings/screens/settings_screen.dart';
import '../core/widgets/main_navigation_shell.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    routes: [
      // ─── Auth Routes ─────────────────────────────────────────────────
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // ─── Main App Shell (with bottom navigation) ────────────────────
      ShellRoute(
        builder: (context, state, child) => MainNavigationShell(child: child),
        routes: [
          // Pillbox (Home)
          GoRoute(
            path: '/pillbox',
            builder: (context, state) => const PillboxScreen(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const AddMedicationScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) => MedicationDetailScreen(
                  medicationId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),

          // Drug Interactions
          GoRoute(
            path: '/interactions',
            builder: (context, state) => const InteractionCheckScreen(),
            routes: [
              GoRoute(
                path: 'results',
                builder: (context, state) => const InteractionResultScreen(),
              ),
            ],
          ),

          // Alive Confirmation
          GoRoute(
            path: '/alive',
            builder: (context, state) => const AliveHomeScreen(),
            routes: [
              GoRoute(
                path: 'history',
                builder: (context, state) => const AliveHistoryScreen(),
              ),
              GoRoute(
                path: 'contacts',
                builder: (context, state) => const EmergencyContactsScreen(),
              ),
            ],
          ),

          // Caregiver Dashboard
          GoRoute(
            path: '/caregiver',
            builder: (context, state) => const CaregiverDashboardScreen(),
          ),

          // Settings
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
}
