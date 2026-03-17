# wordevent Makefile

all: up

up:
	docker compose up -d --build db backend nginx tunnel
	@echo "Attente de l'URL du tunnel..."
	@URL=""; \
	while [ -z "$$URL" ]; do \
		URL=$$(docker compose logs tunnel 2>&1 | grep -o 'https://[a-z0-9]*\.lhr\.life' | tail -1); \
		sleep 1; \
	done; \
	DOMAIN=$$(echo $$URL | sed 's|https://||'); \
	echo "Tunnel actif : $$URL"; \
	sed -i "s|TUNNEL_DOMAIN=.*|TUNNEL_DOMAIN=$$DOMAIN|" .env; \
	sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$$URL/api|" mobile/.env; \
	docker compose up -d mobile

down:
	docker compose down

restart:
	docker compose down && make up

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-db:
	docker compose logs -f db

logs-mobile:
	docker compose logs -f mobile

ps:
	docker compose ps

clean:
	docker compose down -v --rmi local

fclean:
	docker compose down -v --rmi all

re: fclean all

seed:
	docker compose exec backend npx prisma db seed

migrate:
	docker compose exec backend npx prisma migrate deploy

.PHONY: all up down restart logs logs-backend logs-db logs-mobile ps clean fclean re seed migrate
