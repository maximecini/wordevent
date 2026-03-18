# Déploiement — wordevent

## Prérequis

- Docker (sans sudo — user dans le groupe `docker`)
- Make

## Démarrage rapide

```bash
cp .env.example .env   # remplir les variables
make                   # build + démarrage
```

## Variables d'environnement

L'application valide les variables requises au démarrage et refuse de booter si l'une manque.

### Requises (throw au boot si absentes)

| Variable | Description | Exemple |
|----------|-------------|---------|
| DB_USER | User PostgreSQL | wordevent |
| DB_PASSWORD | Password PostgreSQL | wordevent_pass |
| DB_NAME | Nom de la base | wordevent |
| JWT_SECRET | Secret de signature JWT (access token) | changeme |
| JWT_REFRESH_SECRET | Secret de signature refresh token | changeme_refresh |
| GOOGLE_CLIENT_ID | Client ID Google OAuth | xxx.apps.googleusercontent.com |
| APPLE_CLIENT_ID | Bundle ID Apple | com.wordevent.app |
| APPLE_TEAM_ID | Team ID Apple Developer | XXXXXXXXXX |
| APPLE_KEY_ID | Key ID Apple Sign In | XXXXXXXXXX |
| APPLE_PRIVATE_KEY | Clé privée Apple (.p8) | -----BEGIN PRIVATE KEY----- |
| FACEBOOK_APP_ID | App ID Facebook | 123456789 |
| FACEBOOK_APP_SECRET | App Secret Facebook | abc123... |

### Optionnelles (fallback si absentes)

| Variable | Description | Défaut |
|----------|-------------|--------|
| DB_HOST | Hôte PostgreSQL (nom du service Docker) | localhost |
| DB_PORT | Port PostgreSQL | 5432 |
| PORT | Port d'écoute NestJS | 3000 |
| FRONTEND_URL | Origine autorisée pour Socket.IO CORS | http://localhost:3000 |

### Autres (seed uniquement)

| Variable | Description | Exemple |
|----------|-------------|---------|
| ADMIN_EMAIL | Email du compte admin initial | admin@wordevent.com |
| ADMIN_PASSWORD | Password du compte admin initial | Admin1234! |

## Conteneurs

| Conteneur | Image | Port |
|-----------|-------|------|
| db | postgis/postgis:16-3.4-alpine | 5432 |
| backend | node:20-alpine | 3000 |
| nginx | nginx:alpine | 8080 |

## Commandes Makefile

```bash
make              # démarrer tout
make down         # arrêter
make restart      # redémarrer
make logs         # logs tous services
make logs-backend # logs NestJS
make logs-db      # logs PostgreSQL
make clean        # supprimer conteneurs + volumes
make fclean       # supprimer tout + images
make re           # rebuild complet
```

## Base de données

```bash
# Appliquer les migrations
docker compose exec backend npm run migrate

# Créer le compte admin
docker compose exec backend npm run seed
```
