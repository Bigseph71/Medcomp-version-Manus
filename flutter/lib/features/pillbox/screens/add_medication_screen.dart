import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class AddMedicationScreen extends StatefulWidget {
  const AddMedicationScreen({super.key});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Form data
  String _addMethod = 'search'; // search, barcode, manual
  final _drugNameController = TextEditingController();
  final _dosageController = TextEditingController();
  String _dosageUnit = 'mg';
  String _frequency = 'daily';
  String _foodCondition = 'no_restriction';
  DateTime _startDate = DateTime.now();
  DateTime? _endDate;
  final List<TimeOfDay> _reminderTimes = [const TimeOfDay(hour: 8, minute: 0)];
  final _prescriberController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajouter un médicament')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 3) {
            setState(() => _currentStep++);
          } else {
            _saveMedication();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) setState(() => _currentStep--);
        },
        steps: [
          // Step 1: Drug Selection
          Step(
            title: const Text('Médicament'),
            subtitle: const Text('Rechercher ou saisir manuellement'),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            content: _buildDrugSelectionStep(),
          ),

          // Step 2: Dosage & Frequency
          Step(
            title: const Text('Posologie'),
            subtitle: const Text('Dosage et fréquence'),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            content: _buildDosageStep(),
          ),

          // Step 3: Schedule
          Step(
            title: const Text('Horaires'),
            subtitle: const Text('Rappels et durée'),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            content: _buildScheduleStep(),
          ),

          // Step 4: Additional Info
          Step(
            title: const Text('Informations'),
            subtitle: const Text('Prescripteur et notes'),
            isActive: _currentStep >= 3,
            content: _buildInfoStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildDrugSelectionStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Add method selector
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'search', label: Text('Recherche'), icon: Icon(Icons.search)),
            ButtonSegment(value: 'barcode', label: Text('Code-barres'), icon: Icon(Icons.qr_code_scanner)),
            ButtonSegment(value: 'manual', label: Text('Manuel'), icon: Icon(Icons.edit)),
          ],
          selected: {_addMethod},
          onSelectionChanged: (v) => setState(() => _addMethod = v.first),
        ),
        const SizedBox(height: 16),

        if (_addMethod == 'search') ...[
          TextFormField(
            controller: _drugNameController,
            decoration: const InputDecoration(
              labelText: 'Rechercher un médicament',
              prefixIcon: Icon(Icons.search),
              hintText: 'Nom, substance active ou code ATC',
            ),
          ),
          const SizedBox(height: 8),
          // Search results would appear here
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('Tapez pour rechercher dans la base de données de médicaments'),
          ),
        ],

        if (_addMethod == 'barcode') ...[
          ElevatedButton.icon(
            onPressed: () {}, // Launch barcode scanner
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Scanner le code-barres'),
          ),
        ],

        if (_addMethod == 'manual') ...[
          TextFormField(
            controller: _drugNameController,
            decoration: const InputDecoration(
              labelText: 'Nom du médicament',
              prefixIcon: Icon(Icons.medication),
            ),
            validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
          ),
        ],
      ],
    );
  }

  Widget _buildDosageStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(children: [
          Expanded(
            flex: 2,
            child: TextFormField(
              controller: _dosageController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Dosage'),
              validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: DropdownButtonFormField<String>(
              value: _dosageUnit,
              decoration: const InputDecoration(labelText: 'Unité'),
              items: const [
                DropdownMenuItem(value: 'mg', child: Text('mg')),
                DropdownMenuItem(value: 'g', child: Text('g')),
                DropdownMenuItem(value: 'ml', child: Text('ml')),
                DropdownMenuItem(value: 'UI', child: Text('UI')),
                DropdownMenuItem(value: 'comprimé', child: Text('cp')),
                DropdownMenuItem(value: 'gouttes', child: Text('gttes')),
              ],
              onChanged: (v) => setState(() => _dosageUnit = v ?? 'mg'),
            ),
          ),
        ]),
        const SizedBox(height: 16),

        DropdownButtonFormField<String>(
          value: _frequency,
          decoration: const InputDecoration(labelText: 'Fréquence', prefixIcon: Icon(Icons.repeat)),
          items: const [
            DropdownMenuItem(value: 'daily', child: Text('1 fois par jour')),
            DropdownMenuItem(value: 'twice_daily', child: Text('2 fois par jour')),
            DropdownMenuItem(value: 'three_times_daily', child: Text('3 fois par jour')),
            DropdownMenuItem(value: 'weekly', child: Text('1 fois par semaine')),
            DropdownMenuItem(value: 'as_needed', child: Text('Si besoin')),
            DropdownMenuItem(value: 'custom', child: Text('Personnalisé')),
          ],
          onChanged: (v) => setState(() => _frequency = v ?? 'daily'),
        ),
        const SizedBox(height: 16),

        DropdownButtonFormField<String>(
          value: _foodCondition,
          decoration: const InputDecoration(labelText: 'Condition alimentaire', prefixIcon: Icon(Icons.restaurant)),
          items: const [
            DropdownMenuItem(value: 'no_restriction', child: Text('Pas de restriction')),
            DropdownMenuItem(value: 'before_meal', child: Text('Avant le repas')),
            DropdownMenuItem(value: 'with_meal', child: Text('Pendant le repas')),
            DropdownMenuItem(value: 'after_meal', child: Text('Après le repas')),
            DropdownMenuItem(value: 'empty_stomach', child: Text('À jeun')),
          ],
          onChanged: (v) => setState(() => _foodCondition = v ?? 'no_restriction'),
        ),
      ],
    );
  }

  Widget _buildScheduleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Reminder times
        Text('Heures de rappel', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        ..._reminderTimes.asMap().entries.map((entry) {
          return ListTile(
            leading: const Icon(Icons.alarm),
            title: Text('${entry.value.hour.toString().padLeft(2, '0')}:${entry.value.minute.toString().padLeft(2, '0')}'),
            trailing: IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: () => setState(() => _reminderTimes.removeAt(entry.key)),
            ),
            onTap: () async {
              final time = await showTimePicker(context: context, initialTime: entry.value);
              if (time != null) setState(() => _reminderTimes[entry.key] = time);
            },
          );
        }),
        TextButton.icon(
          onPressed: () async {
            final time = await showTimePicker(context: context, initialTime: const TimeOfDay(hour: 12, minute: 0));
            if (time != null) setState(() => _reminderTimes.add(time));
          },
          icon: const Icon(Icons.add),
          label: const Text('Ajouter un horaire'),
        ),
        const SizedBox(height: 16),

        // Duration
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.date_range),
          title: Text('Début: ${_startDate.day}/${_startDate.month}/${_startDate.year}'),
          onTap: () async {
            final date = await showDatePicker(context: context, initialDate: _startDate, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
            if (date != null) setState(() => _startDate = date);
          },
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.date_range),
          title: Text(_endDate != null ? 'Fin: ${_endDate!.day}/${_endDate!.month}/${_endDate!.year}' : 'Date de fin (optionnel)'),
          onTap: () async {
            final date = await showDatePicker(context: context, initialDate: _startDate, firstDate: _startDate, lastDate: DateTime.now().add(const Duration(days: 730)));
            if (date != null) setState(() => _endDate = date);
          },
        ),
      ],
    );
  }

  Widget _buildInfoStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _prescriberController,
          decoration: const InputDecoration(labelText: 'Médecin prescripteur (optionnel)', prefixIcon: Icon(Icons.medical_services_outlined)),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _notesController,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Notes (optionnel)', prefixIcon: Icon(Icons.note_outlined)),
        ),
        const SizedBox(height: 16),

        // Upload prescription
        OutlinedButton.icon(
          onPressed: () {}, // Launch image picker
          icon: const Icon(Icons.upload_file),
          label: const Text('Joindre une ordonnance (OCR-ready)'),
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
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: Colors.amber),
              SizedBox(width: 8),
              Expanded(child: Text(
                'Cet outil ne remplace pas un avis médical professionnel.',
                style: TextStyle(fontSize: 12),
              )),
            ],
          ),
        ),
      ],
    );
  }

  void _saveMedication() {
    // In production: call pillboxService.addMedication(...)
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Médicament ajouté avec succès')),
    );
    context.go('/pillbox');
  }
}
