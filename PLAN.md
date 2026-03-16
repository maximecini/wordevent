# Plan de développement — wordevent

> État de départ : NestJS initialisé, Expo initialisé, Prisma migré + admin seedé, Docker 4 conteneurs opérationnels.

---

## Vue d'ensemble

```
Phase 1  — Socle Backend (Prisma + Config + Auth)
Phase 2  — Socle Mobile (Navigation + Auth UI)
Phase 3  — Backend Events + Participations
Phase 4  — Mobile Map + Events
Phase 5  — Temps réel (Socket.IO)
Phase 6  — Backend Invitations + Chat
Phase 7  — Mobile Invitations + Chat
Phase 8  — Points d'intérêt + Profil
Phase 9  — Admin
Phase 10 — Finitions MVP + Tests
```

---

## Phase 1 — Socle Backend

**Dépendances** : aucune

### 1.1 — PrismaModule global
- `src/prisma/prisma.service.ts` — PrismaClient avec onModuleInit / onModuleDestroy
- `src/prisma/prisma.module.ts` — @Global() + export
- Ajouter PrismaModule dans AppModule
- **Test** : backend démarre sans erreur, connexion DB OK

### 1.2 — Configuration globale NestJS
- Installer `@nestjs/config`, `class-validator`, `class-transformer`
- `ConfigModule.forRoot({ isGlobal: true })` dans AppModule
- `ValidationPipe` global + `app.setGlobalPrefix('api')` dans main.ts
- **Test** : GET `http://localhost:3000/api` répond

### 1.3 — Swagger
- Installer `@nestjs/swagger`
- `SwaggerModule.setup('api/docs', app, document)` dans main.ts
- **Test** : `http://localhost:3000/api/docs` accessible

### 1.4 — AuthModule — email/password
- Modules : `auth`, `users`
- Installer : `@types/passport-local`, `@types/passport-jwt`
- `UsersService` : `findByEmail`, `findById`, `create`
- `AuthService` : `register`, `login`, `validateUser`
- `LocalStrategy` + `JwtStrategy` + `JwtAuthGuard` + `LocalAuthGuard`
- DTOs : `RegisterDto`, `LoginDto` (class-validator)
- Endpoints : `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- JWT : access token 15min + refresh token 7 jours (colonne `refreshToken String?` → nouvelle migration)
- Endpoint : `POST /auth/refresh`
- **Test** : register → login → GET /auth/me via Swagger

### 1.5 — AuthModule — Google OAuth
- Installer `passport-google-oauth20`, `@types/passport-google-oauth20`
- Variables : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `GoogleStrategy` + endpoint `POST /auth/google`

### 1.6 — AuthModule — Apple Sign In
- Installer `apple-signin-auth`
- Variables Apple dans .env
- Endpoint `POST /auth/apple`

### 1.7 — RolesGuard
- `src/common/guards/roles.guard.ts`
- `src/common/decorators/roles.decorator.ts`
- **Test** : token USER refusé sur route @Roles(ADMIN)

---

## Phase 2 — Socle Mobile

**Dépendances** : Phase 1.4

### 2.1 — Architecture dossiers
```
mobile/src/
  api/        — clients HTTP
  components/ — composants réutilisables
  screens/    — écrans
  navigation/ — React Navigation
  store/      — Zustand
  hooks/      — hooks custom
  types/      — types TypeScript
  utils/
```
- Installer : `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`, `zustand`, `axios`, `@react-native-async-storage/async-storage`, `expo-secure-store`

### 2.2 — Navigation principale
- `RootNavigator` : AuthNavigator (non connecté) / AppNavigator (connecté)
- `AuthNavigator` : Login, Register
- `AppNavigator` : Tab bar (Map, Profil)

### 2.3 — Client API + tokens
- `src/api/client.ts` : axios avec `EXPO_PUBLIC_API_URL`
- Intercepteur : injection JWT + refresh auto sur 401
- Store Zustand `useAuthStore` : `user`, `accessToken`, `login()`, `logout()`, `refreshToken()`

### 2.4 — Écrans Auth
- `LoginScreen` : email + password + bouton Google + bouton Apple
- `RegisterScreen` : email + password + nom
- Intégrer `expo-auth-session` (Google) + `expo-apple-authentication` (Apple)
- Persistence session via `expo-secure-store`
- **Test** : login fonctionne, JWT stocké, redirection vers AppNavigator

---

## Phase 3 — Backend Events + Participations

**Dépendances** : Phase 1.4

### 3.1 — EventsModule — CRUD
- Modules : `events`
- Helper `src/common/helpers/geo.helper.ts` : `makePoint`, `serializePoint` (réutilisable partout)
- `CreateEventDto` : title, description?, lat, lng, capacity, visibility, startAt, endAt
- `EventsService` :
  - `create` : `ST_SetSRID(ST_MakePoint(lng, lat), 4326)` via `$queryRaw`
  - `findNearby(lat, lng, radius)` : `ST_DWithin` + `endAt > now()` + filtre visibilité
  - `findById` : retourner lat/lng via `ST_X`, `ST_Y`
  - `update` / `delete` : vérifier `creatorId === req.user.id` ou ADMIN
- **Test** : créer, retrouver par GPS, modifier, supprimer via Swagger

### 3.2 — ParticipationsModule
- `POST /events/:id/join` : vérifier capacité + accès PRIVATE (invitation ACCEPTED)
- `DELETE /events/:id/leave` : créateur ne peut pas quitter
- `GET /events/:id/participants`
- **Test** : rejoindre, quitter, refus si capacité max

---

## Phase 4 — Mobile Map + Events

**Dépendances** : Phase 3 + Phase 2

### 4.1 — Installation Maps
- Installer `react-native-maps`, `expo-location`
- Google Maps API Key dans `app.json` + `.env` Expo (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`)

### 4.2 — MapScreen
- `MapView` plein écran centré sur position GPS
- `expo-location` — demander permission + obtenir coords
- Marqueurs events : couleur PUBLIC vs PRIVATE
- Appel `GET /api/events?lat=&lng=&radius=` + debounce 500ms sur `onRegionChangeComplete`
- Store Zustand `useEventsStore`

### 4.3 — Création d'event
- Bouton flottant → `CreateEventSheet` (bottom sheet)
- Installer `@gorhom/bottom-sheet`
- Formulaire : titre, description, capacité, visibilité, dates
- Appel `POST /api/events`

### 4.4 — Détail d'un event
- Tap sur marqueur → `EventDetailSheet`
- Afficher : titre, participants/capacité, dates, créateur
- Boutons : Rejoindre / Quitter / Supprimer (selon rôle)
- **Test** : créer un event dans l'app, le voir sur la map, le rejoindre

---

## Phase 5 — Temps réel (Socket.IO)

**Dépendances** : Phase 3 + Phase 4

### 5.1 — Backend EventsGateway
- Installer : `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- `EventsGateway` : authentification JWT sur `socket.handshake.auth.token`
- Events émis :
  - `event:created`, `event:updated`, `event:deleted`
  - `event:participant_joined`, `event:participant_left`
- Émettre depuis `EventsService` et `ParticipationsService` après chaque mutation
- **Test** : deux connexions WebSocket — créer un event sur l'une, le voir sur l'autre

### 5.2 — Mobile Socket.IO
- Installer `socket.io-client`
- `src/api/socket.ts` : singleton authentifié avec JWT
- Hook `useSocket()` : subscribe aux events map → update store Zustand
- **Test** : deux devices — event créé sur l'un apparaît instantanément sur l'autre

---

## Phase 6 — Backend Invitations + Chat

**Dépendances** : Phase 3

### 6.1 — InvitationsModule
- `POST /events/:id/invite` : body `{ invitedUserId }` — vérifier que l'invitant est créateur
- `PATCH /invitations/:id` : body `{ status: ACCEPTED | DECLINED }`
- `GET /invitations` : invitations reçues PENDING
- `GET /users/search?email=` dans UsersController (pour trouver un user à inviter)
- **Test** : créer event PRIVATE, inviter, accepter, vérifier accès

### 6.2 — MessagesModule + ChatGateway
- `GET /events/:id/messages` : historique paginé (50/page) — REST uniquement
- `ChatGateway` (Socket.IO) :
  - `joinRoom(eventId)` : vérifier participation active
  - `leaveRoom(eventId)`
  - `sendMessage(eventId, content)` : persister + émettre `message:new` à la room
- **Test** : deux users participants, chat bidirectionnel temps réel

---

## Phase 7 — Mobile Invitations + Chat

**Dépendances** : Phase 6 + Phase 5.2

### 7.1 — Écran Invitations
- Badge dans tab bar (nombre PENDING)
- `InvitationsScreen` : liste + `InvitationCard` (Accepter / Refuser)
- Socket event `invitation:received` → badge mis à jour

### 7.2 — Flux invitation depuis EventDetailSheet
- Bouton "Inviter" si créateur d'event PRIVATE
- `InviteUserModal` : recherche email → `GET /api/users/search?email=` → `POST /api/events/:id/invite`

### 7.3 — ChatScreen
- `FlatList` inversée + input envoi
- `MessageBubble` : bulle gauche (autres) / droite (soi)
- Montage : charger historique + `joinRoom(eventId)`
- Démontage : `leaveRoom(eventId)`
- Écoute `message:new` → ajout sans re-fetch
- **Test** : chat bidirectionnel temps réel, historique au rechargement

---

## Phase 8 — Points d'intérêt + Profil

**Dépendances** : Phase 4 (map) + Phase 1.4 (backend)

### 8.1 — Backend PlacesOfInterestModule
- `GET /places-of-interest` : tous les POI de l'user connecté
- `POST /places-of-interest` : `{ name, description?, lat, lng, icon? }`
- `PATCH /places-of-interest/:id` + `DELETE /places-of-interest/:id` (owner uniquement)
- Même pattern géospatial `$queryRaw` que EventsService

### 8.2 — Mobile POI sur la map
- Charger POI au montage de la map
- Marqueurs distincts des events (icône/couleur différente)
- Long-press sur map → `CreatePoiSheet`
- Tap sur marqueur POI → modifier / supprimer

### 8.3 — Backend Profil
- `GET /users/:id` : profil public (name, avatar, createdAt)
- `PATCH /users/:id` : modifier son profil (vérifier ownership ou ADMIN)
- `GET /users/search?email=` : déjà couvert en Phase 6.1

### 8.4 — Mobile ProfileScreen
- Afficher : avatar, nom, email
- Formulaire modifier profil
- Bouton déconnexion → logout + clear secure store + redirect AuthNavigator

---

## Phase 9 — Admin

**Dépendances** : Phase 3 + Phase 8.3

### 9.1 — Backend routes Admin
- `GET /users` (ADMIN) : liste paginée tous les users
- `DELETE /users/:id` (ADMIN) : cascade sur events, participations, messages
- `DELETE /events/:id` (ADMIN) : déjà couvert Phase 3.1 — vérifier

### 9.2 — Mobile Admin
MVP : le compte admin utilise l'app normalement avec droits élargis. Pas d'interface dédiée nécessaire pour le MVP.

---

## Phase 10 — Finitions + Tests

**Dépendances** : toutes les phases

### 10.1 — Gestion des erreurs
- Backend : `ExceptionFilter` global — réponses uniformes `{ statusCode, message, error }`
- Mobile : installer `react-native-toast-message` — afficher les erreurs API

### 10.2 — Sécurité edge cases
- Events PRIVATE invisibles sans invitation ACCEPTED
- `endAt < now()` → event masqué de la map
- Quitter un event révoque l'accès au chat
- Rate limiting auth : `@nestjs/throttler`

### 10.3 — Tests backend (priorité)
1. `AuthService` — register, login, refresh
2. `EventsService` — create, findNearby, accès PRIVATE
3. `ParticipationsService` — join, leave, capacité max
4. `InvitationsService` — invite, accept/decline

### 10.4 — Performance map
- Index GIST PostGIS sur `location` (vérifier dans migration)
- Ne re-fetch que si la région map change de +20%
- Limiter `findNearby` à 100 events côté backend

### 10.5 — Variables d'env Expo
- `mobile/.env` : `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- Documenter dans `docs/deployment.md`

---

## Dépendances entre phases

```
Phase 1 (Socle Backend)
    ├── Phase 2 (Socle Mobile)          attend 1.4
    ├── Phase 3 (Events Backend)        attend 1.4
    │       └── Phase 4 (Map Mobile)   attend 3 + 2
    │               └── Phase 5 (Socket.IO) attend 3 + 4
    │       └── Phase 6 (Chat Backend) attend 3
    │               └── Phase 7 (Chat Mobile) attend 6 + 5
    └── Phase 8 (POI + Profil)         attend 4 + 1.4
Phase 9 (Admin)                        attend 3 + 8
Phase 10 (Finitions)                   attend tout
```

**Chemin critique** : `1.4 → 3 → 4 → 5 → 7 → 10`

---

## Packages à installer

### Backend
```bash
@nestjs/config
@nestjs/swagger swagger-ui-express
class-validator class-transformer
@types/passport-local passport-local
@types/passport-jwt
passport-google-oauth20 @types/passport-google-oauth20
apple-signin-auth
@nestjs/websockets @nestjs/platform-socket.io socket.io
@nestjs/throttler
```

### Mobile
```bash
@react-navigation/native @react-navigation/native-stack
react-native-screens react-native-safe-area-context
react-native-gesture-handler
zustand
axios
@react-native-async-storage/async-storage
expo-secure-store
expo-location
expo-auth-session expo-crypto
expo-apple-authentication
react-native-maps
@gorhom/bottom-sheet
socket.io-client
react-native-toast-message
```

---

## Conventions à respecter

1. Mettre à jour `docs/` avant de coder chaque feature
2. Géospatial : toujours via `$queryRaw` — helper `geo.helper.ts` pour éviter les doublons
3. DTOs : toujours valider avec `class-validator`
4. Guards : `JwtAuthGuard` sur tout sauf routes auth publiques
5. Socket.IO : authentifier chaque connexion avec JWT
6. Mobile : JWT dans `expo-secure-store` uniquement (jamais AsyncStorage en clair)
