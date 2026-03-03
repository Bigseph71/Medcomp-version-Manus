import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class AliveHistoryScreen extends StatelessWidget {
  const AliveHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Historique de bien-être')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 30,
        itemBuilder: (context, index) {
          final date = DateTime.now().subtract(Duration(days: index));
          final isConfirmed = index != 5 && index != 12; // Simulate some misses
          final isEscalated = index == 5;

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: isEscalated
                      ? AppTheme.severityRed.withOpacity(0.1)
                      : isConfirmed
                          ? AppTheme.aliveConfirmed.withOpacity(0.1)
                          : AppTheme.alivePending.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isEscalated
                      ? Icons.warning
                      : isConfirmed
                          ? Icons.check_circle
                          : Icons.cancel,
                  color: isEscalated
                      ? AppTheme.severityRed
                      : isConfirmed
                          ? AppTheme.aliveConfirmed
                          : AppTheme.aliveMissed,
                ),
              ),
              title: Text(
                '${date.day}/${date.month}/${date.year}',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text(
                isEscalated
                    ? 'Escalation déclenchée — Contact alerté'
                    : isConfirmed
                        ? 'Confirmé à 09:15'
                        : 'Non confirmé',
              ),
              trailing: isEscalated
                  ? const Chip(
                      label: Text('Escalation', style: TextStyle(color: Colors.white, fontSize: 10)),
                      backgroundColor: AppTheme.severityRed,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    )
                  : null,
            ),
          );
        },
      ),
    );
  }
}
