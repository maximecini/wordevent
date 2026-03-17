# wordevent — Contexte projet pour Claude

## Projet
Application mobile — stack à définir.
Créateur solo : rcini-ha.

## Mode de travail

### Multi-agent obligatoire pour les tâches complexes
Pour toute tâche non triviale, utilise des agents spécialisés en parallèle :
- **Explore agent** — pour analyser le codebase avant de toucher au code
- **Plan agent** — pour concevoir l'architecture avant d'implémenter
- **General-purpose agent** — pour les recherches, comparaisons de librairies, investigations

Ne code jamais directement une feature complexe sans passer par Plan d'abord.

### Workflow standard
1. Lire `IDEES.md` si la tâche touche aux fonctionnalités
2. Planifier avec un agent Plan
3. Implémenter avec des agents parallèles si les tâches sont indépendantes
4. **Écrire les tests unitaires** après chaque service/module
5. Vérifier avec un agent Explore

## Tests — Règles obligatoires

### Principe
**Toujours écrire des tests unitaires après chaque service codé.** Pas de feature sans tests.

### Ce qu'on teste (backend)
| Quoi | Type | Outil |
|------|------|-------|
| Services (logique métier) | Unitaire | Jest + mocks |
| Endpoints critiques | E2E | Jest + supertest |
| Guards / strategies | Unitaire | Jest |

### Ce qu'on NE teste PAS
- Les controllers (couverts par les e2e)
- Prisma directement (toujours mocké dans les tests unitaires)
- Les DTOs (validés par class-validator, pas besoin de tester)

### Conventions
- Fichier de test : `*.spec.ts` à côté du fichier testé
- Toujours mocker `PrismaService` dans les tests unitaires
- Nommer les tests : `describe('ServiceName')` > `describe('methodName')` > `it('should ...')`
- Un test = un comportement précis

### Règle des 35 lignes dans les spec
La règle des 35 lignes s'applique partout, y compris dans les spec. Pattern obligatoire quand le `describe` racine dépasse 35 lignes :

```ts
let service: MonService;
let someMock: jest.Mock;

function mockValidPayload() { someMock.mockResolvedValue({ ... }); }

function setupBeforeEach() {
  beforeEach(async () => {
    // setup NestJS module
    someMock = lib.fn as jest.Mock;
  });
}

function describeSucces() {
  describe('méthode - succès', () => {
    it('should ...', async () => { /* inline */ });
  });
}

function describeErreurs() {
  describe('méthode - erreurs', () => {
    it('should throw ...', async () => { /* inline */ });
  });
}

describe('MonService', () => {
  setupBeforeEach();
  describeSucces();
  describeErreurs();
});
```

Règles associées :
- Variables partagées (`service`, mocks) → `let` au niveau module
- Setup mock répété (>5 lignes) → fonction `mockXxx()` au niveau module
- Cast mock répété (`lib.fn as jest.Mock`) → variable `let xxxMock: jest.Mock` dans `beforeEach`
- Corps des `it()` → toujours **inline**, jamais extrait en fonction séparée

### Commandes
```bash
# Lancer les tests dans le conteneur
docker compose exec backend npm test

# Avec coverage
docker compose exec backend npm run test:cov

# Watch mode
docker compose exec backend npm run test:watch
```

## Stack validée

| Couche | Techno |
|--------|--------|
| Mobile | React Native + Expo |
| Maps | react-native-maps |
| Backend | NestJS |
| BDD | PostgreSQL + PostGIS |
| ORM | Prisma |
| Temps réel | Socket.IO |
| Auth | JWT + Passport |
| Hosting DB | PostgreSQL + PostGIS en conteneur Docker |

- Langage : TypeScript partout (front + back)
- Cible : iOS + Android
- Gestionnaire de paquets : npm

> **Règle absolue** : toutes les installations de packages se font **dans le conteneur Docker**, jamais sur la machine hôte.
> ```bash
> # Mobile
> docker compose exec mobile npx expo install <package>
> docker compose exec mobile npm install <package>
> # Backend
> docker compose exec backend npm install <package>
> ```

## Commandes utiles (à compléter)
```bash
# backend
cd backend && npm run start:dev

# mobile
cd mobile && npx expo start

# Docker — lancer tous les services
docker compose up

# Connexion téléphone via WiFi (même réseau)
# 1. Vérifier que LOCAL_IP=10.16.3.1 dans .env correspond à l'IP de la machine
# 2. Lancer les services
docker compose up
# 3. Scanner le QR code affiché par Expo Go directement
```

## Sécurité — Règle fondamentale

**Tout ce qui vient du front doit être vérifié côté back.** Sans exception.

> **Règle absolue** : quand Claude vérifie une logique ou une condition côté front (mobile), il doit **toujours** vérifier que la même logique est appliquée côté back (NestJS). Ne jamais faire confiance à l'utilisateur. Le front peut être contourné, manipulé, ou modifié — seul le backend fait autorité.

| Ce qui vient du front | Ce qu'on vérifie côté back |
|-----------------------|---------------------------|
| ID d'une ressource (event, user…) | L'entité existe en DB |
| Ownership (créateur, owner) | `creatorId === req.user.id` ou rôle ADMIN |
| Accès à un event PRIVATE | Invitation ACCEPTED en DB |
| Capacité d'un event | `count(participations) < capacity` en DB |
| Rôle utilisateur | Toujours lu depuis le JWT / DB, jamais depuis le body |
| Données de formulaire | Validées par DTO + class-validator avant d'entrer dans le service |

- **Ne jamais faire confiance au body** pour des décisions de sécurité (ownership, rôle, accès)
- **Ne jamais exposer** password, refreshToken, providerId dans une réponse API
- **Toujours utiliser `@CurrentUser()`** pour lire l'identité — jamais `req.body.userId`
- **Toujours valider les DTOs** avec `class-validator` + `ValidationPipe(whitelist: true)`

## Ce que Claude ne doit PAS faire
- Committer sans demande explicite
- Pusher sur le remote sans confirmation
- Sur-ingéniérer — garder les solutions simples
- Créer des fichiers inutiles
- **Commencer à coder sans avoir présenté un plan précis et reçu la validation explicite de rcini-ha**

## Règle obligatoire avant tout code

> **Avant d'écrire la moindre ligne de code, Claude doit toujours :**
> 1. Établir un plan précis (fichiers à créer/modifier, logique, ordre des étapes)
> 2. Présenter ce plan à rcini-ha
> 3. Attendre sa validation explicite ("ok", "go", "c'est bon"…)
> 4. Seulement ensuite commencer l'implémentation

**Pas de code sans validation du plan. Sans exception.**

## Documentation

### Règles importantes
- **Toujours lire `docs/` avant de coder** — réutiliser les fonctions et modules existants, ne jamais créer de doublon.
- Avant d'implémenter quoi que ce soit, explorer le codebase avec un agent Explore pour vérifier si ça existe déjà.
- Avant de coder une feature, mettre à jour le fichier `docs/` correspondant. Après validation, coder. Jamais l'inverse.

### Ordre obligatoire avant chaque implémentation
1. Lire `docs/architecture.md` — comprendre les modules et relations
2. Lire `docs/api.md` — vérifier les endpoints existants
3. Lire les JSDoc des services existants — réutiliser ce qui existe
4. Mettre à jour `docs/` si nécessaire
5. Coder
6. Écrire les tests

### Commentaires JSDoc — OBLIGATOIRES
- **Toutes les méthodes publiques** doivent avoir un commentaire JSDoc complet
- **Les méthodes privées** : pas de JSDoc
- **Langue** : français
- Format obligatoire :
```ts
/**
 * Description claire de ce que fait la méthode.
 *
 * @param nomParam - Description du paramètre
 * @returns Description de ce qui est retourné
 * @throws NomException si condition d'erreur
 */
```
- Swagger lit ces commentaires — une bonne JSDoc = une bonne doc API automatique

### Structure
```
docs/
├── architecture.md   — schéma DB, modules, flux globaux
├── api.md            — endpoints REST (mis à jour manuellement)
├── auth.md           — flux d'authentification
└── deployment.md     — Docker, variables d'env, démarrage
```

### Outils
- **Swagger** — auto-généré par NestJS, accessible sur `/api/docs` (pour tester l'API dans le navigateur)
- **docs/** — markdown que Claude lit et met à jour
- **PDF** — généré via `pandoc` depuis les markdown à la demande

### Commandes doc
```bash
# Générer un PDF depuis tous les docs
pandoc docs/*.md -o wordevent-doc.pdf
```

## Fichiers importants
- `IDEES.md` — toutes les idées brutes du projet
- `CLAUDE.md` — ce fichier
- `docs/` — documentation technique maintenue par Claude
- `memory/` — mémoire persistante de Claude

## Infrastructure Docker

### Contrainte machine
- Pas de sudo sur la machine — toutes les commandes Docker doivent fonctionner sans sudo
- L'utilisateur doit être dans le groupe `docker` (`newgrp docker` si besoin)
- Ne jamais suggérer `sudo docker ...`

### Conteneurs (images Alpine uniquement)
| Conteneur | Image | Rôle |
|-----------|-------|------|
| `db` | `postgis/postgis:16-3.4-alpine` | PostgreSQL + PostGIS — données géospatiales |
| `nginx` | `nginx:alpine` | Reverse proxy — ports 8080/4443 |
| `backend` | `node:18-alpine` | NestJS API + Socket.IO |
| `mobile` | `node:18-alpine` | Expo Metro bundler (dev uniquement) |

### Notes importantes
- Expo Metro bundler tourne dans Docker en dev, mais l'app s'exécute sur le téléphone/émulateur — le device doit pouvoir atteindre l'IP de la machine hôte
- En prod, le conteneur mobile n'existe pas (l'app est buildée et distribuée via les stores)
- Nginx proxy `/api` → NestJS, `/socket.io` → NestJS

### Commandes Docker
```bash
# Démarrer tout
docker compose up

# Rebuild un service
docker compose up --build backend

# Logs
docker compose logs -f backend
```

## Architecture des fichiers

### Règles de découpage — OBLIGATOIRES
- **1 responsabilité = 1 fichier** — jamais de logique mélangée
- **Jamais de code métier dans un controller** — tout passe par le service
- **Jamais de requête Prisma dans un controller** — uniquement dans les services
- Chaque module est autonome et indépendant
- Les helpers/utils partagés vont dans `src/common/`

### Règles de taille — STRICTES
- **Fonction : 35 lignes maximum** — si ça dépasse, découper en sous-fonctions
- **Callbacks aussi** — les callbacks `describe()`, `it()`, `beforeEach()` comptent comme des fonctions : 35 lignes max. Si un `describe` dépasse, le découper en plusieurs `describe` thématiques (ex: `describe('méthode - succès')` / `describe('méthode - erreurs')`)

| Type de fichier | Limite | Action si dépassé |
|----------------|--------|-------------------|
| DTO / Guard / Decorator | 50 lignes | Découper |
| Controller | 100 lignes | Extraire dans le service |
| Service simple | 200 lignes | Découper en sous-services |
| Service complexe | 300 lignes | Créer un sous-dossier `services/` |
| Composant React Native | 200 lignes | Extraire des sous-composants |

- **La vraie règle** : si le fichier n'est pas compréhensible en 30 secondes → trop long, on découpe
- **Quand un service devient trop grand** → le découper en sous-services :
  ```
  events/
  ├── events.service.ts          # orchestrateur — importe les sous-services
  └── services/
      ├── events-crud.service.ts
      ├── events-geo.service.ts
      └── events-access.service.ts
  ```
- **Quand un fichier de types devient grand** → un fichier par entité dans `types/`
- **Quand un helper grossit** → un fichier par responsabilité dans `helpers/`
- Préférer **beaucoup de petits fichiers** à un gros fichier illisible
- Si tu hésites à découper → **découpe**

### Backend — structure NestJS

```
backend/src/
│
├── common/                        # Code partagé entre modules
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── helpers/
│       └── geo.helper.ts          # makePoint, serializePoint (PostGIS)
│
├── prisma/                        # Module Prisma global
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── auth/                          # Module authentification
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   ├── local.strategy.ts
│   │   ├── google.strategy.ts
│   │   └── apple.strategy.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── refresh-token.dto.ts
│
├── users/                         # Module utilisateurs
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       └── update-user.dto.ts
│
├── events/                        # Module événements
│   ├── events.module.ts
│   ├── events.controller.ts
│   ├── events.service.ts
│   ├── events.gateway.ts          # Socket.IO gateway
│   └── dto/
│       ├── create-event.dto.ts
│       ├── update-event.dto.ts
│       └── find-nearby.dto.ts
│
├── participations/                # Module participations
│   ├── participations.module.ts
│   ├── participations.controller.ts
│   └── participations.service.ts
│
├── invitations/                   # Module invitations
│   ├── invitations.module.ts
│   ├── invitations.controller.ts
│   ├── invitations.service.ts
│   └── dto/
│       ├── create-invitation.dto.ts
│       └── update-invitation.dto.ts
│
├── messages/                      # Module chat
│   ├── messages.module.ts
│   ├── messages.controller.ts     # GET historique uniquement
│   ├── messages.service.ts
│   └── messages.gateway.ts        # Socket.IO chat
│
├── places-of-interest/            # Module POI personnels
│   ├── places-of-interest.module.ts
│   ├── places-of-interest.controller.ts
│   ├── places-of-interest.service.ts
│   └── dto/
│       ├── create-place.dto.ts
│       └── update-place.dto.ts
│
├── app.module.ts
└── main.ts
```

### Mobile — structure React Native

```
mobile/src/
│
├── api/                           # Couche réseau
│   ├── client.ts                  # Instance axios + intercepteurs
│   ├── socket.ts                  # Singleton Socket.IO
│   └── endpoints/
│       ├── auth.api.ts
│       ├── events.api.ts
│       ├── participations.api.ts
│       ├── invitations.api.ts
│       ├── messages.api.ts
│       ├── places.api.ts
│       └── users.api.ts
│
├── store/                         # État global Zustand
│   ├── auth.store.ts
│   ├── events.store.ts
│   ├── invitations.store.ts
│   ├── messages.store.ts
│   └── places.store.ts
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── AppNavigator.tsx           # Tab bar principale
│
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── map/
│   │   └── MapScreen.tsx
│   ├── invitations/
│   │   └── InvitationsScreen.tsx
│   ├── chat/
│   │   └── ChatScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
│
├── components/                    # Composants réutilisables
│   ├── map/
│   │   ├── EventMarker.tsx
│   │   ├── PoiMarker.tsx
│   │   ├── EventDetailSheet.tsx
│   │   ├── CreateEventSheet.tsx
│   │   └── CreatePoiSheet.tsx
│   ├── chat/
│   │   └── MessageBubble.tsx
│   ├── invitations/
│   │   └── InvitationCard.tsx
│   └── common/
│       ├── Button.tsx
│       └── Input.tsx
│
├── hooks/                         # Hooks custom
│   ├── useSocket.ts
│   ├── useLocation.ts
│   └── useNearbyEvents.ts
│
├── types/                         # Types TypeScript
│   ├── event.types.ts
│   ├── user.types.ts
│   ├── message.types.ts
│   └── place.types.ts
│
└── utils/
    ├── geo.utils.ts               # Calculs distance, format coords
    └── date.utils.ts
```

### Règles composants React Native — OBLIGATOIRES

#### 1. Responsabilité unique
**1 composant = 1 rôle.** Si tu dois mettre "et" dans la description → trop gros, découper.
```
❌ EventCardWithModalAndActions
✅ EventCard  +  EventModal  +  EventActions
```

#### 2. Props typées — toujours
Toujours un `type Props` explicite en haut du fichier, jamais de `any` :
```tsx
type Props = {
  label: string;
  onPress: () => void;
  onClose?: () => void;  // optionnel avec ?
};
export function MyComponent({ label, onPress, onClose }: Props) { ... }
```

#### 3. Pas de logique dans le JSX
Calculs, filtres, conditions → hors du `return` :
```tsx
// ❌
return <Text>{items.filter(i => i.active).length > 0 ? 'oui' : 'non'}</Text>
// ✅
const hasActive = items.some(i => i.active);
return <Text>{hasActive ? 'oui' : 'non'}</Text>
```

#### 4. Les hooks restent dans les screens
Les composants reçoivent des **données via props**, ils ne fetchent pas eux-mêmes.
- **Screen** → lit le store, fetche, passe les données en props
- **Composant** → reçoit des props, affiche, émet des callbacks

Exceptions acceptées : `useState` pour état UI local (toggle, animation), `useRef`.

#### 5. Callbacks stables
```tsx
// ❌ fonction recréée à chaque render
onPress={() => handleSelect(item)}
// ✅
const handlePress = useCallback(() => handleSelect(item), [item]);
```

#### 6. `useMemo` pour les calculs lourds
```tsx
const visibleItems = useMemo(() => items.filter(i => i.active), [items]);
```

#### 7. Composant complexe → sous-dossier
Quand un composant a besoin de sous-composants propres :
```
components/map/event-detail/
├── EventDetailSheet.tsx    # orchestrateur — exporte le composant principal
├── EventDetailHeader.tsx
└── EventDetailActions.tsx
```

#### 8. Séparation logique — 1 logique = 1 fichier
Chaque responsabilité dans son propre fichier, **sans exception** :

| Responsabilité | Fichier |
|---------------|---------|
| Appels API | `api/endpoints/xxx.api.ts` |
| État global | `store/xxx.store.ts` |
| Logique réutilisable | `hooks/useXxx.ts` |
| Calculs / transformations | `utils/xxx.utils.ts` |
| Types TypeScript | `types/xxx.types.ts` |
| Affichage | `components/xxx/Xxx.tsx` |
| Orchestration (screen) | `screens/xxx/XxxScreen.tsx` |

**Jamais de fetch dans un composant.** Jamais de calcul métier dans un screen. Jamais de style inline complexe — utiliser `StyleSheet.create`.

#### Checklist avant chaque composant
- [ ] Il fait **une seule chose**
- [ ] Il a un **type Props** explicite
- [ ] Pas de fetch/store dedans (sauf screen)
- [ ] Moins de **200 lignes**
- [ ] Callbacks dans `useCallback`
- [ ] Pas de logique dans le `return`
- [ ] Sa logique réutilisable est dans un `hook` ou `util` séparé

### Règle nommage
- Fichiers backend : `kebab-case` (ex: `jwt-auth.guard.ts`)
- Fichiers mobile : `PascalCase` pour composants/écrans, `camelCase` pour le reste
- DTOs : toujours suffixés `.dto.ts`
- Guards : toujours suffixés `.guard.ts`
- Strategies : toujours suffixées `.strategy.ts`

## Décisions d'architecture
- Monorepo : `mobile/` + `backend/` dans le même repo
- Docker Compose pour orchestrer les services en dev
- Alpine pour toutes les images (légèreté)
