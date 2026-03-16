# Architecture — wordevent

## Vue globale

```
[Mobile iOS/Android]
        |
    Expo Go / App Store
        |
   [Nginx :4443]
        |
   [NestJS :3000] ←→ Socket.IO (temps réel)
        |
  [PostgreSQL + PostGIS]
```

## Stack

| Couche | Techno |
|--------|--------|
| Mobile | React Native + Expo |
| Maps | react-native-maps + Google Maps API |
| Backend | NestJS (TypeScript) |
| BDD | PostgreSQL 16 + PostGIS |
| ORM | Prisma |
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
| provider | LOCAL / GOOGLE / APPLE | Méthode d'auth |
| providerId | String? | ID OAuth externe |

### Event
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Clé primaire |
| title | String | Nom de l'événement |
| description | String? | Description |
| location | geometry(Point, 4326) | Position PostGIS |
| capacity | Int | Nombre max de participants |
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

## Modules NestJS (à implémenter)

- **AuthModule** — JWT, Google OAuth, Apple Sign In
- **UsersModule** — CRUD utilisateurs, profil
- **EventsModule** — CRUD events, géospatial, Socket.IO
- **ParticipationsModule** — rejoindre/quitter un event
- **InvitationsModule** — invitations events privés
- **PrismaModule** — service DB partagé
