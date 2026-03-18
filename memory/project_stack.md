# Stack technique — wordevent

## Stack validée

| Couche | Techno |
|--------|--------|
| Backend | NestJS (TypeScript) |
| BDD | PostgreSQL 16 + PostGIS |
| SQL | Raw SQL pur — pg (node-postgres) |
| Temps réel | Socket.IO |
| Auth | JWT + Refresh token + Passport + Google/Apple/Facebook OAuth |
| Hosting DB | PostgreSQL + PostGIS en conteneur Docker |

## Ce qui a été retiré
- Pas de React Native / Expo — plus de couche mobile dans ce repo
- Pas de Prisma — remplacé par Raw SQL avec `pg` (node-postgres)
- Pas de Zustand / react-native-maps

## Conteneurs Docker

| Conteneur | Image | Rôle |
|-----------|-------|------|
| `db` | `postgis/postgis:16-3.4-alpine` | PostgreSQL + PostGIS |
| `nginx` | `nginx:alpine` | Reverse proxy — port 8080 |
| `backend` | `node:20-alpine` | NestJS API + Socket.IO |

## Migrations
- Fichiers SQL dans `backend/db/migrations/`
- Script d'exécution : `backend/db/migrate.ts`
- Seed : `backend/db/seed.ts`
- Commandes :
  ```bash
  docker compose exec backend npm run migrate
  docker compose exec backend npm run seed
  ```

## Gestionnaire de paquets
- npm
- Installations toujours dans le conteneur : `docker compose exec backend npm install <package>`
