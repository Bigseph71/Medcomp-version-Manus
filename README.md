# MedCom — AI-Powered Medication Safety & Senior Protection Platform

**Version** : 1.0.0  
**Date** : 27 février 2026  
**Auteur** : Manus AI

---

## Vue d'ensemble

MedCom est une plateforme mobile de santé de grade médical combinant trois modules complémentaires : un moteur d'intelligence médicamenteuse pour la détection d'interactions, un pilulier intelligent avec suivi d'adhérence, et un système de confirmation de vie pour la protection des seniors. Le système est conçu pour être sécurisé, scalable, conforme au RGPD et préparé pour la réglementation MDR européenne.

---

## Architecture technique

| Composant | Technologie | Description |
|---|---|---|
| Application mobile | Flutter 3.22+ | Codebase unique Android & iOS |
| Backend API | NestJS (Node.js 20) | API RESTful microservices-ready |
| Base de données | PostgreSQL 16 | Chiffrée au repos, schéma santé isolé |
| Cache | Redis 7 | Sessions, rate limiting, cache applicatif |
| Reverse Proxy | Nginx 1.25 | TLS 1.3, rate limiting, headers sécurité |
| Conteneurisation | Docker + Docker Compose | Déploiement reproductible |
| CI/CD | GitHub Actions | Tests automatisés, build, déploiement |

---

## Modules

### Module 1 — Drug Intelligence Engine
Moteur hybride à deux couches pour la détection d'interactions médicamenteuses :
- **Layer 1** : Moteur de règles déterministe avec scoring de sévérité (vert/jaune/rouge)
- **Layer 2** : Moteur d'explication RAG basé sur l'IA (extensible)
- Sortie JSON structurée avec explication clinique, explication patient, recommandation et sources
- Compatible EMA, ANSM, FDA

### Module 2 — Smart Pillbox System
Pilulier intelligent avec suivi complet de l'adhérence :
- Ajout de médicaments (recherche, code-barres, manuel)
- Rappels push avec snooze intelligent et escalation
- Statistiques d'adhérence (quotidien, hebdomadaire, mensuel)
- Rapports exportables en PDF

### Module 3 — Senior Alive Confirmation
Système de confirmation de vie avec workflow d'escalation à 5 niveaux :
- Bouton "Je vais bien" avec interface Senior Mode (WCAG 2.1 AA)
- Escalation : Push → SMS → Appel → GPS → Urgence
- Contacts d'urgence hiérarchisés
- Détection batterie faible et mode hors-ligne

---

## Structure du projet

```
medcom/
├── backend/                          # Backend NestJS
│   ├── Dockerfile                    # Image Docker multi-stage
│   ├── package.json                  # Dépendances Node.js
│   ├── tsconfig.json                 # Configuration TypeScript
│   ├── nest-cli.json                 # Configuration NestJS
│   ├── .env.example                  # Variables d'environnement
│   └── src/
│       ├── main.ts                   # Point d'entrée
│       ├── app.module.ts             # Module racine
│       ├── config/                   # Configuration (app, database, jwt)
│       ├── database/                 # Module TypeORM
│       ├── auth/                     # Authentification (JWT, RBAC, biométrique)
│       ├── drug-intelligence/        # Moteur d'interactions médicamenteuses
│       │   ├── rule-engine.service   # Layer 1 — Règles déterministes
│       │   └── entities/             # Drug, DrugInteraction, InteractionCheck
│       ├── pillbox/                  # Pilulier intelligent
│       │   └── entities/             # PatientMedication, DoseLog, AdherenceStat
│       ├── alive-confirmation/       # Confirmation de vie seniors
│       │   └── entities/             # AliveConfiguration, AliveCheck, EmergencyContact
│       ├── notification/             # Service de notifications (push, SMS, appel)
│       ├── caregiver/                # Module soignant
│       └── audit/                    # Audit et conformité MDR
│
├── flutter/                          # Application mobile Flutter
│   ├── pubspec.yaml                  # Dépendances Dart
│   └── lib/
│       ├── main.dart                 # Point d'entrée
│       ├── config/                   # Configuration et routeur
│       ├── core/
│       │   ├── theme/                # Thème (Senior Mode, Dark Mode, WCAG)
│       │   ├── services/             # API, Auth, Storage, Notifications
│       │   ├── models/               # Modèles de données
│       │   └── widgets/              # Navigation shell
│       └── features/
│           ├── auth/                 # Écrans login et inscription
│           ├── pillbox/              # Pilulier, ajout médicament, détail
│           ├── drug_interaction/     # Vérification et résultats d'interactions
│           ├── alive_confirmation/   # Bouton alive, historique, contacts urgence
│           ├── caregiver/            # Tableau de bord soignant
│           └── settings/             # Réglages et RGPD
│
├── database/                         # Scripts SQL
│   ├── 001_schema.sql                # Schéma complet PostgreSQL
│   └── 002_seed_data.sql             # Données de seed (médicaments, interactions)
│
├── infrastructure/                   # Infrastructure
│   ├── nginx/
│   │   └── nginx.conf                # Configuration Nginx (TLS 1.3, rate limiting)
│   └── scripts/
│       └── deploy.sh                 # Script de déploiement automatisé
│
├── .github/workflows/
│   └── ci-cd.yml                     # Pipeline CI/CD GitHub Actions
│
├── docs/                             # Documentation complète
│   ├── api-documentation.md          # Documentation API OpenAPI
│   ├── deployment-guide.md           # Guide de déploiement
│   ├── testing-strategy.md           # Stratégie de test
│   ├── scalability-architecture.md   # Architecture de scalabilité
│   └── security-blueprint.md         # Blueprint de sécurité
│
├── docker-compose.yml                # Orchestration Docker
├── .env.example                      # Variables d'environnement
├── .gitignore                        # Fichiers ignorés par Git
└── README.md                         # Ce fichier
```

---

## Démarrage rapide

### Prérequis
- Docker 24.0+ et Docker Compose 2.20+
- (Optionnel) Node.js 20 LTS pour le développement local
- (Optionnel) Flutter 3.22+ pour le développement mobile

### Lancement avec Docker

```bash
# 1. Cloner le projet
git clone https://github.com/your-org/medcom.git && cd medcom

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Lancer tous les services
docker compose up -d

# 4. Vérifier le statut
docker compose ps

# 5. Accéder à l'API
curl http://localhost:3000/api/health
```

### Développement local (Backend)

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### Développement local (Flutter)

```bash
cd flutter
flutter pub get
flutter run
```

---

## Sécurité

- Chiffrement AES-256 au repos et TLS 1.3 en transit
- Authentification JWT avec rotation de tokens (15min / 7j)
- RBAC à 4 rôles (Patient, Caregiver, Admin, System)
- Conformité RGPD complète (consentement, export, suppression)
- Audit trail complet pour conformité MDR
- Rate limiting différencié par type d'endpoint

---

## Documentation

| Document | Description |
|---|---|
| [Documentation API](docs/api-documentation.md) | Endpoints, formats, authentification |
| [Guide de déploiement](docs/deployment-guide.md) | Installation, configuration, mise en production |
| [Stratégie de test](docs/testing-strategy.md) | Tests unitaires, intégration, E2E, sécurité |
| [Architecture de scalabilité](docs/scalability-architecture.md) | Paliers de croissance, optimisations, HA |
| [Blueprint de sécurité](docs/security-blueprint.md) | Chiffrement, RGPD, MDR, audit |

---

## Licence

Propriétaire — Tous droits réservés.
