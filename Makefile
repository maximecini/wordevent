.PHONY: up up-build re down build logs logs-backend logs-db logs-nginx migrate seed test test-cov test-watch shell-backend shell-db clean fclean mobile-up mobile-up-build mobile-down mobile-logs mobile-shell mobile-install

# ── Cycle de vie ──────────────────────────────────────────────────────────────

up:
	docker compose --profile backend up -d
	docker compose exec backend npm run migrate
	docker compose --profile backend logs -f

re: down up-build

up-build:
	docker compose --profile backend up --build -d
	docker compose exec backend npm run migrate
	docker compose --profile backend logs -f

down:
	docker compose --profile backend down

build:
	docker compose --profile backend build backend

# ── Logs ──────────────────────────────────────────────────────────────────────

logs:
	docker compose --profile backend logs -f

logs-backend:
	docker compose --profile backend logs -f backend

logs-db:
	docker compose logs -f db

logs-nginx:
	docker compose --profile backend logs -f nginx

# ── Base de données ───────────────────────────────────────────────────────────

migrate:
	docker compose exec backend npm run migrate

seed:
	docker compose exec backend npm run seed

# ── Tests ─────────────────────────────────────────────────────────────────────

test:
	docker compose exec backend npm test

test-cov:
	docker compose exec backend npm run test:cov

test-watch:
	docker compose exec backend npm run test:watch

# ── Shells ────────────────────────────────────────────────────────────────────

shell-backend:
	docker compose exec backend sh

shell-db:
	docker compose exec db psql -U $${DB_USER} -d $${DB_NAME}

# ── Nettoyage ─────────────────────────────────────────────────────────────────

clean:
	docker compose --profile backend down --volumes --remove-orphans
	docker image rm wordevent-backend 2>/dev/null || true

fclean: clean
	docker system prune -af --volumes

# ── Mobile ────────────────────────────────────────────────────────────────────

mobile-up:
	docker compose --profile mobile up mobile

mobile-up-build:
	docker compose --profile mobile up --build mobile

mobile-down:
	docker compose --profile mobile down

mobile-logs:
	docker compose logs -f mobile

mobile-shell:
	docker compose exec mobile sh

mobile-install:
	docker compose exec mobile npx expo install $(pkg)
	docker compose exec mobile npx expo install --check
