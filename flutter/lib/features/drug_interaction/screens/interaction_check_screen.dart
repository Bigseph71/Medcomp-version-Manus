import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class InteractionCheckScreen extends StatefulWidget {
  const InteractionCheckScreen({super.key});

  @override
  State<InteractionCheckScreen> createState() => _InteractionCheckScreenState();
}

class _InteractionCheckScreenState extends State<InteractionCheckScreen> {
  final List<String> _selectedDrugs = [];
  final _searchController = TextEditingController();
  bool _isChecking = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interactions'),
        actions: [
          IconButton(icon: const Icon(Icons.history), onPressed: () {}, tooltip: 'Historique'),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextFormField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Ajouter un médicament',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.qr_code_scanner),
                  onPressed: () {}, // Barcode scanner
                ),
              ),
            ),
          ),

          // Selected drugs
          if (_selectedDrugs.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 8, runSpacing: 8,
                children: _selectedDrugs.map((drug) => Chip(
                  label: Text(drug),
                  deleteIcon: const Icon(Icons.close, size: 18),
                  onDeleted: () => setState(() => _selectedDrugs.remove(drug)),
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                )).toList(),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Patient context (optional)
          ExpansionTile(
            title: const Text('Contexte patient (optionnel)'),
            leading: const Icon(Icons.person_outline),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(children: [
                      Expanded(child: TextFormField(
                        decoration: const InputDecoration(labelText: 'Âge'),
                        keyboardType: TextInputType.number,
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: TextFormField(
                        decoration: const InputDecoration(labelText: 'eGFR (ml/min)'),
                        keyboardType: TextInputType.number,
                      )),
                    ]),
                    const SizedBox(height: 12),
                    TextFormField(
                      decoration: const InputDecoration(labelText: 'Allergies connues'),
                    ),
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: CheckboxListTile(
                        value: false,
                        onChanged: (v) {},
                        title: const Text('Grossesse', style: TextStyle(fontSize: 14)),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      )),
                      Expanded(child: CheckboxListTile(
                        value: false,
                        onChanged: (v) {},
                        title: const Text('Allaitement', style: TextStyle(fontSize: 14)),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      )),
                    ]),
                  ],
                ),
              ),
            ],
          ),

          const Spacer(),

          // Check button
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Disclaimer
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.amber, size: 20),
                      SizedBox(width: 8),
                      Expanded(child: Text(
                        'Cet outil ne remplace pas un avis médical professionnel. Consultez toujours votre médecin.',
                        style: TextStyle(fontSize: 12),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                ElevatedButton.icon(
                  onPressed: _selectedDrugs.length >= 2 && !_isChecking
                      ? _checkInteractions
                      : null,
                  icon: _isChecking
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.search),
                  label: Text(_selectedDrugs.length < 2
                      ? 'Sélectionnez au moins 2 médicaments'
                      : 'Vérifier les interactions'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _checkInteractions() {
    setState(() => _isChecking = true);
    // In production: call drugIntelligenceService.checkInteractions(...)
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isChecking = false);
        // Navigate to results
      }
    });
  }
}
