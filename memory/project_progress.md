# Avancement — wordevent

## Phases

| Phase | Description | Statut |
|-------|-------------|--------|
| 1 | Setup projet (Docker, NestJS, PostgreSQL/PostGIS) | ✅ |
| 2 | Module Auth (JWT, local strategy) | ✅ |
| 3 | Module Users | ✅ |
| 4 | Module Events (CRUD + géospatial) | ✅ |
| 5 | Module Participations | ✅ |
| 6 | Module Invitations (events privés) | ✅ |
| 7 | Module Messages (chat Socket.IO) | ✅ |
| 8 | Module Places of Interest | ✅ |
| 9 | Tests E2E | À faire |
| 10 | Finalisation / optimisation | À faire |

## Migration vers Raw SQL
- Prisma retiré du projet
- DatabaseModule (pg) remplace PrismaModule
- Migrations SQL dans `backend/db/migrations/`
