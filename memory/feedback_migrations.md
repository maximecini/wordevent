---
name: Toujours créer une migration Prisma
description: Chaque modification du schéma DB doit passer par une migration Prisma, jamais par prisma db push ou SQL direct
type: feedback
---

Toujours créer une migration Prisma pour toute modification du schéma (ajout de colonne, enum, table, index…).

**Why:** L'utilisateur veut que `docker compose up` applique automatiquement les migrations via `prisma migrate deploy`. Si une migration manque, le schéma ne se synchronise pas en production/dev.

**How to apply:** Après tout changement dans `schema.prisma`, créer immédiatement le fichier de migration avec `prisma migrate dev --name <description>` (ou manuellement si prisma migrate dev ne peut pas tourner). Ne jamais utiliser `prisma db push` ni modifier la DB directement en SQL.
