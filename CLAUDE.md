# wordevent — Contexte projet pour Claude

## Projet
Application backend — API REST + temps réel.
Créateur solo : rcini-ha.

## Mode de travail

### Réécriture obligatoire du prompt avant toute tâche

**Avant de traiter une demande, Claude doit systématiquement :**

1. **Lancer un agent général (general-purpose)** chargé de réécrire et clarifier le prompt reçu :
   - Reformuler la demande en termes clairs et techniques
   - Identifier les sujets, contextes et sous-tâches distincts
   - Retourner un prompt structuré et sans ambiguïté

2. **Si plusieurs sujets ou contextes sont détectés** → diviser en autant d'agents spécialisés, un par contexte :
   - Chaque agent traite un sujet unique et indépendant
   - Les agents parallèles sont lancés en même temps si les sujets sont indépendants
   - Les agents séquentiels sont lancés dans l'ordre si l'un dépend de l'autre

> **Règle** : 1 contexte = 1 agent. Ne jamais mélanger deux sujets dans un seul agent.

3. **Lancer un agent Plan (architecture)** après la réécriture du prompt, avant toute implémentation :
   - Analyse l'impact architectural de la demande (fichiers concernés, modules touchés, dépendances)
   - Produit un plan précis : fichiers à créer/modifier, ordre des étapes, interfaces entre modules
   - Ce plan est soumis à rcini-ha pour validation avant de coder quoi que ce soit

> **Ordre obligatoire** : agent réécriture → agent architecture → validation rcini-ha → implémentation

### Multi-agent obligatoire pour les tâches complexes
Pour toute tâche non triviale, utilise des agents spécialisés en parallèle :
- **Explore agent** — pour analyser le codebase avant de toucher au code
- **Plan agent** — pour concevoir l'architecture avant d'implémenter
- **General-purpose agent** — pour les recherches, comparaisons de librairies, investigations

Ne code jamais directement une feature complexe sans passer par Plan d'abord.

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
2. Planifier avec un agent Plan
3. **Lancer un agent dédié pour écrire les tests unitaires** avant d'implémenter (TDD)
4. Implémenter avec des agents parallèles si les tâches sont indépendantes
5. Vérifier avec un agent Explore

## Tests — Règles obligatoires

### Principe — TDD obligatoire
**Les tests unitaires sont écrits AVANT le code d'implémentation.** Un agent dédié est lancé pour rédiger les specs (`*.spec.ts`) sur la base du plan architectural, avant qu'un seul fichier de service soit créé.

> **Ordre impératif** : plan validé → agent tests → tests écrits → agent implémentation → code

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

> **Règle absolue** : toutes les installations de packages se font **dans le conteneur Docker**, jamais sur la machine hôte.
> ```bash
> # Backend
> docker compose exec backend npm install <package>
>
> # Mobile — toujours utiliser expo install (résout les versions compatibles avec le SDK Expo)
> docker compose exec mobile npx expo install <package>
> docker compose exec mobile npx expo install --check
> ```

> **Règle absolue (mobile)** : ne jamais utiliser `npm install` pour le mobile. Toujours passer par `make mobile-install` qui installe ET vérifie la compatibilité automatiquement.
> ```bash
> # Installer un package mobile — commande unique obligatoire
> make mobile-install pkg=<package>
> # Équivalent à :
> # docker compose exec mobile npx expo install <package>
> # docker compose exec mobile npx expo install --check
> ```

> **Règle absolue** : ne jamais éditer `package.json` manuellement pour ajouter ou modifier une version. Toujours utiliser `npm install` qui résout et inscrit automatiquement la dernière version compatible.
> ```bash
> # Installer un package (dernière version compatible)
> docker compose exec backend npm install <package>
>
> # Forcer la toute dernière version
> docker compose exec backend npm install <package>@latest
>
> # Mettre à jour TOUS les packages à la dernière version (majeure incluse)
> docker compose exec backend npx npm-check-updates -u
> docker compose exec backend npm install
> ```

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
