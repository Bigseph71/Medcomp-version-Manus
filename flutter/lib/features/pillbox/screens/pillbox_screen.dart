import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class PillboxScreen extends StatefulWidget {
  const PillboxScreen({super.key});

  @override
  State<PillboxScreen> createState() => _PillboxScreenState();
}

class _PillboxScreenState extends State<PillboxScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Pilulier'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: _selectDate,
            tooltip: 'Choisir une date',
          ),
          IconButton(
            icon: const Icon(Icons.bar_chart),
            onPressed: () {}, // Navigate to adherence stats
            tooltip: 'Statistiques d\'adhérence',
          ),
        ],
      ),
      body: Column(
        children: [
          // Date selector strip
          _buildDateStrip(),

          // Adherence summary card
          _buildAdherenceSummary(),

          // Dose list
          Expanded(child: _buildDoseList()),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/pillbox/add'),
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildDateStrip() {
    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        itemCount: 14,
        itemBuilder: (context, index) {
          final date = DateTime.now().subtract(Duration(days: 3 - index));
          final isSelected = date.day == _selectedDate.day &&
              date.month == _selectedDate.month &&
              date.year == _selectedDate.year;
          final isToday = date.day == DateTime.now().day;

          return GestureDetector(
            onTap: () => setState(() => _selectedDate = date),
            child: Container(
              width: 56,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryColor : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: isToday && !isSelected
                    ? Border.all(color: AppTheme.primaryColor, width: 2)
                    : null,
                boxShadow: isSelected
                    ? [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 8)]
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _dayName(date.weekday),
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? Colors.white70 : Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${date.day}',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAdherenceSummary() {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Circular progress
            SizedBox(
              width: 60, height: 60,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(
                    value: 0.75,
                    strokeWidth: 6,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: const AlwaysStoppedAnimation(AppTheme.severityGreen),
                  ),
                  const Center(child: Text('75%', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Adhérence du jour', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text('3 prises sur 4 confirmées', style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoseList() {
    // Placeholder dose data
    final doses = [
      _DoseItem(time: '08:00', name: 'Metformine 500mg', status: 'taken', food: 'Avec le repas'),
      _DoseItem(time: '12:00', name: 'Amlodipine 5mg', status: 'taken', food: 'Sans restriction'),
      _DoseItem(time: '14:00', name: 'Oméprazole 20mg', status: 'taken', food: 'Avant le repas'),
      _DoseItem(time: '20:00', name: 'Atorvastatine 10mg', status: 'pending', food: 'Avec le repas'),
    ];

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: doses.length,
      itemBuilder: (context, index) {
        final dose = doses[index];
        return _buildDoseCard(dose);
      },
    );
  }

  Widget _buildDoseCard(_DoseItem dose) {
    final isTaken = dose.status == 'taken';
    final isMissed = dose.status == 'missed';
    final isPending = dose.status == 'pending';

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            color: isTaken
                ? AppTheme.severityGreen.withOpacity(0.1)
                : isMissed
                    ? AppTheme.severityRed.withOpacity(0.1)
                    : AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            isTaken ? Icons.check_circle : isMissed ? Icons.cancel : Icons.access_time,
            color: isTaken ? AppTheme.severityGreen : isMissed ? AppTheme.severityRed : AppTheme.primaryColor,
          ),
        ),
        title: Text(dose.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(dose.time, style: TextStyle(color: Colors.grey.shade600)),
            Text(dose.food, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
          ],
        ),
        trailing: isPending
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.check, color: AppTheme.severityGreen),
                    onPressed: () {}, // Mark as taken
                    tooltip: 'Pris',
                  ),
                  IconButton(
                    icon: const Icon(Icons.snooze, color: Colors.orange),
                    onPressed: () {}, // Snooze
                    tooltip: 'Reporter',
                  ),
                ],
              )
            : isTaken
                ? const Icon(Icons.check_circle, color: AppTheme.severityGreen)
                : const Icon(Icons.cancel, color: AppTheme.severityRed),
      ),
    );
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  String _dayName(int weekday) {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days[weekday - 1];
  }
}

class _DoseItem {
  final String time;
  final String name;
  final String status;
  final String food;

  _DoseItem({required this.time, required this.name, required this.status, required this.food});
}
