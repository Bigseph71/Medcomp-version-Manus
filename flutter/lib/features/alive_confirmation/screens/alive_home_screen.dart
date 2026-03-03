import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

/// Senior Alive Confirmation Screen
/// WCAG 2.1 AA compliant — Large central button, high contrast, minimal navigation
class AliveHomeScreen extends StatefulWidget {
  const AliveHomeScreen({super.key});

  @override
  State<AliveHomeScreen> createState() => _AliveHomeScreenState();
}

class _AliveHomeScreenState extends State<AliveHomeScreen> with SingleTickerProviderStateMixin {
  bool _isConfirming = false;
  bool _isConfirmed = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _confirmAlive() async {
    setState(() => _isConfirming = true);

    // Haptic feedback
    HapticFeedback.heavyImpact();

    try {
      // In production: call aliveService.confirmAlive(...)
      await Future.delayed(const Duration(seconds: 1));

      setState(() {
        _isConfirming = false;
        _isConfirmed = true;
      });

      // Voice confirmation feedback
      // In production: use TTS to say "Confirmation enregistrée"

      // Reset after 5 seconds
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) setState(() => _isConfirmed = false);
      });
    } catch (e) {
      setState(() => _isConfirming = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur de confirmation. Réessayez.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bien-être'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => context.go('/alive/history'),
            tooltip: 'Historique',
          ),
          IconButton(
            icon: const Icon(Icons.contacts),
            onPressed: () => context.go('/alive/contacts'),
            tooltip: 'Contacts d\'urgence',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Status info
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(
                        _isConfirmed ? Icons.check_circle : Icons.schedule,
                        color: _isConfirmed ? AppTheme.aliveConfirmed : AppTheme.alivePending,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isConfirmed ? 'Confirmé' : 'En attente de confirmation',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: _isConfirmed ? AppTheme.aliveConfirmed : null,
                            ),
                          ),
                          Text(
                            _isConfirmed
                                ? 'Dernière confirmation: maintenant'
                                : 'Prochaine vérification dans 23h',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      )),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Battery & network status
              Row(
                children: [
                  Expanded(child: _statusChip(Icons.battery_std, '85%', Colors.green)),
                  const SizedBox(width: 8),
                  Expanded(child: _statusChip(Icons.wifi, 'Connecté', Colors.green)),
                  const SizedBox(width: 8),
                  Expanded(child: _statusChip(Icons.location_on, 'Actif', Colors.green)),
                ],
              ),

              // Central "I am OK" button
              const Spacer(),
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _isConfirmed ? 1.0 : _pulseAnimation.value,
                    child: child,
                  );
                },
                child: GestureDetector(
                  onTap: _isConfirming ? null : _confirmAlive,
                  child: Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isConfirmed ? AppTheme.aliveConfirmed : AppTheme.primaryColor,
                      boxShadow: [
                        BoxShadow(
                          color: (_isConfirmed ? AppTheme.aliveConfirmed : AppTheme.primaryColor).withOpacity(0.4),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Center(
                      child: _isConfirming
                          ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 4)
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _isConfirmed ? Icons.check : Icons.favorite,
                                  color: Colors.white,
                                  size: 64,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _isConfirmed ? 'Confirmé !' : 'Je vais bien',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                ),
              ),
              const Spacer(),

              // Help text
              Text(
                'Appuyez sur le bouton pour confirmer que vous allez bien',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Emergency call button
              OutlinedButton.icon(
                onPressed: () {}, // Emergency call
                icon: const Icon(Icons.phone, color: AppTheme.severityRed),
                label: const Text('Appel d\'urgence', style: TextStyle(color: AppTheme.severityRed)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.severityRed),
                  minimumSize: const Size(double.infinity, 52),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

/// Simplified AnimatedBuilder (Flutter's AnimatedBuilder)
class AnimatedBuilder extends AnimatedWidget {
  final Widget Function(BuildContext, Widget?) builder;
  final Widget? child;

  const AnimatedBuilder({
    super.key,
    required Animation<double> animation,
    required this.builder,
    this.child,
  }) : super(listenable: animation);

  @override
  Widget build(BuildContext context) => builder(context, child);
}
