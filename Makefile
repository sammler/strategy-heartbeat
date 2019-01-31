REPO = sammlerio
SERVICE = strategy-heartbeat
VER = latest
SIZE = $(shell docker images --format "{{.Repository}} {{.Size}}" | grep strategy-heartbeat | cut -d\   -f2)
NODE_VER := $(shell cat .nvmrc)

help:																		## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

gen-readme:															## Generate README.md (using docker-verb).
	docker run --rm -v ${PWD}:/opt/verb stefanwalther/verb
.PHONY: gen-readme

build:																	## Build the docker image.
	docker build --build-arg NODE_VER=$(NODE_VER) --force-rm -t ${REPO}/${SERVICE} -f Dockerfile.prod .
.PHONY: build

build-test:															## Build the docker image (test image)
	docker build --force-rm -t ${REPO}/${SERVICE}-test --force-rm -f Dockerfile.test .
.PHONY: build-test

up:																			## Start services (daemon mode).
	docker-compose -f docker-compose.yml up -d
.PHONY: up

down:
	docker-compose -f -docker-compose.yml down
.PHONY: down

up-deps-i:															## Start required services for development (interactive mode).
	docker-compose -f docker-compose.deps.yml up
.PHONY: up-deps-i

up-deps:																## Start required services (daemon mode).
	docker-compose -f docker-compose.deps.yml up -d
.PHONY: up-deps

down-deps:															## Tear down services required for development
	docker-compose -f docker-compose.deps.yml down -t 0
.PHONY: down-deps

clean-deps: down-deps										## Tear down dependent service + clean-up artifacts.
	rm -rf ./.datastore
	killall -9 node
.PHONY: clean-deps

up-dev:
	docker-compose -f docker-compose.dev.yml up -d
.PHONY: up-dev

up-dev-i: build
	docker-compose -f docker-compose.dev.yml up
.PHONY: up-dev-i

down-dev:
	docker-compose -f docker-compose.dev.yml down -t 0
.PHONY: down-dev

res-dev-i: down-dev up-dev-i						## Restart the development environment
.PHONY: res-dev-i

get-image-size:
	docker images --format "{{.Repository}} {{.Size}}" | grep ${REPO}/${SERVICE} | cut -d\   -f2
.PHONY: get-image-size

circleci-validate: 											## Validate the circleci config.
	circleci config validate
.PHONY: circleci-validate

circleci-build:													## Build circleci locally.
	circleci build
.PHONY: circleci-build

up-test:																## Bring up the test environment (docker-compose up => docker-compose.test.yml)
	docker-compose --f=docker-compose.test.yml up -d
.PHONY: up-test

run-tests: 															## Run tests (+ unit tests) tests
	docker-compose --f=docker-compose.test.yml run strategy-heartbeat-test npm run test
	docker-compose --f=docker-compose.test.yml down -t 0
.PHONY: run-test

run-unit-tests: 												## Run unit-tests
	docker-compose --f=docker-compose.test.yml run ${SERVICE}-test npm run test:unit
	docker-compose --f=docker-compose.test.yml down -t 0
.PHONY: run-test

run-integration-tests: 									## Run integration-test
	docker-compose --f=docker-compose.test.yml run ${SERVICE}-test npm run test:integration
	docker-compose --f=docker-compose.test.yml down -t 0
.PHONY: run-test

circleci:																## Simulate CircleCI tests
	$(MAKE) build
	$(MAKE) build-test
	$(MAKE) run-unit-tests
	$(MAKE) run-integration-tests
.PHONY: circleci
