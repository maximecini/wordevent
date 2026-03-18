.PHONY: up down build logs logs-backend logs-db migrate seed test test-cov shell-backend shell-db clean fclean

# ── Cycle de vie ──────────────────────────────────────────────────────────────

up:
	docker compose up

up-build:
	docker compose up --build

down:
	docker compose down

build:
	docker compose build backend

# ── Logs ──────────────────────────────────────────────────────────────────────

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-db:
	docker compose logs -f db

logs-nginx:
	docker compose logs -f nginx

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
	docker compose down --volumes --remove-orphans
	docker image rm wordevent-backend 2>/dev/null || true

fclean: clean
	docker system prune -af --volumes
