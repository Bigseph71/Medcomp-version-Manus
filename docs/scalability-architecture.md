# MedCom — Architecture de Scalabilité

**Auteur** : Manus AI  
**Version** : 1.0.0  
**Date** : 27 février 2026

---

## 1. Objectifs de scalabilité

L'architecture de MedCom est conçue pour supporter une croissance progressive de 1 000 à 100 000+ utilisateurs actifs sans refonte majeure de l'infrastructure. Le système doit maintenir une latence API inférieure à 300ms au percentile 95, une disponibilité de 99.9% (soit moins de 8h45 d'indisponibilité par an), et une capacité de traitement de 1 000 vérifications d'interactions simultanées.

La stratégie de scalabilité repose sur trois axes complémentaires : le scaling horizontal des services stateless, l'optimisation des accès base de données, et la mise en cache intelligente des données fréquemment consultées.

---

## 2. Architecture cible

### 2.1 Paliers de croissance

L'infrastructure évolue par paliers en fonction du nombre d'utilisateurs actifs. Chaque palier définit les ressources nécessaires et les optimisations à appliquer.

| Palier | Utilisateurs | Backend | Database | Redis | Coût estimé/mois |
|---|---|---|---|---|---|
| Starter | 1 — 5 000 | 1 instance t3.medium | db.t3.medium | cache.t3.micro | ~150€ |
| Growth | 5 000 — 25 000 | 2 instances t3.large | db.r6g.large Multi-AZ | cache.r6g.large | ~600€ |
| Scale | 25 000 — 100 000 | 4 instances c6g.xlarge + ALB | db.r6g.xlarge + read replica | cache.r6g.xlarge cluster | ~2 000€ |
| Enterprise | 100 000+ | ECS Fargate autoscaling | Aurora PostgreSQL | ElastiCache cluster | ~5 000€+ |

### 2.2 Composants scalables

Le backend NestJS est conçu comme un service stateless, ce qui permet le scaling horizontal sans modification de code. Chaque instance du backend est identique et interchangeable. L'état de session est stocké dans Redis, ce qui permet à n'importe quelle instance de traiter n'importe quelle requête.

La base de données PostgreSQL utilise une architecture maître-esclave avec séparation lecture/écriture. Les requêtes de lecture (consultations, statistiques, historiques) sont dirigées vers les réplicas de lecture, tandis que les écritures (confirmations de dose, vérifications d'interactions) sont dirigées vers le maître. Cette séparation permet de multiplier la capacité de lecture sans impacter les performances d'écriture.

Le cache Redis est utilisé à trois niveaux : le cache de session pour les jetons JWT et les données de session utilisateur, le cache applicatif pour les résultats d'interactions fréquemment demandées et les données de médicaments, et le cache de rate limiting pour le comptage distribué des requêtes par IP.

---

## 3. Stratégies d'optimisation

### 3.1 Optimisation de la base de données

La performance de la base de données est critique pour respecter l'objectif de latence de 300ms. Les optimisations suivantes sont appliquées dès le palier Starter.

**Indexation** : Les tables les plus sollicitées disposent d'index composites optimisés pour les requêtes fréquentes. La table `dose_logs` est indexée sur `(patient_medication_id, scheduled_time)` pour les requêtes de doses du jour. La table `drug_interactions` est indexée sur `(drug_a_id, drug_b_id)` pour les vérifications d'interactions. La table `alive_checks` est indexée sur `(user_id, created_at DESC)` pour la consultation du dernier statut.

**Partitionnement** : À partir du palier Growth, les tables volumineuses (audit_logs, dose_logs, alive_checks) sont partitionnées par mois. Cette stratégie permet de maintenir des performances de requête constantes même avec des millions d'enregistrements, tout en facilitant l'archivage des données anciennes.

**Connection pooling** : Le backend utilise un pool de connexions PostgreSQL avec un minimum de 5 connexions et un maximum de 20 connexions par instance. Au palier Scale, PgBouncer est déployé comme proxy de connexions pour mutualiser les connexions entre les instances du backend.

### 3.2 Stratégie de cache

La stratégie de cache suit le pattern Cache-Aside avec invalidation proactive pour les données critiques.

| Donnée | TTL | Stratégie d'invalidation |
|---|---|---|
| Détails médicament | 24h | Invalidation manuelle lors de mise à jour |
| Résultat d'interaction (même combinaison) | 1h | Invalidation lors de mise à jour des règles |
| Profil utilisateur | 15min | Invalidation lors de modification |
| Statistiques d'adhérence | 5min | Invalidation lors de confirmation de dose |
| Configuration alive | 30min | Invalidation lors de modification |

Les données de santé sensibles (historique de doses, résultats d'interactions personnalisés) ne sont jamais mises en cache dans Redis pour des raisons de sécurité et de conformité GDPR. Seules les données de référence (médicaments, règles d'interaction) et les données agrégées anonymisées sont éligibles au cache.

### 3.3 Optimisation du moteur d'interactions

Le moteur de règles déterministe est optimisé pour traiter les vérifications d'interactions en temps quasi-réel. Les règles d'interaction sont chargées en mémoire au démarrage du service et rafraîchies périodiquement (toutes les 5 minutes). Cette approche élimine les requêtes base de données lors des vérifications et réduit la latence à moins de 50ms pour le Layer 1.

Pour les combinaisons de plus de 5 médicaments, le nombre de paires à vérifier croît de manière quadratique (n*(n-1)/2). L'algorithme utilise un index en mémoire basé sur les codes ATC pour pré-filtrer les paires potentiellement interactives avant d'appliquer les règles détaillées.

---

## 4. Haute disponibilité

### 4.1 Architecture Multi-AZ

À partir du palier Growth, tous les composants sont déployés sur au moins deux zones de disponibilité AWS. La base de données RDS utilise la réplication synchrone Multi-AZ avec basculement automatique en cas de défaillance de la zone primaire. Le temps de basculement est inférieur à 60 secondes.

### 4.2 Health checks et auto-healing

Chaque conteneur expose un endpoint de health check (`/api/health`) vérifié toutes les 30 secondes. En cas d'échec de trois vérifications consécutives, le conteneur est automatiquement redémarré par Docker ou remplacé par ECS. Les health checks vérifient la connectivité à la base de données, la connectivité à Redis, et la disponibilité mémoire.

### 4.3 Circuit breaker

Le pattern Circuit Breaker est implémenté pour les appels aux services externes (Twilio pour SMS, Firebase pour push notifications). En cas de défaillance d'un service externe, le circuit s'ouvre après 5 échecs consécutifs, les requêtes sont mises en file d'attente Redis, et le circuit se referme automatiquement après 60 secondes pour tester la disponibilité du service.

---

## 5. Monitoring et observabilité

### 5.1 Métriques clés

Le système de monitoring collecte et alerte sur les métriques suivantes.

| Métrique | Seuil d'alerte | Seuil critique | Action |
|---|---|---|---|
| Latence API P95 | > 200ms | > 300ms | Investigation |
| Taux d'erreur 5xx | > 0.5% | > 1% | Rollback automatique |
| CPU utilisation | > 70% | > 85% | Scale-out automatique |
| Mémoire utilisation | > 75% | > 90% | Scale-out + investigation |
| Connexions DB actives | > 80% du pool | > 95% du pool | Augmentation pool |
| Taux de cache hit | < 80% | < 60% | Optimisation cache |
| File d'attente notifications | > 1000 | > 5000 | Scale-out workers |

### 5.2 Stack de monitoring

La stack de monitoring recommandée comprend AWS CloudWatch pour les métriques d'infrastructure, les logs centralisés du backend en format JSON structuré acheminés vers CloudWatch Logs, et des dashboards Grafana pour la visualisation en temps réel. Les alertes sont configurées via CloudWatch Alarms avec notification par email et Slack.

---

## 6. Stratégie de migration des données

Lors des montées de palier, la migration des données suit un processus en quatre étapes pour garantir zéro perte de données et un temps d'indisponibilité minimal. La première étape consiste à provisionner la nouvelle infrastructure en parallèle de l'existante. La deuxième étape réplique les données vers la nouvelle base de données via la réplication logique PostgreSQL. La troisième étape bascule le trafic vers la nouvelle infrastructure via un changement DNS. La quatrième étape vérifie l'intégrité des données et décommissionne l'ancienne infrastructure après une période de stabilisation de 48 heures.
