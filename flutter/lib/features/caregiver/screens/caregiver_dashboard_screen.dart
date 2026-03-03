import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class CaregiverDashboardScreen extends StatelessWidget {
  const CaregiverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord soignant'),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Patient selector
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Text('JD')),
                title: const Text('Jean Dupont', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Patient — Dernière activité: il y a 2h'),
                trailing: const Icon(Icons.arrow_drop_down),
                onTap: () {}, // Show patient selector
              ),
            ),
            const SizedBox(height: 16),

            // Quick status cards
            Row(children: [
              Expanded(child: _statusCard(
                context,
                icon: Icons.favorite,
                title: 'Bien-être',
                value: 'Confirmé',
                color: AppTheme.aliveConfirmed,
              )),
              const SizedBox(width: 12),
              Expanded(child: _statusCard(
                context,
                icon: Icons.medication,
                title: 'Adhérence',
                value: '87%',
                color: AppTheme.primaryColor,
              )),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _statusCard(
                context,
                icon: Icons.warning_amber,
                title: 'Alertes',
                value: '1',
                color: AppTheme.severityYellow,
              )),
              const SizedBox(width: 12),
              Expanded(child: _statusCard(
                context,
                icon: Icons.battery_std,
                title: 'Batterie',
                value: '85%',
                color: AppTheme.severityGreen,
              )),
            ]),
            const SizedBox(height: 24),

            // Recent activity
            Text('Activité récente', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),

            _activityItem(
              icon: Icons.check_circle,
              color: AppTheme.aliveConfirmed,
              title: 'Bien-être confirmé',
              subtitle: 'Il y a 2 heures',
            ),
            _activityItem(
              icon: Icons.medication,
              color: AppTheme.primaryColor,
              title: 'Metformine 500mg — Pris',
              subtitle: 'Il y a 4 heures',
            ),
            _activityItem(
              icon: Icons.warning,
              color: AppTheme.severityYellow,
              title: 'Dose manquée — Amlodipine',
              subtitle: 'Hier à 20:00',
            ),
            _activityItem(
              icon: Icons.check_circle,
              color: AppTheme.aliveConfirmed,
              title: 'Bien-être confirmé',
              subtitle: 'Hier à 09:12',
            ),
            const SizedBox(height: 24),

            // Actions
            Text('Actions', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),

            ListTile(
              leading: const Icon(Icons.bar_chart),
              title: const Text('Rapport d\'adhérence'),
              subtitle: const Text('Générer un rapport PDF'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Partager avec un médecin'),
              subtitle: const Text('Lien sécurisé temporaire'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.person_add),
              title: const Text('Inviter un soignant'),
              subtitle: const Text('Ajouter un autre soignant'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusCard(BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(title, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }

  Widget _activityItem({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      contentPadding: EdgeInsets.zero,
    );
  }
}
