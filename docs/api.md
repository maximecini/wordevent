# API REST — wordevent

> Doc auto-générée disponible sur http://localhost:3000/api/docs (Swagger)

## Auth

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /auth/register | ❌ | Inscription |
| POST | /auth/login | ❌ | Connexion |
| POST | /auth/google | ❌ | Google OAuth |
| POST | /auth/apple | ❌ | Apple Sign In |
| POST | /auth/facebook | ❌ | Facebook OAuth |
| POST | /auth/refresh | ❌ | Refresh token |
| GET | /auth/me | ✅ | Profil connecté |

## Users

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /users | 🔑 ADMIN | Liste tous les users |
| GET | /users/search?email= | ✅ | Rechercher un user par email (profil public) |
| GET | /users/:id | ✅ | Profil d'un user |
| PATCH | /users/:id | ✅ | Modifier son profil |
| DELETE | /users/:id | 🔑 ADMIN | Supprimer un user |

## Events

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /events | ✅ | Tous les événements accessibles |
| GET | /events/nearby?lat=&lng=&radius= | ✅ | Événements à proximité — triés par distance (max 100, défaut radius 5000 m) |
| POST | /events | ✅ | Créer un event |
| GET | /events/:id | ✅ | Détail d'un event |
| PATCH | /events/:id | ✅ | Modifier son event |
| DELETE | /events/:id | ✅/🔑 | Supprimer (créateur ou admin) |

## Participations

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /events/:id/join | ✅ | Rejoindre un event |
| DELETE | /events/:id/leave | ✅ | Quitter un event |
| GET | /events/:id/participants | ✅ | Liste des participants |

## Invitations (events privés)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /events/:id/invite | ✅ | Inviter un user |
| PATCH | /invitations/:id | ✅ | Accepter/refuser |
| GET | /invitations | ✅ | Mes invitations reçues |

## Messages (chat d'événement)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /events/:id/messages | ✅ | Historique paginé (participant uniquement) |

### WebSocket — namespace `/chat`

| Événement | Direction | Payload | Description |
|-----------|-----------|---------|-------------|
| `chat:join` | Client → Serveur | `eventId: string` | Rejoindre la room d'un event |
| `chat:leave` | Client → Serveur | `eventId: string` | Quitter la room |
| `chat:send` | Client → Serveur | `{ eventId, content }` | Envoyer un message |
| `chat:message` | Serveur → Client | `MessageResponse` | Diffusion d'un nouveau message |

### WebSocket — namespace `/events`

| Événement | Direction | Payload | Description |
|-----------|-----------|---------|-------------|
| `invitation:received` | Serveur → Client | `InvitationResponse` | Invitation reçue en temps réel |

## Places of Interest (POIs personnels)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /places | ✅ | Mes POIs autour de moi (lat/lng/radius) |
| POST | /places | ✅ | Créer un POI |
| GET | /places/:id | ✅ | Détail d'un POI (propriétaire uniquement) |
| PATCH | /places/:id | ✅ | Modifier un POI |
| DELETE | /places/:id | ✅ | Supprimer un POI |

---
✅ = JWT requis | 🔑 = ADMIN uniquement | ❌ = public
