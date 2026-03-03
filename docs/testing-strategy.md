# MedCom — Stratégie de Test

**Auteur** : Manus AI  
**Version** : 1.0.0  
**Date** : 27 février 2026

---

## 1. Philosophie de test

La stratégie de test de MedCom repose sur le principe fondamental que tout système médical doit garantir un niveau de fiabilité supérieur aux applications grand public. Chaque composant critique — en particulier le moteur d'interactions médicamenteuses et le système de confirmation de vie — doit être couvert par des tests automatisés exhaustifs, vérifiables et reproductibles.

L'approche adoptée suit la pyramide de test classique, avec une emphase particulière sur les tests unitaires du moteur de règles pharmacologiques et les tests d'intégration du workflow d'escalation. La couverture de code minimale cible est de 80% pour l'ensemble du backend, avec un objectif de 95% pour les modules critiques (Drug Intelligence et Alive Confirmation).

---

## 2. Niveaux de test

### 2.1 Tests unitaires

Les tests unitaires constituent la base de la pyramide de test. Ils vérifient le comportement isolé de chaque service, garde, stratégie et utilitaire.

| Module | Cible de couverture | Priorité | Framework |
|---|---|---|---|
| Rule Engine (Drug Intelligence) | 95% | Critique | Jest |
| Auth Service | 90% | Haute | Jest |
| Pillbox Service | 85% | Haute | Jest |
| Alive Confirmation Service | 95% | Critique | Jest |
| Notification Service | 85% | Haute | Jest |
| Audit Service | 80% | Moyenne | Jest |

**Exemples de cas de test critiques pour le moteur de règles** :

Le moteur de règles déterministe doit être testé avec un ensemble exhaustif de combinaisons médicamenteuses connues. Chaque interaction documentée dans la base de données de seed doit avoir un test unitaire correspondant qui vérifie la sévérité retournée, l'explication clinique et le score de confiance. Les cas limites incluent les vérifications avec un seul médicament (aucune interaction attendue), les combinaisons de plus de 10 médicaments simultanés, les médicaments inconnus de la base et les contextes patients avec des valeurs extrêmes (eGFR très bas, âge très élevé).

**Exemples de cas de test pour le workflow d'escalation** :

Le système de confirmation de vie doit être testé pour chaque étape du workflow d'escalation. Les tests doivent vérifier que chaque étape se déclenche au bon moment, que les notifications sont envoyées aux bons contacts dans le bon ordre de priorité, et que le système gère correctement les cas de confirmation tardive (confirmation reçue pendant l'escalation).

### 2.2 Tests d'intégration

Les tests d'intégration vérifient le fonctionnement correct des interactions entre les modules et avec la base de données.

| Scénario | Description | Modules impliqués |
|---|---|---|
| Flux d'inscription complet | Inscription → Login → Profil | Auth, Database |
| Ajout de médicament avec vérification | Ajout → Interaction check automatique | Pillbox, Drug Intelligence |
| Confirmation de dose avec adhérence | Confirmer dose → Calcul adhérence | Pillbox, Adherence |
| Escalation complète | Timeout → Push → SMS → Call → GPS | Alive, Notification |
| Supervision soignant | Invitation → Acceptation → Dashboard | Caregiver, Auth |
| Audit trail complet | Action → Log → Consultation | Tous modules, Audit |

Les tests d'intégration utilisent une base de données PostgreSQL de test dédiée, initialisée avant chaque suite de tests et nettoyée après. Le framework utilisé est Supertest avec Jest pour les tests HTTP end-to-end.

### 2.3 Tests end-to-end (E2E)

Les tests E2E simulent des parcours utilisateur complets depuis l'application mobile jusqu'à la base de données et retour.

**Parcours critiques à tester** :

Le premier parcours est celui du patient polymédicamenté : inscription, ajout de 5 médicaments, vérification automatique des interactions, configuration des rappels, confirmation de 3 doses, consultation des statistiques d'adhérence. Le deuxième parcours est celui du senior vivant seul : activation de la confirmation de vie, configuration des contacts d'urgence, simulation d'un timeout, vérification de l'escalation complète. Le troisième parcours est celui du soignant : inscription en tant que soignant, invitation d'un patient, consultation du tableau de bord, export d'un rapport.

### 2.4 Tests de sécurité

Les tests de sécurité vérifient la robustesse du système contre les attaques courantes et la conformité avec les exigences de sécurité.

| Test | Description | Outil |
|---|---|---|
| Injection SQL | Tentatives d'injection sur tous les endpoints | SQLMap |
| XSS | Injection de scripts dans les champs texte | OWASP ZAP |
| Authentification | Brute force, token manipulation, session fixation | Custom scripts |
| RBAC | Accès non autorisé entre rôles | Jest + Supertest |
| Rate limiting | Vérification des limites de requêtes | Artillery |
| Chiffrement | Vérification AES-256 et TLS 1.3 | OpenSSL, testssl.sh |
| GDPR | Vérification export/suppression données | Custom scripts |

### 2.5 Tests de performance

Les tests de performance vérifient que le système respecte les exigences non fonctionnelles définies dans la spécification.

| Métrique | Objectif | Outil |
|---|---|---|
| Latence API (P95) | < 300ms | Artillery |
| Latence interaction check (P95) | < 500ms | Artillery |
| Débit concurrent | 1000 requêtes/seconde | k6 |
| Temps de réponse sous charge | < 500ms à 80% de capacité | k6 |
| Montée en charge | 100 → 10 000 utilisateurs simultanés | k6 |

### 2.6 Tests de régression pharmacologique

Ces tests sont spécifiques au domaine médical et vérifient que les mises à jour du moteur de règles ne dégradent pas la détection d'interactions connues.

La suite de régression comprend un ensemble de 200+ combinaisons médicamenteuses documentées avec leurs interactions attendues. Chaque mise à jour de la base de données pharmacologique ou du moteur de règles déclenche automatiquement cette suite de régression dans le pipeline CI/CD. Tout échec bloque le déploiement.

---

## 3. Automatisation et CI/CD

### 3.1 Pipeline de test

Le pipeline CI/CD exécute les tests dans l'ordre suivant à chaque push sur les branches `main` et `develop` :

L'étape de lint vérifie la conformité du code avec les règles ESLint et Prettier. Les tests unitaires s'exécutent ensuite en parallèle pour chaque module. Les tests d'intégration utilisent une base de données PostgreSQL éphémère provisionnée par le service GitHub Actions. L'audit de sécurité des dépendances est effectué via `npm audit` et Trivy. Enfin, les tests E2E s'exécutent sur un environnement complet Docker Compose.

### 3.2 Critères de qualité (Quality Gates)

| Critère | Seuil | Action si non respecté |
|---|---|---|
| Couverture de code globale | ≥ 80% | Blocage du merge |
| Couverture modules critiques | ≥ 95% | Blocage du merge |
| Tests unitaires | 100% passants | Blocage du merge |
| Tests d'intégration | 100% passants | Blocage du merge |
| Vulnérabilités critiques | 0 | Blocage du déploiement |
| Régression pharmacologique | 100% passants | Blocage du déploiement |
| Latence P95 | < 300ms | Alerte |

---

## 4. Tests Flutter (Mobile)

### 4.1 Structure des tests

| Type | Cible | Framework |
|---|---|---|
| Tests unitaires | Services, modèles, providers | flutter_test |
| Tests de widgets | Écrans individuels, composants UI | flutter_test |
| Tests d'intégration | Parcours utilisateur complets | integration_test |
| Tests d'accessibilité | Conformité WCAG 2.1 AA | flutter_test + semantics |
| Tests de golden | Régression visuelle | golden_toolkit |

### 4.2 Tests d'accessibilité

Chaque écran doit passer les vérifications d'accessibilité suivantes : ratio de contraste minimum de 4.5:1 pour le texte normal et 3:1 pour le texte large, taille de cible tactile minimum de 48x48 dp, labels sémantiques pour tous les éléments interactifs, support complet du lecteur d'écran (TalkBack / VoiceOver), et navigation au clavier fonctionnelle.

Le mode Senior doit être testé séparément avec des critères renforcés : taille de police minimum de 18sp, boutons de minimum 56x56 dp, et contraste minimum de 7:1.
