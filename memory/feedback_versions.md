---
name: feedback_versions
description: Ne jamais hardcoder les versions dans package.json — toujours utiliser npm install
type: feedback
---

Ne jamais éditer package.json manuellement pour ajouter ou modifier des versions de packages.

**Why:** Risque de mettre des versions au hasard ou incompatibles. npm install résout automatiquement la dernière version compatible.

**How to apply:** Toujours utiliser `docker compose exec backend npm install <package>` (ou `npm install <package>@latest` pour forcer la toute dernière). Jamais de modification manuelle de package.json pour les versions.
