# wordevent

API REST + temps réel — NestJS · PostgreSQL/PostGIS · Socket.IO · Docker

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) (sans sudo — ajouter l'utilisateur au groupe `docker`)
- Make

```bash
# Vérifier que Docker fonctionne sans sudo
docker ps
```

---

## Installation

### 1. Cloner le repo

```bash
git clone <url-du-repo>
cd wordevent
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editer `.env` et remplir les valeurs :

| Variable | Description |
|----------|-------------|
| `DB_USER` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `DB_NAME` | Nom de la base |
| `ADMIN_EMAIL` | Email du compte admin initial |
| `ADMIN_PASSWORD` | Mot de passe du compte admin initial |
| `GOOGLE_CLIENT_ID` | Client ID Google OAuth |
| `APPLE_CLIENT_ID` | Bundle ID Apple Sign In |
| `FACEBOOK_APP_ID` | App ID Facebook |
| `FACEBOOK_APP_SECRET` | App Secret Facebook |
| `HOST_IP` | IP locale (mobile Expo uniquement) |

### 3. Configurer les secrets JWT

```bash
mkdir -p secrets
```

Créer `secrets/jwt.env` :

```env
JWT_SECRET=<générer avec la commande ci-dessous>
JWT_REFRESH_SECRET=<générer avec la commande ci-dessous>
```

Générer des secrets sécurisés :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Les secrets JWT ne sont jamais commités — `secrets/` est dans `.gitignore`.

---

## Démarrage

```bash
make up-build   # premier démarrage (build + migrations + logs)
```

Les prochains démarrages :

```bash
make up         # démarrer sans rebuild
```

L'API est accessible sur `http://localhost:8080/api`
Swagger : `http://localhost:8080/api/docs`

---

## Commandes

### Cycle de vie

```bash
make up           # démarrer tous les services
make up-build     # rebuild + démarrer
make down         # arrêter
make re           # rebuild complet (down + up-build)
```

### Logs

```bash
make logs           # tous les services
make logs-backend   # NestJS uniquement
make logs-db        # PostgreSQL uniquement
make logs-nginx     # Nginx uniquement
```

### Base de données

```bash
make migrate      # appliquer les migrations
make seed         # créer le compte admin initial
make shell-db     # accès psql dans le conteneur
```

### Tests

```bash
make test         # lancer les tests
make test-cov     # avec coverage
make test-watch   # mode watch
```

### Shells

```bash
make shell-backend   # shell dans le conteneur backend
make shell-db        # psql dans le conteneur db
```

### Nettoyage

```bash
make clean    # supprimer conteneurs + volumes
make fclean   # supprimer tout + images Docker
```

---

## Mobile (React Native + Expo)

```bash
make mobile-up          # démarrer le conteneur mobile
make mobile-up-build    # rebuild + démarrer
make mobile-logs        # logs Expo
make mobile-shell       # shell dans le conteneur

# Installer un package (toujours via cette commande)
make mobile-install pkg=<package>
```

---

## Stack

| Couche | Techno |
|--------|--------|
| Backend | NestJS (TypeScript) |
| Base de données | PostgreSQL 16 + PostGIS |
| Temps réel | Socket.IO |
| Auth | JWT + Passport (Local, Google, Apple, Facebook) |
| Reverse proxy | Nginx |
| Conteneurs | Docker Compose (Alpine) |
