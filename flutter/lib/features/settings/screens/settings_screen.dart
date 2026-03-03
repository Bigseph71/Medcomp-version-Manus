import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _seniorMode = false;
  bool _biometricAuth = true;
  bool _darkMode = false;
  bool _aliveEnabled = true;
  int _aliveInterval = 24;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Réglages')),
      body: ListView(
        children: [
          // Profile section
          _sectionHeader('Profil'),
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: const Text('Jean Dupont'),
            subtitle: const Text('jean.dupont@email.com'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          const Divider(),

          // Accessibility
          _sectionHeader('Accessibilité'),
          SwitchListTile(
            title: const Text('Mode Senior'),
            subtitle: const Text('Texte plus grand, boutons plus larges, navigation simplifiée'),
            value: _seniorMode,
            onChanged: (v) => setState(() => _seniorMode = v),
            secondary: const Icon(Icons.accessibility_new),
          ),
          SwitchListTile(
            title: const Text('Mode sombre'),
            subtitle: const Text('Réduire la fatigue oculaire'),
            value: _darkMode,
            onChanged: (v) => setState(() => _darkMode = v),
            secondary: const Icon(Icons.dark_mode),
          ),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Langue'),
            subtitle: const Text('Français'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          const Divider(),

          // Security
          _sectionHeader('Sécurité'),
          SwitchListTile(
            title: const Text('Authentification biométrique'),
            subtitle: const Text('FaceID / Empreinte digitale'),
            value: _biometricAuth,
            onChanged: (v) => setState(() => _biometricAuth = v),
            secondary: const Icon(Icons.fingerprint),
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Changer le mot de passe'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.security),
            title: const Text('Authentification à deux facteurs'),
            subtitle: const Text('Non activée'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          const Divider(),

          // Alive Confirmation
          _sectionHeader('Confirmation de bien-être'),
          SwitchListTile(
            title: const Text('Activer la confirmation'),
            value: _aliveEnabled,
            onChanged: (v) => setState(() => _aliveEnabled = v),
            secondary: const Icon(Icons.favorite),
          ),
          ListTile(
            leading: const Icon(Icons.timer),
            title: const Text('Intervalle de vérification'),
            subtitle: Text('Toutes les $_aliveInterval heures'),
            trailing: DropdownButton<int>(
              value: _aliveInterval,
              items: [8, 12, 24, 48].map((h) => DropdownMenuItem(value: h, child: Text('${h}h'))).toList(),
              onChanged: (v) => setState(() => _aliveInterval = v ?? 24),
            ),
          ),
          const Divider(),

          // GDPR & Privacy
          _sectionHeader('Confidentialité & RGPD'),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Politique de confidentialité'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Conditions d\'utilisation'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Exporter mes données'),
            subtitle: const Text('Télécharger toutes vos données (RGPD)'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text('Supprimer mon compte', style: TextStyle(color: Colors.red)),
            subtitle: const Text('Suppression définitive de toutes vos données'),
            onTap: () {},
          ),
          const Divider(),

          // About
          _sectionHeader('À propos'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('Version'),
            subtitle: const Text('MedCom v1.0.0 (Build 1)'),
          ),
          ListTile(
            leading: const Icon(Icons.bug_report_outlined),
            title: const Text('Signaler un problème'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
          const SizedBox(height: 24),

          // Logout
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Se déconnecter', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                minimumSize: const Size(double.infinity, 52),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Colors.grey.shade600,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
