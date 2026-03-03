# MedCom — Documentation API OpenAPI v1.0

**Auteur** : Manus AI  
**Version** : 1.0.0  
**Date** : 27 février 2026  
**Base URL** : `https://api.medcom.health/api/v1`

---

## 1. Vue d'ensemble

L'API MedCom est une API RESTful construite avec NestJS, conçue pour servir l'application mobile Flutter et le tableau de bord soignant. Elle expose des endpoints sécurisés pour la gestion des médicaments, la vérification d'interactions médicamenteuses, le suivi d'adhérence, la confirmation de vie des seniors et la supervision par les soignants.

Toutes les réponses suivent un format JSON standardisé. L'authentification repose sur des jetons JWT avec rotation automatique des tokens de rafraîchissement. Le chiffrement des données de santé est assuré par AES-256, et toutes les communications transitent via TLS 1.3.

---

## 2. Authentification

L'API utilise un système d'authentification JWT à double jeton (access token + refresh token). Le jeton d'accès a une durée de vie de 15 minutes, tandis que le jeton de rafraîchissement est valide pendant 7 jours.

| Paramètre | Valeur |
|---|---|
| Type | Bearer Token (JWT) |
| Header | `Authorization: Bearer <access_token>` |
| Durée access token | 15 minutes |
| Durée refresh token | 7 jours |
| Algorithme | HS256 |

### 2.1 Endpoints d'authentification

#### `POST /auth/register`

Crée un nouveau compte utilisateur avec consentement GDPR obligatoire.

**Request Body** :
```json
{
  "email": "patient@example.com",
  "password": "SecureP@ss123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "dateOfBirth": "1955-03-15",
  "role": "patient",
  "gdprConsent": true,
  "dataProcessingConsent": true
}
```

**Response** `201 Created` :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "patient"
  }
}
```

#### `POST /auth/login`

Authentifie un utilisateur existant.

**Request Body** :
```json
{
  "email": "patient@example.com",
  "password": "SecureP@ss123"
}
```

**Response** `200 OK` : Même structure que la réponse d'inscription.

#### `POST /auth/refresh`

Renouvelle le jeton d'accès à l'aide du jeton de rafraîchissement.

**Request Body** :
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### `POST /auth/logout`

Invalide le jeton de rafraîchissement courant.

#### `GET /auth/profile`

Retourne le profil de l'utilisateur authentifié. Requiert un jeton d'accès valide.

---

## 3. Module Drug Intelligence

Ce module fournit la vérification d'interactions médicamenteuses via un moteur hybride à deux couches : un moteur de règles déterministe (Layer 1) et un moteur d'explication RAG basé sur l'IA (Layer 2).

### 3.1 Endpoints

#### `POST /drug-intelligence/check`

Vérifie les interactions entre une liste de médicaments, avec un contexte patient optionnel.

**Request Body** :
```json
{
  "drugIds": ["uuid-1", "uuid-2", "uuid-3"],
  "patientContext": {
    "age": 72,
    "weight": 68,
    "eGFR": 45,
    "allergies": ["penicillin"],
    "conditions": ["diabetes_type_2", "hypertension"],
    "isPregnant": false,
    "isBreastfeeding": false
  }
}
```

**Response** `200 OK` :
```json
{
  "checkId": "uuid",
  "timestamp": "2026-02-27T10:30:00Z",
  "interactions": [
    {
      "interactionId": "uuid",
      "drugA": { "id": "uuid-1", "name": "Metformine", "atcCode": "A10BA02" },
      "drugB": { "id": "uuid-2", "name": "Amlodipine", "atcCode": "C08CA01" },
      "severity": "yellow",
      "clinicalExplanation": "L'amlodipine peut réduire l'efficacité hypoglycémiante de la metformine.",
      "patientExplanation": "Votre médicament pour le diabète pourrait être moins efficace.",
      "recommendation": "Surveillance glycémique renforcée recommandée.",
      "confidenceScore": 0.87,
      "sources": [
        { "name": "EMA SmPC Metformine", "url": "https://ema.europa.eu/...", "type": "regulatory" },
        { "name": "Thesaurus ANSM 2024", "type": "national_authority" }
      ]
    }
  ],
  "summary": {
    "totalInteractions": 2,
    "critical": 0,
    "moderate": 1,
    "low": 1
  },
  "disclaimer": "Cet outil ne remplace pas un avis médical professionnel. Consultez toujours votre médecin."
}
```

#### `GET /drug-intelligence/drugs`

Recherche de médicaments dans la base de données.

| Paramètre | Type | Description |
|---|---|---|
| `q` | string | Terme de recherche (nom, substance, code ATC) |
| `page` | number | Page (défaut: 1) |
| `limit` | number | Résultats par page (défaut: 20, max: 100) |

#### `GET /drug-intelligence/drugs/:id`

Retourne les détails complets d'un médicament, incluant substance active, classification ATC, contre-indications et effets secondaires.

#### `GET /drug-intelligence/history`

Retourne l'historique des vérifications d'interactions de l'utilisateur authentifié.

---

## 4. Module Pillbox (Pilulier)

Ce module gère le plan de médication, les rappels, le suivi des prises et les statistiques d'adhérence.

### 4.1 Gestion des médicaments

#### `POST /pillbox/medications`

Ajoute un médicament au plan de médication de l'utilisateur.

**Request Body** :
```json
{
  "drugId": "uuid",
  "customName": "Metformine 500mg",
  "dosage": "500",
  "dosageUnit": "mg",
  "frequency": "daily",
  "timesPerDay": 1,
  "reminderTimes": ["08:00"],
  "foodCondition": "with_meal",
  "startDate": "2026-01-01",
  "endDate": null,
  "prescribedBy": "Dr. Martin",
  "notes": "Prendre avec le petit-déjeuner"
}
```

**Response** `201 Created` : Retourne l'objet médicament créé avec son identifiant.

#### `GET /pillbox/medications`

Liste tous les médicaments actifs de l'utilisateur.

#### `GET /pillbox/medications/:id`

Détail d'un médicament spécifique.

#### `PUT /pillbox/medications/:id`

Met à jour un médicament existant.

#### `DELETE /pillbox/medications/:id`

Suppression logique (soft delete) d'un médicament.

### 4.2 Suivi des doses

#### `GET /pillbox/doses`

Retourne les doses planifiées pour une date donnée.

| Paramètre | Type | Description |
|---|---|---|
| `date` | string (YYYY-MM-DD) | Date cible (défaut: aujourd'hui) |

#### `POST /pillbox/doses/:id/confirm`

Confirme la prise d'une dose.

**Request Body** :
```json
{
  "takenAt": "2026-02-27T08:15:00Z",
  "notes": ""
}
```

#### `POST /pillbox/doses/:id/skip`

Marque une dose comme volontairement ignorée.

**Request Body** :
```json
{
  "reason": "Effets secondaires"
}
```

#### `POST /pillbox/doses/:id/snooze`

Reporte un rappel de dose.

**Request Body** :
```json
{
  "snoozeMinutes": 30
}
```

### 4.3 Statistiques d'adhérence

#### `GET /pillbox/adherence`

Retourne les statistiques d'adhérence de l'utilisateur.

| Paramètre | Type | Description |
|---|---|---|
| `period` | string | `daily`, `weekly`, `monthly` |
| `startDate` | string | Date de début |
| `endDate` | string | Date de fin |

**Response** `200 OK` :
```json
{
  "period": "weekly",
  "overallAdherence": 87.5,
  "data": [
    {
      "date": "2026-02-20",
      "scheduled": 4,
      "taken": 3,
      "missed": 1,
      "adherencePercent": 75.0
    }
  ],
  "riskScore": 0.23,
  "riskLevel": "low",
  "trend": "stable"
}
```

#### `GET /pillbox/adherence/report`

Génère un rapport d'adhérence exportable en PDF.

| Paramètre | Type | Description |
|---|---|---|
| `format` | string | `pdf` ou `json` |
| `period` | string | `weekly` ou `monthly` |

---

## 5. Module Alive Confirmation

Ce module implémente le système de confirmation de vie pour les seniors, avec un workflow d'escalation configurable à 5 niveaux.

### 5.1 Endpoints

#### `POST /alive/confirm`

Enregistre une confirmation de vie.

**Request Body** :
```json
{
  "batteryLevel": 85,
  "networkStatus": "wifi",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

**Response** `200 OK` :
```json
{
  "checkId": "uuid",
  "confirmedAt": "2026-02-27T09:15:00Z",
  "nextCheckDue": "2026-02-28T09:15:00Z",
  "status": "confirmed"
}
```

#### `GET /alive/status`

Retourne le statut actuel de confirmation de vie de l'utilisateur.

#### `GET /alive/history`

Retourne l'historique des confirmations.

| Paramètre | Type | Description |
|---|---|---|
| `page` | number | Page (défaut: 1) |
| `limit` | number | Résultats par page (défaut: 30) |

### 5.2 Configuration

#### `GET /alive/configuration`

Retourne la configuration actuelle de confirmation de vie.

#### `PUT /alive/configuration`

Met à jour la configuration.

**Request Body** :
```json
{
  "isEnabled": true,
  "intervalHours": 24,
  "reminderTime": "09:00",
  "gracePeriodMinutes": 60,
  "escalationEnabled": true,
  "escalationDelays": {
    "pushNotification": 0,
    "smsAlert": 30,
    "automatedCall": 60,
    "gpsTransmission": 90,
    "emergencyEscalation": 120
  }
}
```

### 5.3 Contacts d'urgence

#### `GET /alive/contacts`

Liste les contacts d'urgence de l'utilisateur.

#### `POST /alive/contacts`

Ajoute un contact d'urgence.

**Request Body** :
```json
{
  "name": "Marie Dupont",
  "relationship": "daughter",
  "phone": "+33612345678",
  "email": "marie@example.com",
  "priority": 1,
  "notifyOnMissedDose": true,
  "notifyOnAliveMiss": true
}
```

#### `PUT /alive/contacts/:id`

Met à jour un contact d'urgence.

#### `DELETE /alive/contacts/:id`

Supprime un contact d'urgence.

---

## 6. Module Caregiver (Soignant)

Ce module permet aux soignants de superviser les patients sous leur responsabilité.

### 6.1 Endpoints

#### `GET /caregiver/patients`

Liste les patients associés au soignant authentifié.

#### `GET /caregiver/patients/:patientId/dashboard`

Retourne le tableau de bord complet d'un patient.

**Response** `200 OK` :
```json
{
  "patient": { "id": "uuid", "firstName": "Jean", "lastName": "Dupont" },
  "aliveStatus": { "lastConfirmed": "2026-02-27T09:15:00Z", "status": "confirmed" },
  "adherence": { "todayPercent": 75, "weekPercent": 87, "monthPercent": 91 },
  "recentAlerts": [],
  "recentActivity": [],
  "deviceHealth": { "batteryLevel": 85, "lastSeen": "2026-02-27T11:00:00Z" }
}
```

#### `POST /caregiver/invite`

Envoie une invitation de supervision à un patient.

#### `GET /caregiver/patients/:patientId/adherence`

Retourne les statistiques d'adhérence détaillées d'un patient.

#### `GET /caregiver/patients/:patientId/interactions`

Retourne l'historique des vérifications d'interactions d'un patient.

#### `GET /caregiver/patients/:patientId/alive-history`

Retourne l'historique de confirmation de vie d'un patient.

---

## 7. Module Audit & Conformité

Ce module fournit les logs d'audit et la gestion des incidents pour la conformité MDR.

### 7.1 Endpoints (Admin uniquement)

#### `GET /audit/logs`

Retourne les logs d'audit avec filtrage.

| Paramètre | Type | Description |
|---|---|---|
| `action` | string | Type d'action (login, interaction_check, dose_confirm, etc.) |
| `userId` | string | Filtrer par utilisateur |
| `startDate` | string | Date de début |
| `endDate` | string | Date de fin |
| `page` | number | Page |
| `limit` | number | Résultats par page |

#### `POST /audit/incidents`

Crée un rapport d'incident (conformité MDR).

**Request Body** :
```json
{
  "title": "Interaction non détectée",
  "description": "Description détaillée de l'incident",
  "severity": "high",
  "affectedUsers": ["uuid-1"],
  "category": "false_negative"
}
```

#### `GET /audit/incidents`

Liste les incidents avec filtrage par sévérité et statut.

---

## 8. Codes d'erreur

L'API utilise des codes HTTP standards avec des messages d'erreur structurés.

| Code | Signification | Description |
|---|---|---|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Paramètres invalides |
| 401 | Unauthorized | Jeton manquant ou expiré |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 422 | Unprocessable Entity | Données de validation incorrectes |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |

**Format d'erreur standard** :
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["Email format is invalid"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2026-02-27T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

---

## 9. Rate Limiting

L'API applique un rate limiting différencié selon le type d'endpoint.

| Endpoint | Limite | Fenêtre |
|---|---|---|
| `/auth/*` | 5 requêtes | 1 minute |
| `/drug-intelligence/check` | 30 requêtes | 1 minute |
| Autres endpoints | 60 requêtes | 1 minute |

Les headers de réponse incluent `X-RateLimit-Limit`, `X-RateLimit-Remaining` et `X-RateLimit-Reset`.
