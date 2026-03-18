# wordevent — Contexte projet pour Claude

## Projet
Application backend — API REST + temps réel.
Créateur solo : rcini-ha.

## Mode de travail

### Lecture des messages

> **Règle** : toujours interpréter le sens probable du message plutôt que sa forme littérale. Si le sens reste ambigu après interprétation, poser une question courte pour clarifier — jamais reformuler le message à voix haute.

### Agents spécialisés — usage ciblé

Utilise des agents spécialisés quand la tâche le justifie :
- **Explore agent** — avant de toucher au code sur un module inconnu ou étendu
- **Plan agent** — pour toute feature qui touche plusieurs fichiers ou modules
- **General-purpose agent** — pour comparer des librairies, investiguer un bug complexe

> **Règle** : 1 contexte = 1 agent. Ne jamais mélanger deux sujets dans un seul agent.
> Pour les tâches indépendantes, lancer les agents en parallèle.

Ne code jamais directement une feature qui touche plusieurs modules sans passer par Plan d'abord.

### Règle absolue — toutes les commandes dans Docker

**Pas de sudo sur la machine hôte. Pas d'accès direct à l'environnement local.**
Toutes les commandes doivent être exécutées dans le conteneur Docker approprié :

```bash
# Installer une librairie
docker compose exec backend npm install <package>

# Lancer un script, une migration, un seed
docker compose exec backend npm run <script>

# Lancer n'importe quelle commande node/npx
docker compose exec backend npx <command>
```

> **Ne jamais suggérer** `npm install`, `npx`, `node` ou toute autre commande directement sur la machine hôte.

### Workflow standard
1. Lire `IDEES.md` si la tâche touche aux fonctionnalités
2. Lire `docs/architecture.md` et `docs/api.md` — comprendre l'existant, éviter les doublons
3. Lire les JSDoc des services existants — réutiliser ce qui existe
4. Planifier (agent Plan si multi-fichiers, sinon plan inline) et attendre validation
5. Écrire les tests (`*.spec.ts`) — TDD obligatoire
6. Implémenter — agents parallèles si les tâches sont indépendantes
7. Si schéma DB modifié → créer un fichier `db/migrations/XXX_description.sql`
8. Mettre à jour `docs/features.md` et `docs/api.md`
9. Si nouvelle variable d'environnement requise → l'ajouter dans `REQUIRED_VARS` dans `backend/src/config/env.ts`

## Tests — Règles obligatoires

### Principe — TDD obligatoire
**Les tests unitaires sont écrits AVANT le code d'implémentation.** Les specs (`*.spec.ts`) sont rédigées sur la base du plan validé, avant qu'un seul fichier de service soit créé.

> **Ordre impératif** : plan validé → tests écrits → implémentation

Pas de feature sans tests. Pas de code avant les tests.

### Ce qu'on teste (backend)
| Quoi | Type | Outil |
|------|------|-------|
| Services (logique métier) | Unitaire | Jest + mocks |
| Endpoints critiques | E2E | Jest + supertest |
| Guards / strategies | Unitaire | Jest |

### Ce qu'on NE teste PAS
- Les controllers (couverts par les e2e)
- `DatabaseService` directement (toujours mocké dans les tests unitaires)
- Les DTOs (validés par class-validator, pas besoin de tester)

### Conventions
- Fichier de test : `*.spec.ts` à côté du fichier testé
- Toujours mocker `DatabaseService` dans les tests unitaires
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
| Backend | NestJS |
| BDD | PostgreSQL + PostGIS |
| SQL | Raw SQL pur — pg (node-postgres) |
| Temps réel | Socket.IO |
| Auth | JWT + Passport |
| Hosting DB | PostgreSQL + PostGIS en conteneur Docker |

- Langage : TypeScript (backend)
- Gestionnaire de paquets : npm

**Règles d'installation de packages :**
- Jamais sur la machine hôte — toujours dans le conteneur
- Jamais éditer `package.json` manuellement pour les versions

```bash
# Backend
docker compose exec backend npm install <package>
docker compose exec backend npm install <package>@latest   # forcer la dernière version
docker compose exec backend npx npm-check-updates -u && docker compose exec backend npm install  # tout mettre à jour

# Mobile — toujours expo install (résout la compatibilité SDK automatiquement)
make mobile-install pkg=<package>
```

## Commandes utiles (à compléter)
```bash
# backend (dans Docker)
docker compose exec backend npm run start:dev

# Docker — lancer tous les services
docker compose up

# Migrations
docker compose exec backend npm run migrate

# Seed
docker compose exec backend npm run seed
```

## Format de réponse API

- Retourner l'objet directement — pas de wrapper `{ data: ..., success: true }`
- Création (`@Post`) → retourner l'objet créé (201 automatique)
- Suppression (`@Delete`) → retourner `void` (204 automatique)
- Listes → retourner le tableau directement

> **Règle** : ne jamais exposer `password`, `refreshToken`, `providerId` dans une réponse. Toujours sélectionner les colonnes explicitement en SQL.

## Sécurité — Règle fondamentale

**Tout ce qui vient du client doit être vérifié côté back.** Sans exception.

> **Règle absolue** : seul le backend fait autorité. Le client peut être contourné, manipulé, ou modifié — toute logique de sécurité doit être vérifiée côté NestJS.

| Ce qui vient du client | Ce qu'on vérifie côté back |
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
- **Modifier le schéma DB sans créer un fichier de migration** — toute modification de schéma = nouveau fichier `db/migrations/XXX_description.sql`

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
- Avant d'implémenter, explorer le codebase (agent Explore si module inconnu) pour vérifier si ça existe déjà.
- **Toute fonctionnalité opérationnelle** (testée et fonctionnelle côté backend ET en environnement dev) doit être ajoutée à `docs/features.md` avec son statut ✅.

### Règle — suivi des features opérationnelles
Dès qu'une feature est validée fonctionnelle (backend + dev), Claude doit mettre à jour `docs/features.md` :

| Champ | Description |
|-------|-------------|
| Feature | Nom clair de la fonctionnalité |
| Module | Module NestJS concerné |
| Statut | ✅ Fonctionnel / 🚧 En cours / ❌ Bloqué |
| Date | Date de validation |

> **Règle** : une feature non listée dans `docs/features.md` n'est pas considérée comme livrée.

### Règle — mise à jour obligatoire après chaque implémentation

> **Règle absolue** : dès qu'une nouvelle fonction, méthode publique ou endpoint est implémenté(e), Claude doit **immédiatement** mettre à jour la documentation correspondante — avant de terminer la tâche.

| Ce qui a été fait | Doc à mettre à jour |
|-------------------|---------------------|
| Nouvelle feature opérationnelle | `docs/features.md` — ajouter la ligne avec statut ✅ |
| Nouvel endpoint REST | `docs/api.md` — ajouter la route, méthode, description |
| Modification de flux auth | `docs/auth.md` |
| Changement d'architecture / schéma DB | `docs/architecture.md` |

> **Ne jamais** clore une tâche d'implémentation sans avoir mis à jour `docs/`. Une feature non documentée n'est pas livrée.

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
├── deployment.md     — Docker, variables d'env, démarrage
└── features.md       — liste des fonctionnalités opérationnelles (backend + dev)
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
| `backend` | `node:20-alpine` | NestJS API + Socket.IO |
| `mobile` | `node:20-alpine` | React Native + Expo (profile `mobile`, opt-in) |

### Notes importantes
- Nginx proxy `/api` → NestJS, `/socket.io` → NestJS

### Commandes Docker
```bash
# Démarrer tout
docker compose up

# Rebuild un service
docker compose up --build backend

# Logs
docker compose logs -f backend

# Mobile (opt-in via profile)
make mobile-up
make mobile-up-build
make mobile-logs
make mobile-shell
make mobile-install pkg=<package>
```

## Architecture des fichiers

### Règles de découpage — OBLIGATOIRES
- **1 responsabilité = 1 fichier** — jamais de logique mélangée
- **Jamais de code métier dans un controller** — tout passe par le service
- **Jamais de requête SQL dans un controller** — uniquement dans les services
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
├── database/                      # Module base de données (pg)
│   ├── database.module.ts
│   └── database.service.ts        # Pool pg, requêtes SQL brutes
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

backend/db/                        # SQL brut — hors src/
├── migrations/                    # Fichiers SQL de migration (nommés 001_xxx.sql, etc.)
├── migrate.ts                     # Script d'exécution des migrations
└── seed.ts                        # Données initiales (compte admin, etc.)

### Règle migrations — OBLIGATOIRE

**Toute modification du schéma DB = un nouveau fichier de migration.**

- `001_init.sql` — schéma initial complet (ne jamais modifier)
- `002_xxx.sql`, `003_xxx.sql`… — chaque évolution du schéma est un fichier séparé
- **Jamais modifier un fichier de migration existant** — toujours créer un nouveau fichier
- Le nom du fichier décrit ce qu'il fait : `002_add_refresh_token_updated_at.sql`
- Le script `migrate.ts` détecte et applique automatiquement les nouveaux fichiers (idempotent via table `_migrations`)

```bash
# Appliquer les migrations
docker compose exec backend npm run migrate
```
```

### Règle nommage
- Fichiers backend : `kebab-case` (ex: `jwt-auth.guard.ts`)
- DTOs : toujours suffixés `.dto.ts`
- Guards : toujours suffixés `.guard.ts`
- Strategies : toujours suffixées `.strategy.ts`

## Décisions d'architecture
- Monorepo : `backend/` dans le même repo
- Docker Compose pour orchestrer les services en dev
- Alpine pour toutes les images (légèreté)
- Raw SQL pur avec `pg` (node-postgres) — pas d'ORM
