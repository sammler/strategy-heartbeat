REPO = sammlerio
SERVICE = strategy-heartbeat
VER = latest
SIZE = $(shell docker images --format "{{.Repository}} {{.Size}}" | grep strategy-heartbeat | cut -d\   -f2)

help:																		## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

gen-readme:															## Generate README.md (using docker-verb).
	docker run --rm -v ${PWD}:/opt/verb stefanwalther/verb
.PHONY: gen-readme

up:																			## Start services (daemon mode).
	docker-compose -f docker-compose.yml up -d
.PHONY: up

up-deps-i:															## Start required services for development (interactive mode).
	docker-compose -f docker-compose.deps.yml up
.PHONY: up-deps-i

up-deps:																## Start required services (daemon mode).
	docker-compose -f docker-compose.deps.yml up -d
.PHONY: up-deps

down:
	docker-compose -f -docker-compose.yml down
.PHONY: down

down-deps:															## Tear down services required for development
	docker-compose -f docker-compose.deps.yml down -t 0
.PHONY: down-deps

clean-deps: down-deps										## Tear down dependent service + clean-up artifacts.
	rm -rf ./.datastore
	killall -9 node
.PHONY: clean-deps

build:																	## Build the docker image.
	docker build -t ${REPO}/${SERVICE} .
.PHONY: build

build-no-cache:													## Build the docker image (no-cache).
	docker build --no-cache -t ${REPO}/${SERVICE} .
.PHONY: build-no-cache

build-image:
	$(MAKE) gen-version-file
	docker build -t $(REPO)/$(SERVICE) .
.PHONY: build-image

get-image-size:
	docker images --format "{{.Repository}} {{.Size}}" | grep ${REPO}/${SERVICE} | cut -d\   -f2
.PHONY: get-image-size

circleci-validate: 											## Validate the circleci config.
	circleci config validate
.PHONY: circleci-validate

circleci-build:													## Build circleci locally.
	circleci build
.PHONY: circleci-build

setup:
	@echo "Setup ... nothing here right now"
.PHONY: setup

gen-version-file:
	@SHA=$(shell git rev-parse --short HEAD) \
		node -e "console.log(JSON.stringify({ SHA: process.env.SHA, version: require('./package.json').version, buildTime: (new Date()).toISOString() }))" > version.json
.PHONY: gen-version-file

build-ci:
	$(MAKE) build-image
	docker tag $(REPO)/$(SERVICE):latest $(REPO)/$(SERVICE):$(shell cat ./version.json)
.PHONY: build-ci

test-unit:
	npm run test:unit
.PHONY: test-unit
