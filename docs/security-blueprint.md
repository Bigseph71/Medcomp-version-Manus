# MedCom — Blueprint de Sécurité

**Auteur** : Manus AI  
**Version** : 1.0.0  
**Date** : 27 février 2026

---

## 1. Principes fondamentaux

La sécurité de MedCom repose sur le principe de **Privacy-by-Design** tel que défini par le RGPD. Chaque composant du système est conçu avec la protection des données de santé comme exigence primaire, et non comme une fonctionnalité ajoutée après coup. Le système traite des données de santé classifiées comme "données sensibles" au sens de l'article 9 du RGPD, ce qui impose des mesures de protection renforcées.

---

## 2. Chiffrement

### 2.1 Chiffrement en transit

Toutes les communications entre le client mobile et le backend transitent via TLS 1.3 exclusivement. Les protocoles TLS 1.0, 1.1 et 1.2 sont désactivés. Le reverse proxy Nginx est configuré pour n'accepter que les cipher suites les plus robustes, avec HSTS activé et une durée de 1 an.

### 2.2 Chiffrement au repos

La base de données PostgreSQL utilise le chiffrement transparent (TDE) fourni par AWS RDS. Les sauvegardes sont chiffrées avec AES-256. Les fichiers stockés sur S3 (ordonnances, rapports) utilisent le chiffrement côté serveur SSE-S3.

### 2.3 Chiffrement applicatif

Les données de santé particulièrement sensibles (résultats d'interactions, historique de doses) sont chiffrées au niveau applicatif avec AES-256-GCM avant stockage en base de données. La clé de chiffrement est stockée dans AWS Secrets Manager et rotée tous les 90 jours.

| Donnée | Chiffrement transit | Chiffrement repos | Chiffrement applicatif |
|---|---|---|---|
| Identifiants utilisateur | TLS 1.3 | RDS TDE | Non |
| Données de profil | TLS 1.3 | RDS TDE | Non |
| Résultats d'interactions | TLS 1.3 | RDS TDE | AES-256-GCM |
| Historique de doses | TLS 1.3 | RDS TDE | AES-256-GCM |
| Données de localisation | TLS 1.3 | RDS TDE | AES-256-GCM |
| Ordonnances (fichiers) | TLS 1.3 | S3 SSE | Non |
| Logs d'audit | TLS 1.3 | RDS TDE | Non |

---

## 3. Authentification et autorisation

### 3.1 Authentification

Le système d'authentification utilise JWT avec rotation de tokens. Le jeton d'accès a une durée de vie courte (15 minutes) pour limiter l'impact d'une compromission. Le jeton de rafraîchissement est valide 7 jours et stocké de manière sécurisée côté client (Keychain iOS / Encrypted SharedPreferences Android).

L'authentification biométrique (FaceID / empreinte digitale) est supportée comme méthode secondaire, utilisant les APIs natives du système d'exploitation pour le stockage sécurisé des clés.

### 3.2 Contrôle d'accès basé sur les rôles (RBAC)

Le système implémente un modèle RBAC à quatre rôles avec des permissions granulaires.

| Rôle | Permissions |
|---|---|
| Patient | Gérer ses propres médicaments, doses, interactions, configuration alive |
| Caregiver | Consulter les données des patients associés (lecture seule), recevoir des alertes |
| Admin | Gestion des utilisateurs, consultation des logs d'audit, gestion des incidents |
| System | Opérations automatisées (escalation, notifications, calculs d'adhérence) |

Chaque endpoint de l'API est protégé par un guard de rôle qui vérifie que l'utilisateur authentifié dispose des permissions nécessaires. Les tentatives d'accès non autorisé sont journalisées dans les logs d'audit.

---

## 4. Conformité RGPD

### 4.1 Consentement

Le système collecte et enregistre le consentement explicite de l'utilisateur pour chaque catégorie de traitement de données. Le consentement est horodaté, versionné et révocable à tout moment. Les catégories de consentement sont : le traitement des données de santé, les notifications push, le partage de données avec les soignants, et la géolocalisation.

### 4.2 Droits des personnes concernées

Le système implémente les droits suivants conformément aux articles 15 à 22 du RGPD.

| Droit | Implémentation | Délai |
|---|---|---|
| Droit d'accès (Art. 15) | Export complet des données en JSON | < 30 jours |
| Droit de rectification (Art. 16) | Modification du profil via l'API | Immédiat |
| Droit à l'effacement (Art. 17) | Suppression complète du compte et des données | < 30 jours |
| Droit à la portabilité (Art. 20) | Export en format structuré (JSON) | < 30 jours |
| Droit d'opposition (Art. 21) | Désactivation des traitements non essentiels | Immédiat |

### 4.3 Minimisation des données

Le système ne collecte que les données strictement nécessaires au fonctionnement de chaque module. Les données de géolocalisation ne sont collectées que lors de l'escalation de la confirmation de vie, et uniquement si l'utilisateur a donné son consentement explicite. Les données sont automatiquement anonymisées ou supprimées après la période de rétention définie.

---

## 5. Conformité MDR (Medical Device Regulation)

### 5.1 Préparation SaMD

Le système est conçu pour faciliter une future classification comme Software as Medical Device (SaMD) selon le règlement européen MDR 2017/745. Les éléments suivants sont intégrés dès la conception.

**Traçabilité complète** : Chaque décision du moteur d'interactions est enregistrée avec les règles appliquées, les sources consultées, le score de confiance et l'horodatage. Cette traçabilité permet une vérification a posteriori de toute décision du système.

**Gestion des incidents** : Le module d'audit inclut un système de signalement et de suivi des incidents conformément à l'article 87 du MDR. Chaque incident est classifié par sévérité, documenté et suivi jusqu'à résolution.

**Documentation de gestion des risques** : La structure du code et de la documentation est organisée pour faciliter la production des documents requis par la norme ISO 14971 (gestion des risques des dispositifs médicaux).

### 5.2 Avertissements médicaux

Le système affiche systématiquement un avertissement indiquant qu'il ne remplace pas un avis médical professionnel. Le moteur d'interactions ne fournit jamais de conseil de modification de dosage ou de prescription. Toute sortie du système est accompagnée de ses sources et de son score de confiance.

---

## 6. Audit et journalisation

### 6.1 Événements journalisés

Tous les événements suivants sont enregistrés dans la table `audit_logs` avec horodatage, identifiant utilisateur, adresse IP, user agent et détails de l'action.

| Catégorie | Événements |
|---|---|
| Authentification | Login, logout, échec de login, changement de mot de passe, activation 2FA |
| Médicaments | Ajout, modification, suppression de médicament |
| Interactions | Vérification d'interactions, consultation de résultats |
| Doses | Confirmation, report, dose manquée |
| Alive | Confirmation, timeout, escalation (chaque étape) |
| Soignant | Invitation, acceptation, consultation de données patient |
| Administration | Modification de configuration, consultation de logs |
| Données personnelles | Export, suppression de compte |

### 6.2 Rétention des logs

Les logs d'audit sont conservés pendant 10 ans conformément aux exigences de traçabilité médicale. Les logs sont archivés mensuellement vers un stockage froid (S3 Glacier) après 1 an. L'intégrité des logs est vérifiée par des checksums SHA-256.
