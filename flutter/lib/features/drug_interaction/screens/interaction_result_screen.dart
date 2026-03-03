import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class InteractionResultScreen extends StatelessWidget {
  const InteractionResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Résultats')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Summary card
            Card(
              color: AppTheme.severityYellow.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Icon(Icons.warning_amber, size: 48, color: AppTheme.severityYellow),
                    const SizedBox(height: 8),
                    Text('2 interactions détectées', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _severityBadge('0', AppTheme.severityRed, 'Critique'),
                        const SizedBox(width: 16),
                        _severityBadge('1', AppTheme.severityYellow, 'Modérée'),
                        const SizedBox(width: 16),
                        _severityBadge('1', AppTheme.severityGreen, 'Faible'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Interaction cards
            _buildInteractionCard(
              context,
              severity: 'yellow',
              drugA: 'Metformine',
              drugB: 'Amlodipine',
              clinicalExplanation: 'L\'amlodipine peut réduire l\'efficacité de la metformine en augmentant la glycémie.',
              patientExplanation: 'Votre médicament pour le diabète pourrait être moins efficace. Surveillez votre glycémie.',
              recommendation: 'Surveillance glycémique renforcée recommandée. Consultez votre médecin.',
              confidence: 0.87,
              sources: ['EMA SmPC Metformine', 'Thesaurus ANSM 2024'],
            ),
            const SizedBox(height: 12),

            _buildInteractionCard(
              context,
              severity: 'green',
              drugA: 'Oméprazole',
              drugB: 'Atorvastatine',
              clinicalExplanation: 'Interaction mineure via CYP3A4. Augmentation possible des taux d\'atorvastatine.',
              patientExplanation: 'Interaction faible, généralement sans conséquence clinique.',
              recommendation: 'Aucune action requise. Surveillance standard.',
              confidence: 0.92,
              sources: ['FDA Drug Interaction Database'],
            ),
            const SizedBox(height: 24),

            // Disclaimer
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: const Text(
                'AVERTISSEMENT : Ces résultats sont fournis à titre informatif uniquement et ne remplacent pas un avis médical professionnel. Consultez toujours votre médecin ou pharmacien.',
                style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _severityBadge(String count, Color color, String label) {
    return Column(
      children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          child: Center(child: Text(count, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18))),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }

  Widget _buildInteractionCard(
    BuildContext context, {
    required String severity,
    required String drugA,
    required String drugB,
    required String clinicalExplanation,
    required String patientExplanation,
    required String recommendation,
    required double confidence,
    required List<String> sources,
  }) {
    final color = severity == 'red'
        ? AppTheme.severityRed
        : severity == 'yellow'
            ? AppTheme.severityYellow
            : AppTheme.severityGreen;

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: Row(
              children: [
                Icon(
                  severity == 'red' ? Icons.dangerous : severity == 'yellow' ? Icons.warning : Icons.info,
                  color: color,
                ),
                const SizedBox(width: 8),
                Expanded(child: Text(
                  '$drugA + $drugB',
                  style: TextStyle(fontWeight: FontWeight.bold, color: color),
                )),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    severity == 'red' ? 'CRITIQUE' : severity == 'yellow' ? 'MODÉRÉE' : 'FAIBLE',
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Explication clinique', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Colors.black87)),
                const SizedBox(height: 4),
                Text(clinicalExplanation, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 12),

                Text('Pour le patient', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Colors.black87)),
                const SizedBox(height: 4),
                Text(patientExplanation, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 12),

                Text('Recommandation', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Colors.black87)),
                const SizedBox(height: 4),
                Text(recommendation, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                const SizedBox(height: 12),

                // Confidence & Sources
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Confiance: ${(confidence * 100).toInt()}%', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    Text('Sources: ${sources.length}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  ],
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 4,
                  children: sources.map((s) => Chip(
                    label: Text(s, style: const TextStyle(fontSize: 10)),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    visualDensity: VisualDensity.compact,
                  )).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
