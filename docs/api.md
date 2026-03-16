# API REST — wordevent

> Doc auto-générée disponible sur http://localhost:3000/api/docs (Swagger)

## Auth

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /auth/register | ❌ | Inscription |
| POST | /auth/login | ❌ | Connexion |
| POST | /auth/google | ❌ | Google OAuth |
| POST | /auth/apple | ❌ | Apple Sign In |
| POST | /auth/refresh | ❌ | Refresh token |
| GET | /auth/me | ✅ | Profil connecté |

## Users

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /users | 🔑 ADMIN | Liste tous les users |
| GET | /users/:id | ✅ | Profil d'un user |
| PATCH | /users/:id | ✅ | Modifier son profil |
| DELETE | /users/:id | 🔑 ADMIN | Supprimer un user |

## Events

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | /events | ✅ | Events autour de moi (lat/lng/radius) |
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

---
✅ = JWT requis | 🔑 = ADMIN uniquement | ❌ = public
