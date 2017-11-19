
help:				## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

d-build: 		## Build the docker image (sammlerio/strategy-heartbeat).
	npm run d-build
.PHONY: d-build

d-run: 			## Run the docker-image.
	npm run d-run
.PHONY: d-run


gen-docs: 	## Generate the README.md file.
	npm run docs
.PHONY: gen-readme
