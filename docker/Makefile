.PHONY: help build-dev build-prod dev dev-logs prod up down restart logs clean check-env

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

# Check if .env file exists
check-env:
	@if [ ! -f ../.env ]; then \
		echo "$(RED)Error: .env file not found in parent directory!$(NC)"; \
		echo "$(YELLOW)Please create ../.env file with required environment variables.$(NC)"; \
		echo "$(YELLOW)You can copy from ../.env.example$(NC)"; \
		exit 1; \
	fi

help: ## Show this help message
	@echo "$(GREEN)Dev Manager Backend - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

build-dev: check-env ## Build development Docker images
	@echo "$(GREEN)Building development images...$(NC)"
	docker-compose -f docker-compose.dev.yml --env-file ../.env build

build-prod: check-env ## Build production Docker images
	@echo "$(GREEN)Building production images...$(NC)"
	docker-compose -f docker-compose.prod.yml --env-file ../.env build

dev: check-env ## Start development environment in background
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml --env-file ../.env up -d
	@echo "$(GREEN)Development server is running at http://localhost:3333$(NC)"
	@echo "$(YELLOW)Run 'make logs' to see the logs$(NC)"

dev-logs: check-env ## Start development environment with live logs
	@echo "$(GREEN)Starting development environment with live logs...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop (containers will keep running)$(NC)"
	@echo ""
	docker-compose -f docker-compose.dev.yml --env-file ../.env up

prod: check-env ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml --env-file ../.env up -d
	@echo "$(GREEN)Production server is running at http://localhost:3333$(NC)"
	@echo "$(YELLOW)Run 'make logs-prod' to see the logs$(NC)"

up: dev ## Alias for 'dev' command

down: ## Stop and remove development containers
	@echo "$(YELLOW)Stopping development containers...$(NC)"
	docker-compose -f docker-compose.dev.yml --env-file ../.env down

down-prod: ## Stop and remove production containers
	@echo "$(YELLOW)Stopping production containers...$(NC)"
	docker-compose -f docker-compose.prod.yml --env-file ../.env down

restart: ## Restart development environment
	@echo "$(YELLOW)Restarting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml --env-file ../.env restart

restart-prod: ## Restart production environment
	@echo "$(YELLOW)Restarting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml --env-file ../.env restart

logs: ## View development logs (follow mode)
	docker-compose -f docker-compose.dev.yml --env-file ../.env logs -f

logs-prod: ## View production logs (follow mode)
	docker-compose -f docker-compose.prod.yml --env-file ../.env logs -f

logs-app: ## View only app logs (development)
	docker-compose -f docker-compose.dev.yml --env-file ../.env logs -f app

logs-db: ## View only database logs (development)
	docker-compose -f docker-compose.dev.yml --env-file ../.env logs -f mysql

ps: ## List running containers
	docker-compose -f docker-compose.dev.yml --env-file ../.env ps

ps-prod: ## List running production containers
	docker-compose -f docker-compose.prod.yml --env-file ../.env ps

shell-app: ## Open shell in development app container
	docker exec -it dev-manager-backend-dev sh

shell-app-prod: ## Open shell in production app container
	docker exec -it dev-manager-backend-prod sh

shell-db: ## Open MySQL shell
	docker exec -it dev-manager-mysql-dev mysql -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE}

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Warning: This will remove all containers, volumes, and images!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or Enter to continue...$(NC)"
	@read dummy
	docker-compose -f docker-compose.dev.yml --env-file ../.env down -v
	docker-compose -f docker-compose.prod.yml --env-file ../.env down -v
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

rebuild-dev: down build-dev dev ## Rebuild and restart development environment

rebuild-prod: down-prod build-prod prod ## Rebuild and restart production environment

install: ## Install packages and restart (no rebuild needed)
	@echo "$(GREEN)Installing packages and restarting...$(NC)"
	docker-compose -f docker-compose.dev.yml --env-file ../.env restart app
	@echo "$(GREEN)Done! Packages will be installed on container startup.$(NC)"
