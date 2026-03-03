import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class MedicationDetailScreen extends StatelessWidget {
  final String medicationId;

  const MedicationDetailScreen({super.key, required this.medicationId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Détail du médicament'),
        actions: [
          IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
          IconButton(icon: const Icon(Icons.delete_outline), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Medication header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Container(
                        width: 56, height: 56,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.medication, color: AppTheme.primaryColor, size: 32),
                      ),
                      const SizedBox(width: 16),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Metformine', style: Theme.of(context).textTheme.titleLarge),
                          Text('500 mg — 1 fois par jour', style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.severityGreen.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('Actif', style: TextStyle(color: AppTheme.severityGreen, fontSize: 12)),
                          ),
                        ],
                      )),
                    ]),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Informations', style: Theme.of(context).textTheme.titleMedium),
                    const Divider(),
                    _infoRow('Substance active', 'Metformine'),
                    _infoRow('Code ATC', 'A10BA02'),
                    _infoRow('Condition alimentaire', 'Avec le repas'),
                    _infoRow('Début', '01/01/2026'),
                    _infoRow('Fin', 'Non définie'),
                    _infoRow('Prescripteur', 'Dr. Martin'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Adherence for this medication
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Adhérence (30 jours)', style: Theme.of(context).textTheme.titleMedium),
                    const Divider(),
                    _infoRow('Prises confirmées', '27/30'),
                    _infoRow('Taux d\'adhérence', '90%'),
                    _infoRow('Doses manquées', '3'),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: 0.9,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: const AlwaysStoppedAnimation(AppTheme.severityGreen),
                      minHeight: 8,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Interaction check button
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.warning_amber),
              label: const Text('Vérifier les interactions'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
