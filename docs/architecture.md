# Architecture — wordevent

## Vue globale

```
[Client API / Frontend]
        |
   [Nginx :8080]
        |
   [NestJS :3000] ←→ Socket.IO (temps réel)
        |
  [PostgreSQL + PostGIS]
```

## Stack

| Couche | Techno |
|--------|--------|
| Backend | NestJS (TypeScript) |
| BDD | PostgreSQL 16 + PostGIS |
| SQL | Raw SQL pur — pg (node-postgres) |
| Temps réel | Socket.IO |
| Auth | JWT + Passport |

## Schéma base de données

### User
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| email | String unique | Email de connexion |
| password | String? | Hash bcrypt (null si OAuth) |
| name | String | Nom affiché |
| avatar | String? | URL photo de profil |
| role | USER / ADMIN | Droits d'accès |
| provider | LOCAL / GOOGLE / APPLE / FACEBOOK | Méthode d'auth |
| providerId | String? | ID OAuth externe |

### Event
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| title | String | Nom de l'événement |
| description | String? | Description |
| location | geometry(Point, 4326) | Position PostGIS |
| capacity | Int | Nombre max de participants |
| imageUrl | String? | URL de l'image |
| address | String? | Adresse lisible |
| category | SPORT/MUSIC/FOOD/PARTY/ART/OTHER | Catégorie |
| visibility | PUBLIC / PRIVATE | Visibilité sur la map |
| startAt | DateTime | Début de l'événement |
| endAt | DateTime | Fin — masqué automatiquement après |
| creatorId | UUID → User | Créateur |

### Participation
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| userId | UUID → User | Participant |
| eventId | UUID → Event | Événement rejoint |
| joinedAt | DateTime | Date de participation |
> Contrainte unique : un user ne peut rejoindre un event qu'une fois

### PlaceOfInterest
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| name | String | Nom du lieu |
| description | String? | Description optionnelle |
| icon | String? | Emoji ou identifiant icône |
| userId | UUID → User | Propriétaire |
| location | geometry(Point, 4326) | Position PostGIS |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Dernière modification |

> Les POIs sont privés — uniquement visibles par leur propriétaire.

### Invitation (events privés)
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| eventId | UUID → Event | Événement privé |
| invitedById | UUID → User | Qui a invité |
| invitedUserId | UUID → User | Qui est invité |
| status | PENDING / ACCEPTED / DECLINED | État de l'invitation |

## Règles métier

| Règle | Détail |
|-------|--------|
| Event PUBLIC | Visible sur la map par tous les utilisateurs connectés |
| Event PRIVATE | Visible uniquement par les membres invités |
| Capacité | Participation refusée si `count(participations) >= capacity` |
| Expiration | Events avec `endAt < now()` masqués de la map |
| Admin | Peut supprimer tout event/user, accès à toutes les données |

## Modules NestJS (implémentés)

- **DatabaseModule** — service pg partagé (pool de connexions, requêtes SQL brutes)
- **AuthModule** — JWT + refresh token, Google OAuth, Apple Sign In, Facebook
- **UsersModule** — CRUD utilisateurs, profil
- **EventsModule** — CRUD events, géospatial (ST_DWithin), Socket.IO
- **ParticipationsModule** — rejoindre/quitter un event
- **InvitationsModule** — invitations events privés
- **MessagesModule** — historique paginé + Socket.IO chat temps réel
- **PlacesOfInterestModule** — CRUD POIs personnels, requêtes géospatiales par rayon
