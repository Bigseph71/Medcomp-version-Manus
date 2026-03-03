# MedCom — Guide de Déploiement

**Auteur** : Manus AI  
**Version** : 1.0.0  
**Date** : 27 février 2026

---

## 1. Prérequis

Le déploiement de MedCom nécessite les composants suivants sur le serveur cible. L'infrastructure est entièrement conteneurisée via Docker, ce qui simplifie considérablement le processus de mise en production.

| Composant | Version minimale | Rôle |
|---|---|---|
| Docker | 24.0+ | Conteneurisation des services |
| Docker Compose | 2.20+ | Orchestration multi-conteneurs |
| Node.js | 20 LTS | Build du backend (CI uniquement) |
| Flutter | 3.22+ | Build de l'application mobile (CI uniquement) |
| PostgreSQL | 16+ | Base de données principale |
| Redis | 7+ | Cache et sessions |
| Nginx | 1.25+ | Reverse proxy et TLS termination |

Le serveur de production doit disposer d'au moins 4 Go de RAM, 2 vCPU et 50 Go de stockage SSD pour un déploiement initial supportant jusqu'à 10 000 utilisateurs.

---

## 2. Architecture de déploiement

L'architecture de production recommandée repose sur AWS, bien que le système soit compatible avec tout fournisseur cloud supportant Docker.

### 2.1 Topologie de production

Le déploiement de production comprend les composants suivants, chacun isolé dans son propre conteneur Docker et communicant via un réseau interne dédié :

Le **reverse proxy Nginx** gère la terminaison TLS 1.3, le rate limiting, les en-têtes de sécurité et la distribution du trafic vers le backend. Le **backend NestJS** s'exécute en mode cluster avec autoscaling horizontal. La **base de données PostgreSQL** est hébergée sur AWS RDS avec chiffrement au repos et réplication multi-AZ. Le **cache Redis** assure la gestion des sessions, le rate limiting distribué et le cache des résultats d'interactions fréquentes.

### 2.2 Services AWS recommandés

| Service AWS | Utilisation | Configuration |
|---|---|---|
| EC2 / ECS Fargate | Backend NestJS | t3.medium minimum, autoscaling |
| RDS PostgreSQL | Base de données | db.t3.medium, Multi-AZ, chiffrement |
| ElastiCache Redis | Cache et sessions | cache.t3.micro |
| S3 | Stockage ordonnances, exports | Chiffrement SSE-S3 |
| CloudFront | CDN pour assets statiques | Distribution globale |
| Route 53 | DNS | Routage géographique |
| ACM | Certificats TLS | Renouvellement automatique |
| CloudWatch | Monitoring et alertes | Logs centralisés |
| SNS | Notifications push | Intégration Firebase |

---

## 3. Procédure de déploiement

### 3.1 Déploiement initial

La procédure de déploiement initial se déroule en six étapes séquentielles. Chaque étape doit être validée avant de passer à la suivante.

**Étape 1 — Cloner le dépôt et configurer l'environnement** :

```bash
git clone https://github.com/your-org/medcom.git
cd medcom
cp .env.example .env
```

Éditer le fichier `.env` avec les valeurs de production. Les secrets critiques (JWT_SECRET, ENCRYPTION_KEY, mots de passe) doivent être générés avec un générateur cryptographique :

```bash
# Générer JWT_SECRET (64 caractères)
openssl rand -hex 32

# Générer ENCRYPTION_KEY (32 bytes hex)
openssl rand -hex 16
```

**Étape 2 — Configurer les certificats TLS** :

```bash
# Avec Let's Encrypt (recommandé)
certbot certonly --standalone -d api.medcom.health
cp /etc/letsencrypt/live/api.medcom.health/fullchain.pem infrastructure/nginx/ssl/
cp /etc/letsencrypt/live/api.medcom.health/privkey.pem infrastructure/nginx/ssl/
```

**Étape 3 — Lancer le déploiement** :

```bash
chmod +x infrastructure/scripts/deploy.sh
./infrastructure/scripts/deploy.sh production
```

Ce script exécute automatiquement la sauvegarde de la base existante (si applicable), le pull des images, le build du backend, l'application des migrations et le démarrage de tous les services.

**Étape 4 — Vérifier le déploiement** :

```bash
# Vérifier que tous les services sont en état "healthy"
docker compose ps

# Tester l'API
curl -s https://api.medcom.health/api/health | jq .

# Vérifier les logs
docker compose logs --tail=50 backend
```

**Étape 5 — Appliquer les données de seed** :

```bash
docker compose exec -T postgres psql -U medcom_user -d medcom \
  -f /docker-entrypoint-initdb.d/002_seed_data.sql
```

**Étape 6 — Configurer le monitoring** :

Configurer les alertes CloudWatch pour les métriques critiques : utilisation CPU > 80%, mémoire > 85%, latence API > 300ms, erreurs 5xx > 1% du trafic.

### 3.2 Mises à jour (Zero-downtime)

Les mises à jour de production suivent un processus de déploiement progressif (rolling update) pour garantir une disponibilité continue :

```bash
# 1. Pull des nouvelles images
docker compose pull

# 2. Rebuild du backend
docker compose build --no-cache backend

# 3. Rolling restart
docker compose up -d --no-deps backend

# 4. Vérification santé
docker compose exec backend wget -qO- http://localhost:3000/api/health
```

---

## 4. Sauvegardes et restauration

### 4.1 Stratégie de sauvegarde

La stratégie de sauvegarde suit le principe 3-2-1 : trois copies des données, sur deux supports différents, dont une hors site.

| Type | Fréquence | Rétention | Stockage |
|---|---|---|---|
| Snapshot RDS automatique | Quotidien | 30 jours | AWS RDS |
| Dump PostgreSQL | Toutes les 6h | 7 jours | S3 chiffré |
| Backup complet | Hebdomadaire | 90 jours | S3 Glacier |

### 4.2 Restauration

```bash
# Restaurer depuis un dump
gunzip < backups/medcom_20260227_103000.sql.gz | \
  docker compose exec -T postgres psql -U medcom_user -d medcom
```

---

## 5. Build de l'application mobile

### 5.1 Android

```bash
cd flutter
flutter build apk --release --dart-define=API_URL=https://api.medcom.health/api/v1
flutter build appbundle --release  # Pour Google Play Store
```

### 5.2 iOS

```bash
cd flutter
flutter build ios --release --dart-define=API_URL=https://api.medcom.health/api/v1
# Puis ouvrir Xcode pour l'archivage et la soumission à l'App Store
```

---

## 6. Rollback

En cas de problème après un déploiement, le rollback s'effectue en restaurant l'image Docker précédente et la sauvegarde de base de données correspondante :

```bash
# 1. Identifier la version précédente
docker images | grep medcom-backend

# 2. Rollback du backend
docker compose down backend
docker compose up -d --no-deps backend  # avec l'image précédente taguée

# 3. Si nécessaire, restaurer la base de données
gunzip < backups/medcom_PREVIOUS_TIMESTAMP.sql.gz | \
  docker compose exec -T postgres psql -U medcom_user -d medcom
```
