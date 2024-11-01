help: ## Display this help message
	@echo "Please use \`make <target>\` where <target> is one of:"
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

node_modules: package.json ## Install dependencies
	npm install

test: node_modules ## Run automated tests
	npm test

format: node_modules ## Format the codebase
	npm run format

build: format ## Build a distributable
	npm run build

run: build ## Run the current build
	npm run server:start
