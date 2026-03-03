import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class EmergencyContactsScreen extends StatelessWidget {
  const EmergencyContactsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contacts d\'urgence')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Info card
          Card(
            color: Colors.blue.shade50,
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: AppTheme.primaryColor),
                  SizedBox(width: 12),
                  Expanded(child: Text(
                    'Vos contacts d\'urgence seront alertés si vous ne confirmez pas votre bien-être dans le délai configuré.',
                    style: TextStyle(fontSize: 13),
                  )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Contact cards (placeholder)
          _buildContactCard(
            context,
            name: 'Marie Dupont',
            relationship: 'Fille',
            phone: '+33 6 12 34 56 78',
            priority: 1,
            notifyOnMissedDose: true,
            notifyOnAliveMiss: true,
          ),
          _buildContactCard(
            context,
            name: 'Dr. Martin',
            relationship: 'Médecin traitant',
            phone: '+33 1 23 45 67 89',
            priority: 2,
            notifyOnMissedDose: false,
            notifyOnAliveMiss: true,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddContactDialog(context),
        icon: const Icon(Icons.person_add),
        label: const Text('Ajouter'),
      ),
    );
  }

  Widget _buildContactCard(
    BuildContext context, {
    required String name,
    required String relationship,
    required String phone,
    required int priority,
    required bool notifyOnMissedDose,
    required bool notifyOnAliveMiss,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  child: Text('${priority}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    Text(relationship, style: TextStyle(color: Colors.grey.shade600)),
                  ],
                )),
                PopupMenuButton(
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'edit', child: Text('Modifier')),
                    const PopupMenuItem(value: 'delete', child: Text('Supprimer')),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.phone, size: 16, color: Colors.grey),
              const SizedBox(width: 4),
              Text(phone, style: TextStyle(color: Colors.grey.shade600)),
            ]),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                if (notifyOnAliveMiss) Chip(
                  label: const Text('Bien-être', style: TextStyle(fontSize: 11)),
                  backgroundColor: AppTheme.aliveConfirmed.withOpacity(0.1),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  visualDensity: VisualDensity.compact,
                ),
                if (notifyOnMissedDose) Chip(
                  label: const Text('Doses manquées', style: TextStyle(fontSize: 11)),
                  backgroundColor: AppTheme.severityYellow.withOpacity(0.1),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddContactDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16, right: 16, top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Ajouter un contact', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextFormField(decoration: const InputDecoration(labelText: 'Nom complet')),
            const SizedBox(height: 12),
            TextFormField(decoration: const InputDecoration(labelText: 'Relation')),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Téléphone'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Email (optionnel)'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Ajouter le contact'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
