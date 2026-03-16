# wordevent Makefile

all: up

up:
	docker compose up --build

down:
	docker compose down

restart:
	docker compose down && docker compose up --build

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

.PHONY: all up down restart logs logs-backend logs-db logs-mobile ps clean fclean re
