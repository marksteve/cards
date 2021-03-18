DEFAULT: test

node_modules:
	yarn

test: node_modules
	yarn test

format: node_modules
	yarn prettier --write .
