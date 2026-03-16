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

| Variable | Description | Exemple |
|----------|-------------|---------|
| POSTGRES_USER | User PostgreSQL | wordevent |
| POSTGRES_PASSWORD | Password PostgreSQL | wordevent_pass |
| POSTGRES_DB | Nom de la base | wordevent |
| DATABASE_URL | URL de connexion Prisma | postgresql://... |
| JWT_SECRET | Secret de signature JWT | changeme |
| ADMIN_EMAIL | Email du compte admin | admin@wordevent.com |
| ADMIN_PASSWORD | Password du compte admin | Admin1234! |
| NGINX_HTTP_PORT | Port HTTP Nginx | 8080 |
| NGINX_PORT | Port HTTPS Nginx | 4443 |
| APP_PORT | Port NestJS | 3000 |
| DEBUG_PORT | Port debug Node | 9229 |

## Conteneurs

| Conteneur | Image | Port |
|-----------|-------|------|
| db | postgis/postgis:16-3.4-alpine | 5432 |
| backend | node:18-alpine | 3000 |
| mobile | node:20-alpine | 8081, 19000 |
| nginx | nginx:alpine | 8080, 4443 |

## Commandes Makefile

```bash
make              # démarrer tout
make down         # arrêter
make restart      # redémarrer
make logs         # logs tous services
make logs-backend # logs NestJS
make logs-mobile  # logs Expo
make logs-db      # logs PostgreSQL
make clean        # supprimer conteneurs + volumes
make fclean       # supprimer tout + images
make re           # rebuild complet
```

## Variables d'environnement mobile

Créer `mobile/.env` à partir de `mobile/.env` (fichier versionné avec valeurs vides) :

| Variable | Description | Exemple |
|----------|-------------|---------|
| EXPO_PUBLIC_API_URL | URL de l'API backend (via Nginx) | http://192.168.1.x:4443/api |
| EXPO_PUBLIC_GOOGLE_MAPS_API_KEY | Clé API Google Maps (Android/iOS) | AIzaSy... |

> **Note** : Pour tester sur téléphone physique, remplacer `localhost` par l'IP de la machine hôte.
> Pour un tunnel Expo Go : lancer `docker attach wordevent-mobile-1`, appuyer sur `t`.

## Base de données

```bash
# Appliquer les migrations
docker compose exec backend npx prisma migrate dev

# Créer le compte admin
docker compose exec backend npx prisma db seed

# Ouvrir Prisma Studio (interface visuelle)
docker compose exec backend npx prisma studio
```
