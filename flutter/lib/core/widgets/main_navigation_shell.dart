import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Main navigation shell with bottom navigation bar
class MainNavigationShell extends StatelessWidget {
  final Widget child;

  const MainNavigationShell({super.key, required this.child});

  static const _tabs = [
    _NavTab(icon: Icons.medication_outlined, activeIcon: Icons.medication, label: 'Pilulier', path: '/pillbox'),
    _NavTab(icon: Icons.warning_amber_outlined, activeIcon: Icons.warning_amber, label: 'Interactions', path: '/interactions'),
    _NavTab(icon: Icons.favorite_outline, activeIcon: Icons.favorite, label: 'Bien-être', path: '/alive'),
    _NavTab(icon: Icons.people_outline, activeIcon: Icons.people, label: 'Soignant', path: '/caregiver'),
    _NavTab(icon: Icons.settings_outlined, activeIcon: Icons.settings, label: 'Réglages', path: '/settings'),
  ];

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    for (int i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getCurrentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) => context.go(_tabs[index].path),
        items: _tabs
            .map((tab) => BottomNavigationBarItem(
                  icon: Icon(tab.icon),
                  activeIcon: Icon(tab.activeIcon),
                  label: tab.label,
                ))
            .toList(),
      ),
    );
  }
}

class _NavTab {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;

  const _NavTab({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
  });
}
