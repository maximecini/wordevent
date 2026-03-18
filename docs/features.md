# Features — wordevent

Suivi de l'état de chaque fonctionnalité côté backend et frontend.

**Statuts :**
- ✅ Fonctionnel
- 🚧 En cours
- ❌ Non commencé

> Mettre à jour ce fichier dès qu'une feature passe à un nouveau statut.

---

## Auth — Authentification

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Inscription email/password | ✅ | ❌ | `POST /auth/register` |
| Connexion email/password | ✅ | ❌ | `POST /auth/login` |
| JWT access token + refresh token | ✅ | ❌ | 15 min / 7 jours |
| Refresh du token | ✅ | ❌ | `POST /auth/refresh` |
| Profil utilisateur connecté | ✅ | ❌ | `GET /auth/me` |
| OAuth Google | ✅ | ❌ | Expo idToken |
| OAuth Apple | ✅ | ❌ | Expo identityToken |
| OAuth Facebook | ✅ | ❌ | Expo accessToken |
| Rate limiting (5 tentatives / 60s) | ✅ | — | Côté back uniquement |

---

## Users — Utilisateurs

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Recherche utilisateur par email | ✅ | ❌ | Pour invitations |
| Liste des utilisateurs (ADMIN) | ✅ | ❌ | `GET /users` |
| Suppression d'un utilisateur (ADMIN) | ✅ | ❌ | `DELETE /users/:id` |

---

## Events — Événements

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Créer un événement | ✅ | ❌ | `POST /events` |
| Lire un événement | ✅ | ❌ | `GET /events/:id` |
| Modifier un événement | ✅ | ❌ | Créateur / ADMIN |
| Supprimer un événement | ✅ | ❌ | Créateur / ADMIN |
| Liste des événements accessibles | ✅ | ❌ | PUBLIC + invité |
| Recherche géospatiale par rayon | ✅ | ❌ | PostGIS ST_DWithin |
| Upload d'image (jpg/png/webp) | ✅ | ❌ | Max 10 MB |
| Visibilité PUBLIC / PRIVATE | ✅ | ❌ | |
| Catégories (SPORT, MUSIC, FOOD…) | ✅ | ❌ | |
| Gestion de capacité | ✅ | ❌ | |
| Broadcast temps réel (Socket.IO) | ✅ | ❌ | create/update/delete |
| Contrôle d'accès PRIVATE (invitation ACCEPTED) | ✅ | — | Vérif en DB avant retour |
| Limite de résultats (findAll: 200, findNearby: 100) | ✅ | — | Guard anti-abus |

---

## Participations

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Rejoindre un événement | ✅ | ❌ | Vérif capacité incluse |
| Quitter un événement | ✅ | ❌ | |
| Liste des participants | ✅ | ❌ | |
| Contrainte unique (1 join / user / event) | ✅ | — | Côté back uniquement |
| Blocage créateur (ne peut pas rejoindre son event) | ✅ | — | ForbiddenException |
| Transfert de lead si créateur quitte | ✅ | — | Prochain participant devient lead |
| Suppression d'event si créateur est dernier à partir | ✅ | — | Event désactivé automatiquement |
| Broadcast Socket.IO participantCount | ✅ | ❌ | À chaque join/leave |

---

## Invitations

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Inviter un user à un event privé | ✅ | ❌ | Créateur uniquement |
| Consulter ses invitations reçues | ✅ | ❌ | PENDING uniquement — `GET /invitations` |
| Accepter / refuser une invitation | ✅ | ❌ | `PATCH /invitations/:id` |
| Notification temps réel (Socket.IO) | ✅ | ❌ | |
| Validations complètes (event existe, no self-invite, unicité…) | ✅ | — | 6 vérifications backend |
| Réponse avec données event + invitant (embedded JSON) | ✅ | — | Évite un appel GET supplémentaire |
| Protection double-réponse (déjà accepté/refusé) | ✅ | — | ConflictException |

---

## Messages — Chat

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Historique paginé (participants only) | ✅ | ❌ | Pagination par curseur, tri DESC |
| Envoi de message temps réel | ✅ | ❌ | Socket.IO |
| Broadcast dans la salle | ✅ | ❌ | |
| Vérification participant/créateur avant accès | ✅ | — | ForbiddenException si non-membre |
| Limite max 100 résultats par page | ✅ | — | Défaut 50 |

---

## Places of Interest — POI personnels

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| Créer un POI | ✅ | ❌ | |
| Lire / lister ses POIs | ✅ | ❌ | Propriétaire uniquement, limite 200 |
| Modifier un POI | ✅ | ❌ | |
| Supprimer un POI | ✅ | ❌ | |
| Contrôle d'accès strict (ForbiddenException si non-propriétaire) | ✅ | — | |
| Recherche géospatiale findNearby() | 🚧 | ❌ | Service implémenté, endpoint controller manquant |

---

## Mobile — Screens

| Screen | Statut | Notes |
|--------|--------|-------|
| LoginScreen | ❌ | |
| RegisterScreen | ❌ | |
| MapScreen | ❌ | react-native-maps + expo-location |
| CreateEventSheet | ❌ | Bottom sheet |
| EventDetailSheet | ❌ | Tap sur marqueur |
| InvitationsScreen | ❌ | Badge notifications |
| ChatScreen | ❌ | FlatList inversée |
| ProfileScreen | ❌ | Modifier profil, déconnexion |
| Navigation (Auth + App) | ❌ | React Navigation |
| Store auth (Zustand) | ❌ | |
| Client Socket.IO | ❌ | Singleton authentifié |

---

## Infrastructure

| Feature | Back | Front | Notes |
|---------|------|-------|-------|
| JWT Guard + Roles Guard | ✅ | — | |
| `@CurrentUser()` decorator | ✅ | — | |
| HTTP Exception Filter global | ✅ | — | |
| Helpers PostGIS | ✅ | — | makePoint, serializePoint |
| Pool PostgreSQL (pg) | ✅ | — | |
| Swagger UI | ✅ | — | `/api/docs` |
| Docker Compose (db, nginx, backend) | ✅ | — | |
| Conteneur mobile (Expo) | — | ❌ | À initialiser |
